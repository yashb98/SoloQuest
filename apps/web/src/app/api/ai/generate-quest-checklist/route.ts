// api/ai/generate-quest-checklist/route.ts — AI-generate checklist items for a quest
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getAiCall() {
  const { generateQuestChecklist } = await import("@/lib/ai");
  return generateQuestChecklist;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { questId, title, category, difficulty, description, customInstructions } = body as {
    questId?: number;
    title: string;
    category: string;
    difficulty?: string;
    description?: string;
    customInstructions?: string;
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const generateQuestChecklist = await getAiCall();
    const raw = await generateQuestChecklist(
      title.trim(),
      category || "general",
      difficulty || "normal",
      description,
      customInstructions
    );

    let checklist: Array<{ id: string; text: string; done: boolean }>;
    try {
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      checklist = JSON.parse(cleaned);
      if (!Array.isArray(checklist)) throw new Error("Not an array");
      checklist = checklist
        .map((item, i) => ({
          id: item.id || String(i + 1),
          text: String(item.text || ""),
          done: false,
        }))
        .filter((item) => item.text.trim());
    } catch {
      checklist = [
        { id: "1", text: "Break this quest into smaller parts", done: false },
        { id: "2", text: "Work on the first part for 25 minutes", done: false },
        { id: "3", text: "Review progress and continue", done: false },
      ];
    }

    const checklistJson = JSON.stringify(checklist);

    // If questId provided, save directly to the quest
    if (questId) {
      await prisma.quest.update({
        where: { id: questId },
        data: { checklist: checklistJson },
      });
    }

    return NextResponse.json({ success: true, checklist, checklistJson });
  } catch (err) {
    console.error("[AI] Checklist generation failed:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
