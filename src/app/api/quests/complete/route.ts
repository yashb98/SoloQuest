// api/quests/complete/route.ts — POST complete quest + XP award + level-up
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { effectiveXP } from "@/lib/xp";
import { processXPGain } from "@/lib/leveling";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { questId, notes } = body as { questId: number; notes?: string };

  if (!questId) {
    return NextResponse.json({ error: "questId required" }, { status: 400 });
  }

  // Fetch quest and hunter
  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }
  if (quest.isCompleted) {
    return NextResponse.json(
      { error: "Quest already completed today" },
      { status: 400 }
    );
  }

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  // Calculate effective XP
  const xpEarned = effectiveXP(
    quest.xpBase,
    hunter.level,
    hunter.streak,
    false
  );
  const goldEarned = quest.goldBase;

  // Process level-up
  const levelResult = processXPGain(
    hunter.xp,
    hunter.level,
    hunter.xpToNext,
    xpEarned
  );

  // Build stat increment
  const statIncrement: Record<string, number> = {};
  if (
    ["discipline", "vitality", "intelligence", "hustle", "wealth"].includes(
      quest.statTarget
    )
  ) {
    statIncrement[quest.statTarget] = 1;
  }

  // Update hunter
  await prisma.hunter.update({
    where: { id: 1 },
    data: {
      xp: levelResult.newXP,
      level: levelResult.newLevel,
      rank: levelResult.newRank,
      xpToNext: levelResult.newXPToNext,
      gold: { increment: goldEarned },
      ...statIncrement,
    },
  });

  // Mark quest completed
  await prisma.quest.update({
    where: { id: questId },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // Log completion
  await prisma.completion.create({
    data: {
      questId,
      xpEarned,
      goldEarned,
      notes: notes || null,
    },
  });

  return NextResponse.json({
    success: true,
    xpEarned,
    goldEarned,
    didLevelUp: levelResult.didLevelUp,
    newLevel: levelResult.newLevel,
    newRank: levelResult.newRank,
    isGateLocked: levelResult.isGateLocked,
    gateLevel: levelResult.gateLevel,
    hunter: {
      level: levelResult.newLevel,
      rank: levelResult.newRank,
      xp: levelResult.newXP,
      xpToNext: levelResult.newXPToNext,
      gold: hunter.gold + goldEarned,
    },
  });
}
