// api/quests/route.ts — GET quests filtered by hunter level + POST create custom quest
// Quest resets are handled exclusively by POST /api/quests/reset (called from HunterContext on load)
// GET is read-only — no side effects, no race conditions
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  const quests = await prisma.quest.findMany({
    where: {
      isActive: true,
      unlocksAtLevel: { lte: hunter.level },
    },
    orderBy: [{ isCompleted: "asc" }, { difficulty: "desc" }, { id: "asc" }],
  });

  return NextResponse.json(quests);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, category, difficulty, tier, xpBase, goldBase, statTarget, statGain } = body as {
    title: string;
    category: string;
    difficulty: string;
    tier: string;
    xpBase: number;
    goldBase: number;
    statTarget: string;
    statGain: number;
  };

  if (!title || !category || !statTarget) {
    return NextResponse.json({ error: "title, category, and statTarget are required" }, { status: 400 });
  }

  const validCategories = ["health", "learning", "jobs", "finance", "focus", "food", "mental", "agentiq"];
  const validDifficulties = ["normal", "hard", "legendary"];
  const validTiers = ["daily", "weekly", "custom"];
  const validStats = ["vitality", "intel", "hustle", "wealth", "focus", "agentIQ"];

  const quest = await prisma.quest.create({
    data: {
      title,
      category: validCategories.includes(category) ? category : "focus",
      difficulty: validDifficulties.includes(difficulty) ? difficulty : "normal",
      tier: validTiers.includes(tier) ? tier : "custom",
      xpBase: xpBase || 50,
      goldBase: goldBase || 10,
      statTarget: validStats.includes(statTarget) ? statTarget : "focus",
      statGain: statGain || 1,
      isDaily: tier === "daily",
      isActive: true,
      unlocksAtLevel: 1,
    },
  });

  return NextResponse.json({ success: true, quest });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const questId = Number(searchParams.get("id"));

  if (!questId) {
    return NextResponse.json({ error: "Quest ID required" }, { status: 400 });
  }

  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }

  // Only allow deleting completed quests
  if (!quest.isCompleted) {
    return NextResponse.json(
      { error: "Can only delete completed quests" },
      { status: 400 }
    );
  }

  // Soft delete — mark as inactive so it won't show up or reset
  await prisma.quest.update({
    where: { id: questId },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true, deleted: quest.title });
}
