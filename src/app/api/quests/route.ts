// api/quests/route.ts — GET quests + POST create + PUT edit + DELETE any quest
// Quest resets are handled exclusively by POST /api/quests/reset (called from HunterContext on load)
// GET is read-only — no side effects, no race conditions
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  const hunterLevel = hunter?.level ?? 1;

  const quests = await prisma.quest.findMany({
    where: { isActive: true, unlocksAtLevel: { lte: hunterLevel } },
    orderBy: [{ isCompleted: "asc" }, { difficulty: "desc" }, { id: "asc" }],
  });

  return NextResponse.json(quests);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, category, difficulty, tier, xpBase, goldBase, statTarget, statGain } = body as {
    title: string;
    description?: string;
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
      description: description || "",
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

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, title, description, category, difficulty, tier, xpBase, goldBase, statTarget, statGain } = body as {
    id: number;
    title?: string;
    description?: string;
    category?: string;
    difficulty?: string;
    tier?: string;
    xpBase?: number;
    goldBase?: number;
    statTarget?: string;
    statGain?: number;
  };

  if (!id) {
    return NextResponse.json({ error: "Quest ID required" }, { status: 400 });
  }

  const quest = await prisma.quest.findUnique({ where: { id } });
  if (!quest) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }

  const validCategories = ["health", "learning", "jobs", "finance", "focus", "food", "mental", "agentiq"];
  const validDifficulties = ["normal", "hard", "legendary"];
  const validTiers = ["daily", "weekly", "custom"];
  const validStats = ["vitality", "intel", "hustle", "wealth", "focus", "agentIQ"];

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (category !== undefined && validCategories.includes(category)) data.category = category;
  if (difficulty !== undefined && validDifficulties.includes(difficulty)) data.difficulty = difficulty;
  if (tier !== undefined && validTiers.includes(tier)) {
    data.tier = tier;
    data.isDaily = tier === "daily";
  }
  if (xpBase !== undefined) data.xpBase = xpBase;
  if (goldBase !== undefined) data.goldBase = goldBase;
  if (statTarget !== undefined && validStats.includes(statTarget)) data.statTarget = statTarget;
  if (statGain !== undefined) data.statGain = statGain;

  const updated = await prisma.quest.update({ where: { id }, data });
  return NextResponse.json({ success: true, quest: updated });
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

  // Soft delete — mark as inactive so it won't show up or reset
  await prisma.quest.update({
    where: { id: questId },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true, deleted: quest.title });
}
