// api/quests/route.ts — GET quests filtered by hunter level + POST create custom quest
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
