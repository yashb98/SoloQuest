// api/certs/study-plan/route.ts — Cert study plan generation, todo creation, timeline suggestion
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body as { action?: string };

  // --- Generate AI study plan and save to cert ---
  if (action === "generate") {
    const { certId } = body as { certId: number };
    if (!certId) {
      return NextResponse.json({ error: "certId required" }, { status: 400 });
    }

    const cert = await prisma.certRoadmap.findUnique({ where: { id: certId } });
    if (!cert) {
      return NextResponse.json({ error: "Cert not found" }, { status: 404 });
    }

    const hunter = await prisma.hunter.findUnique({ where: { id: 1 } });

    let parsed;
    try {
      const { generateCertStudyPlan } = await import("@/lib/ai");
      const raw = await generateCertStudyPlan({
        certName: cert.certName,
        provider: cert.provider,
        totalWeeks: cert.totalWeeks,
        weeklyHours: cert.weeklyHours,
        hunterLevel: hunter?.level ?? 1,
      });

      if (!raw) throw new Error("Empty AI response");

      // Strip markdown code fences if present
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.warn("[CertStudyPlan] AI generation failed, using fallback:", (err as Error).message);

      // Fallback: generate a generic plan
      const weeks = [];
      for (let w = 1; w <= cert.totalWeeks; w++) {
        const topics = [];
        for (let t = 1; t <= 3; t++) {
          topics.push({
            title: `Study ${cert.certName} - Week ${w} Topic ${t}`,
            description: `Cover key concepts for ${cert.certName} week ${w}, topic ${t}`,
            hours: Math.round(cert.weeklyHours / 3),
            youtubeQuery: `${cert.certName} ${cert.provider} week ${w} tutorial`,
            blogUrl: `https://www.google.com/search?q=${encodeURIComponent(cert.certName + " " + cert.provider + " study guide")}`,
          });
        }
        weeks.push({
          week: w,
          title: `Week ${w}: ${cert.certName} Fundamentals`,
          topics,
        });
      }
      parsed = {
        suggestedWeeks: cert.totalWeeks,
        suggestedHoursPerWeek: cert.weeklyHours,
        weeks,
      };
    }

    // Save the study plan JSON string to cert
    await prisma.certRoadmap.update({
      where: { id: certId },
      data: { studyPlan: JSON.stringify(parsed) },
    });

    return NextResponse.json({ success: true, studyPlan: parsed });
  }

  // --- Create TodoItems from the saved study plan ---
  if (action === "create_todos") {
    const { certId } = body as { certId: number };
    if (!certId) {
      return NextResponse.json({ error: "certId required" }, { status: 400 });
    }

    const cert = await prisma.certRoadmap.findUnique({ where: { id: certId } });
    if (!cert) {
      return NextResponse.json({ error: "Cert not found" }, { status: 404 });
    }

    let studyPlan;
    try {
      studyPlan = JSON.parse(cert.studyPlan);
    } catch {
      return NextResponse.json({ error: "No valid study plan found. Generate one first." }, { status: 400 });
    }

    const weeks = studyPlan.weeks;
    if (!Array.isArray(weeks) || weeks.length === 0) {
      return NextResponse.json({ error: "Study plan has no weeks" }, { status: 400 });
    }

    const startDate = new Date(cert.startDate);
    let todosCreated = 0;

    for (const week of weeks) {
      const weekIndex = (week.week ?? 1) - 1;
      const topics = week.topics || [];

      for (let t = 0; t < topics.length; t++) {
        const topic = topics[t];

        // Calculate date: startDate + (weekIndex * 7) + spread topics across the week
        const topicDate = new Date(startDate);
        const dayOffset = weekIndex * 7 + Math.floor((t * 7) / Math.max(topics.length, 1));
        topicDate.setDate(topicDate.getDate() + dayOffset);
        const dateStr = topicDate.toISOString().split("T")[0];

        // Build description with resources
        const youtubeQuery = topic.youtubeQuery || topic.title;
        const youtubeUrl = `https://youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`;
        const blogUrl = topic.blogUrl || `https://www.google.com/search?q=${encodeURIComponent(topic.title)}`;

        const description = `${topic.description || ""}\n\nResources:\n\uD83C\uDFAC YouTube: ${youtubeUrl}\n\uD83D\uDCD6 Blog: ${blogUrl}`;

        await prisma.todoItem.create({
          data: {
            title: topic.title,
            description: description.trim(),
            date: dateStr,
            category: "learning",
            priority: 1,
            sortOrder: t,
            certId: cert.id,
          },
        });

        todosCreated++;
      }
    }

    return NextResponse.json({ success: true, todosCreated });
  }

  // --- Suggest timeline for a cert using AI ---
  if (action === "suggest_timeline") {
    const { certName, provider } = body as { certName: string; provider: string };
    if (!certName || !provider) {
      return NextResponse.json({ error: "certName and provider required" }, { status: 400 });
    }

    try {
      const { suggestCertTimeline } = await import("@/lib/ai");
      const raw = await suggestCertTimeline(certName, provider);

      if (!raw) throw new Error("Empty AI response");

      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const suggestion = JSON.parse(cleaned);

      return NextResponse.json({
        totalWeeks: suggestion.totalWeeks,
        weeklyHours: suggestion.weeklyHours,
        difficulty: suggestion.difficulty,
        prerequisites: suggestion.prerequisites || [],
        description: suggestion.description,
      });
    } catch (err) {
      console.warn("[CertStudyPlan] Timeline suggestion failed, using fallback:", (err as Error).message);

      return NextResponse.json({
        totalWeeks: 8,
        weeklyHours: 10,
        difficulty: "intermediate",
        prerequisites: [],
        description: "Study plan for " + certName,
      });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
