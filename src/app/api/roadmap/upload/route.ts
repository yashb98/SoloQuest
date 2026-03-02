// api/roadmap/upload/route.ts — Upload roadmap image/PDF, extract topics, create todos
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractRoadmapFromImage, extractRoadmapFromPdf, extractRoadmapFromText } from "@/lib/ai";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];

interface ExtractedTopic {
  section: string;
  title: string;
  description: string;
  priority: "core" | "recommended" | "optional";
  estimatedHours: number;
  prerequisites?: string[];
  youtubeQuery: string;
  blogUrl: string;
}

// Parse AI JSON response (handles markdown fences)
function parseAIJson(raw: string) {
  let jsonStr = raw.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();
  return JSON.parse(jsonStr);
}

// Build plain-text description for a topic (no markdown)
function buildTopicDescription(topic: ExtractedTopic): string {
  const lines: string[] = [];

  lines.push(`📚 Section: ${topic.section}`);
  lines.push("");
  lines.push(topic.description);
  lines.push("");
  lines.push(`⏱️ Estimated: ~${topic.estimatedHours} hours`);

  const priorityLabel = topic.priority === "core" ? "Core" : topic.priority === "recommended" ? "Recommended" : "Optional";
  lines.push(`🔑 Priority: ${priorityLabel}`);

  if (topic.prerequisites && topic.prerequisites.length > 0) {
    lines.push(`📋 Prerequisites: ${topic.prerequisites.join(", ")}`);
  }

  lines.push("");
  lines.push("Resources:");

  const ytQuery = encodeURIComponent(topic.youtubeQuery || topic.title);
  lines.push(`🎬 YouTube: https://youtube.com/results?search_query=${ytQuery}`);

  if (topic.blogUrl && topic.blogUrl.startsWith("http")) {
    lines.push(`📖 Blog: ${topic.blogUrl}`);
  } else {
    const blogQuery = encodeURIComponent(`${topic.title} tutorial guide`);
    lines.push(`📖 Blog: https://www.google.com/search?q=${blogQuery}`);
  }

  return lines.join("\n");
}

// Spread topics across weeks based on hours
function assignTopicDates(
  topics: ExtractedTopic[],
  totalWeeks: number,
  hoursPerWeek: number
): { topic: ExtractedTopic; date: string }[] {
  const today = new Date();
  const results: { topic: ExtractedTopic; date: string }[] = [];

  // Sort: core first, then recommended, then optional
  const priorityOrder = { core: 0, recommended: 1, optional: 2 };
  const sorted = [...topics].sort(
    (a, b) => (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
  );

  let currentWeek = 0;
  let hoursInWeek = 0;

  for (const topic of sorted) {
    if (hoursInWeek + topic.estimatedHours > hoursPerWeek && hoursInWeek > 0) {
      currentWeek++;
      hoursInWeek = 0;
    }
    if (currentWeek >= totalWeeks) currentWeek = totalWeeks - 1;

    const date = new Date(today);
    date.setDate(date.getDate() + currentWeek * 7);
    const dateStr = date.toISOString().split("T")[0];

    results.push({ topic, date: dateStr });
    hoursInWeek += topic.estimatedHours;
  }

  return results;
}

export async function POST(req: NextRequest) {
  // Check content type to determine if it's FormData or JSON
  const contentType = req.headers.get("content-type") || "";

  // ─── Action: extract (FormData with file upload) ───
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const hint = formData.get("hint") as string | null;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 10MB." },
          { status: 400 }
        );
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Unsupported file type. Use PNG, JPG, WebP, or PDF." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      let raw = "";

      if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
        // Image → Anthropic Vision → Mistral Vision fallback (handled internally)
        const base64 = buffer.toString("base64");
        raw = await extractRoadmapFromImage(base64, file.type, hint || undefined);
      } else {
        // PDF → Anthropic PDF document → Mistral OCR → pdf-parse text fallback
        const pdfBase64 = buffer.toString("base64");
        console.log("[Upload] PDF file size:", file.size, "bytes, base64 length:", pdfBase64.length);

        // Strategy 1: AI-native PDF (Anthropic document → Mistral OCR, handled internally)
        raw = await extractRoadmapFromPdf(pdfBase64, hint || undefined);
        console.log("[Upload] Strategy 1 (native PDF) result:", raw ? `success (${raw.length} chars)` : "empty");

        // Strategy 2: If native PDF failed, try pdf-parse text extraction + AI text analysis
        if (!raw) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require("pdf-parse");
            const pdfData = await pdfParse(buffer);
            const text = pdfData.text || "";
            console.log("[Upload] Strategy 2: pdf-parse extracted", text.trim().length, "chars of text");

            if (text.trim().length > 50) {
              raw = await extractRoadmapFromText(text, hint || undefined);
              console.log("[Upload] Strategy 2 (text) result:", raw ? `success (${raw.length} chars)` : "empty");
            } else {
              console.log("[Upload] Strategy 2 skipped: not enough text extracted from PDF");
            }
          } catch (pdfErr) {
            console.warn("[Upload] Strategy 2 (text extraction) also failed:", (pdfErr as Error).message);
          }
        }
      }

      if (!raw) {
        return NextResponse.json(
          { error: "AI could not extract topics. Make sure the file clearly shows a roadmap. Check that your API keys (Anthropic or Mistral) are valid and have credits." },
          { status: 500 }
        );
      }

      try {
        const data = parseAIJson(raw);

        // Validate structure
        if (!data.topics || !Array.isArray(data.topics)) {
          throw new Error("Invalid response structure");
        }

        // Normalize topics
        const topics = data.topics.map((t: Record<string, unknown>) => ({
          section: String(t.section || "General"),
          title: String(t.title || "Untitled"),
          description: String(t.description || ""),
          priority: ["core", "recommended", "optional"].includes(String(t.priority))
            ? t.priority
            : "recommended",
          estimatedHours: Number(t.estimatedHours) || 3,
          prerequisites: Array.isArray(t.prerequisites) ? t.prerequisites : [],
          youtubeQuery: String(t.youtubeQuery || t.title || ""),
          blogUrl: String(t.blogUrl || ""),
        }));

        return NextResponse.json({
          success: true,
          data: {
            title: String(data.title || "Uploaded Roadmap"),
            topics,
            suggestedWeeks: Number(data.suggestedWeeks) || 12,
            suggestedHoursPerWeek: Number(data.suggestedHoursPerWeek) || 10,
          },
        });
      } catch (parseErr) {
        console.error("Failed to parse AI response:", parseErr, "\nRaw:", raw.slice(0, 500));
        return NextResponse.json(
          { error: "AI returned an invalid response. Please try again." },
          { status: 500 }
        );
      }
    } catch (err) {
      console.error("Upload extraction failed:", err);
      return NextResponse.json(
        { error: "Failed to process upload." },
        { status: 500 }
      );
    }
  }

  // ─── JSON-based actions ───
  const body = await req.json();
  const { action } = body;

  // ─── Action: create_todos ───
  if (action === "create_todos") {
    const { topics, timeline, hoursPerWeek, roadmapId } = body as {
      topics: ExtractedTopic[];
      timeline: number;
      hoursPerWeek: number;
      roadmapId?: number;
    };

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: "No topics provided" }, { status: 400 });
    }

    const weeks = timeline || 12;
    const hours = hoursPerWeek || 10;

    const scheduled = assignTopicDates(topics, weeks, hours);

    // Get max sortOrder
    const lastTodo = await prisma.todoItem.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    let sortOrder = (lastTodo?.sortOrder ?? 0) + 1;

    let created = 0;
    for (const { topic, date } of scheduled) {
      const priorityNum = topic.priority === "core" ? 2 : topic.priority === "recommended" ? 1 : 0;

      await prisma.todoItem.create({
        data: {
          title: topic.title,
          description: buildTopicDescription(topic),
          date,
          category: "learning",
          priority: priorityNum,
          sortOrder: sortOrder++,
          ...(roadmapId ? { roadmapId } : {}),
        },
      });
      created++;
    }

    return NextResponse.json({ success: true, todosCreated: created });
  }

  // ─── Action: create_roadmap_and_todos ───
  if (action === "create_roadmap_and_todos") {
    const { title, topics, timeline, hoursPerWeek, experienceLevel } = body as {
      title: string;
      topics: ExtractedTopic[];
      timeline: number;
      hoursPerWeek: number;
      experienceLevel?: string;
    };

    if (!title || !topics || topics.length === 0) {
      return NextResponse.json({ error: "Title and topics required" }, { status: 400 });
    }

    const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
    if (!hunter) {
      return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
    }

    // Deactivate existing active roadmap
    if (hunter.activeRoadmapId) {
      await prisma.jobRoadmap.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    // Determine timeline string
    const weeks = timeline || 12;
    const timelineStr = weeks <= 13 ? "3m" : weeks <= 27 ? "6m" : "1y";

    // Build milestones from topic sections
    const sections = Array.from(new Set(topics.map((t) => t.section)));
    const milestones = sections.map((section, idx) => ({
      title: section,
      description: `Complete all ${section} topics`,
      weekNumber: Math.round(((idx + 1) / sections.length) * weeks),
      isCompleted: false,
    }));

    // Create roadmap
    const roadmap = await prisma.jobRoadmap.create({
      data: {
        targetRole: title,
        experienceLevel: experienceLevel || "beginner",
        skills: JSON.stringify([]),
        timeline: timelineStr,
        isActive: true,
        milestones: JSON.stringify(milestones),
        summary: `Roadmap uploaded for ${title}. ${topics.length} topics across ${sections.length} sections, planned over ${weeks} weeks at ${hoursPerWeek || 10} hours/week.`,
      },
    });

    // Set as active roadmap
    await prisma.hunter.update({
      where: { id: 1 },
      data: { activeRoadmapId: roadmap.id },
    });

    // Create todos
    const hours = hoursPerWeek || 10;
    const scheduled = assignTopicDates(topics, weeks, hours);

    const lastTodo = await prisma.todoItem.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    let sortOrder = (lastTodo?.sortOrder ?? 0) + 1;

    let created = 0;
    for (const { topic, date } of scheduled) {
      const priorityNum = topic.priority === "core" ? 2 : topic.priority === "recommended" ? 1 : 0;

      await prisma.todoItem.create({
        data: {
          title: topic.title,
          description: buildTopicDescription(topic),
          date,
          category: "learning",
          priority: priorityNum,
          sortOrder: sortOrder++,
          roadmapId: roadmap.id,
        },
      });
      created++;
    }

    return NextResponse.json({
      success: true,
      roadmap: { id: roadmap.id, targetRole: roadmap.targetRole },
      todosCreated: created,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
