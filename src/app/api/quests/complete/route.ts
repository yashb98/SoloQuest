// api/quests/complete/route.ts — Complete quest + XP + level-up + stats + achievements
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { effectiveXP, effectiveGold } from "@/lib/xp";
import { processXPGain } from "@/lib/leveling";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { questId, notes } = body as { questId: number; notes?: string };

  if (!questId) {
    return NextResponse.json({ error: "questId required" }, { status: 400 });
  }

  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }
  if (quest.isCompleted) {
    return NextResponse.json({ error: "Quest already completed" }, { status: 400 });
  }

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  const xpEarned = effectiveXP(
    quest.xpBase, hunter.level, hunter.streak,
    hunter.class, quest.statTarget, false
  );
  const goldEarned = effectiveGold(quest.goldBase, hunter.hustle);

  const levelResult = processXPGain(hunter.xp, hunter.level, hunter.xpToNext, xpEarned);

  const validStats = ["vitality", "intel", "hustle", "wealth", "focus", "agentIQ"];
  const statIncrement: Record<string, number> = {};
  if (validStats.includes(quest.statTarget)) {
    statIncrement[quest.statTarget] = quest.statGain;
  }

  await prisma.hunter.update({
    where: { id: 1 },
    data: {
      xp: levelResult.newXP,
      level: levelResult.newLevel,
      rank: levelResult.newRank,
      xpToNext: levelResult.newXPToNext,
      gold: { increment: goldEarned + levelResult.goldBonus },
      statPoints: { increment: levelResult.statPointsEarned },
      ...statIncrement,
    },
  });

  await prisma.quest.update({
    where: { id: questId },
    data: { isCompleted: true, completedAt: new Date() },
  });

  await prisma.completion.create({
    data: { questId, xpEarned, goldEarned, notes: notes || null },
  });

  return NextResponse.json({
    success: true,
    xpEarned,
    goldEarned,
    statGain: quest.statGain,
    statTarget: quest.statTarget,
    didLevelUp: levelResult.didLevelUp,
    levelsGained: levelResult.levelsGained,
    newLevel: levelResult.newLevel,
    newRank: levelResult.newRank,
    isGateLocked: levelResult.isGateLocked,
    gateLevel: levelResult.gateLevel,
    statPointsEarned: levelResult.statPointsEarned,
    levelUpGoldBonus: levelResult.goldBonus,
  });
}
