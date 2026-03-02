// api/quests/complete/route.ts — Complete or Uncomplete quest + XP + level-up + stats
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { effectiveXP, effectiveGold } from "@/lib/xp";
import { processXPGain } from "@/lib/leveling";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { questId, notes, undo } = body as { questId: number; notes?: string; undo?: boolean };

  if (!questId) {
    return NextResponse.json({ error: "questId required" }, { status: 400 });
  }

  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  // --- UNDO / UNCOMPLETE ---
  if (undo) {
    if (!quest.isCompleted) {
      return NextResponse.json({ error: "Quest is not completed" }, { status: 400 });
    }

    // Calculate what was earned so we can reverse it
    const xpEarned = effectiveXP(
      quest.xpBase, hunter.level, hunter.streak,
      hunter.class, quest.statTarget, false
    );
    const goldEarned = effectiveGold(quest.goldBase, hunter.hustle);

    // Reverse the stat gain
    const validStats = ["vitality", "intel", "hustle", "wealth", "focus", "agentIQ"];
    const statDecrement: Record<string, number> = {};
    if (validStats.includes(quest.statTarget)) {
      const currentVal = (hunter as Record<string, unknown>)[quest.statTarget] as number;
      // Don't go below 0
      statDecrement[quest.statTarget] = Math.max(0, currentVal - quest.statGain);
    }

    // Reverse XP — simple subtraction (won't de-level, just reduce XP)
    const newXP = Math.max(0, hunter.xp - xpEarned);
    const newGold = Math.max(0, hunter.gold - goldEarned);

    await prisma.hunter.update({
      where: { id: 1 },
      data: {
        xp: newXP,
        gold: newGold,
        ...(validStats.includes(quest.statTarget) ? { [quest.statTarget]: statDecrement[quest.statTarget] } : {}),
      },
    });

    await prisma.quest.update({
      where: { id: questId },
      data: { isCompleted: false, completedAt: null },
    });

    // Delete the most recent completion record for this quest
    const lastCompletion = await prisma.completion.findFirst({
      where: { questId },
      orderBy: { completedAt: "desc" },
    });
    if (lastCompletion) {
      await prisma.completion.delete({ where: { id: lastCompletion.id } });
    }

    return NextResponse.json({
      success: true,
      undone: true,
      xpReversed: xpEarned,
      goldReversed: goldEarned,
    });
  }

  // --- COMPLETE ---
  if (quest.isCompleted) {
    return NextResponse.json({ error: "Quest already completed" }, { status: 400 });
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

  // Update DailySnapshot for analytics
  const today = new Date().toISOString().split("T")[0];
  const existingSnap = await prisma.dailySnapshot.findUnique({ where: { date: today } });
  if (existingSnap) {
    await prisma.dailySnapshot.update({
      where: { date: today },
      data: {
        xpEarned: { increment: xpEarned },
        goldEarned: { increment: goldEarned + levelResult.goldBonus },
        questsCompleted: { increment: 1 },
      },
    });
  } else {
    await prisma.dailySnapshot.create({
      data: {
        date: today,
        xpEarned,
        goldEarned: goldEarned + levelResult.goldBonus,
        questsCompleted: 1,
        streakDay: hunter.streak,
      },
    });
  }

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
