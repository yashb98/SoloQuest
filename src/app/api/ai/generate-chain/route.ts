// api/ai/generate-chain/route.ts — AI-generate a quest chain from a goal
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getAi() {
  const { generateQuestChain } = await import("@/lib/ai");
  return generateQuestChain;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { goal } = body as { goal: string };

  if (!goal?.trim()) {
    return NextResponse.json({ error: "goal is required" }, { status: 400 });
  }

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });

  try {
    const generateQuestChain = await getAi();
    const raw = await generateQuestChain({
      hunterName: hunter?.hunterName || "Hunter",
      level: hunter?.level || 1,
      rank: hunter?.rank || "E",
      goal: goal.trim(),
    });

    if (!raw) throw new Error("Empty AI response");

    // Parse JSON response
    let parsed;
    try {
      // Try to extract JSON array from response
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(raw);
      }
    } catch {
      // Fallback
      return NextResponse.json({
        success: true,
        chain: {
          title: goal.trim(),
          steps: [
            { title: "Research and plan", category: "learning", xpBase: 40, statTarget: "intel" },
            { title: "Set up environment", category: "focus", xpBase: 30, statTarget: "focus" },
            { title: "Implement core feature", category: "focus", xpBase: 80, statTarget: "focus" },
            { title: "Test and debug", category: "learning", xpBase: 50, statTarget: "intel" },
            { title: "Document and ship", category: "jobs", xpBase: 60, statTarget: "hustle" },
          ],
        },
      });
    }

    const steps = (Array.isArray(parsed) ? parsed : []).map((s: Record<string, unknown>) => ({
      title: String(s.title || "Untitled Step"),
      category: String(s.category || "focus"),
      difficulty: String(s.difficulty || "normal"),
      xpBase: Number(s.xpBase) || 50,
      goldBase: Number(s.goldBase) || 10,
      statTarget: String(s.statTarget || "focus"),
    }));

    return NextResponse.json({
      success: true,
      chain: {
        title: goal.trim(),
        steps: steps.length > 0 ? steps : [
          { title: "Start working on: " + goal, category: "focus", xpBase: 50, statTarget: "focus" },
        ],
      },
    });
  } catch (err) {
    console.error("[AI] Chain generation failed:", err);
    return NextResponse.json({
      success: true,
      chain: {
        title: goal.trim(),
        steps: [
          { title: "Research and plan", category: "learning", xpBase: 40, statTarget: "intel" },
          { title: "Set up environment", category: "focus", xpBase: 30, statTarget: "focus" },
          { title: "Implement core feature", category: "focus", xpBase: 80, statTarget: "focus" },
          { title: "Test and iterate", category: "learning", xpBase: 50, statTarget: "intel" },
          { title: "Complete and ship", category: "jobs", xpBase: 60, statTarget: "hustle" },
        ],
      },
    });
  }
}
