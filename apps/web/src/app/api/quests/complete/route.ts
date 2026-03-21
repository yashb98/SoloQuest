// api/quests/complete/route.ts — Complete or Uncomplete quest + XP + level-up + stats
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { effectiveXP, effectiveGold, RANK_CONFIG } from "@/lib/xp";
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

    // Find the completion record first — it has the exact amounts to reverse
    const lastCompletion = await prisma.completion.findFirst({
      where: { questId },
      orderBy: { completedAt: "desc" },
    });

    // Use recorded values if available, otherwise recalculate
    const xpEarned = lastCompletion?.xpEarned ?? effectiveXP(
      quest.xpBase, hunter.level, hunter.streak,
      hunter.class, quest.statTarget, false
    );
    const goldEarned = lastCompletion?.goldEarned ?? effectiveGold(quest.goldBase, hunter.hustle);
    const goldBonus = lastCompletion?.goldBonus ?? 0;
    const totalGoldToReverse = goldEarned + goldBonus;

    // Reverse the stat gain
    const validStats = ["vitality", "intel", "hustle", "wealth", "focus", "agentIQ"];
    const statDecrement: Record<string, number> = {};
    if (validStats.includes(quest.statTarget)) {
      const currentVal = (hunter as Record<string, unknown>)[quest.statTarget] as number;
      statDecrement[quest.statTarget] = Math.max(0, currentVal - quest.statGain);
    }

    // Reverse XP and gold (including level-up bonus)
    const newXP = Math.max(0, hunter.xp - xpEarned);
    const newGold = hunter.gold - totalGoldToReverse; // allow negative (debt)

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

    // Decrement DailySnapshot to keep analytics accurate
    const today = new Date().toISOString().split("T")[0];
    const existingSnap = await prisma.dailySnapshot.findUnique({ where: { date: today } });
    if (existingSnap) {
      await prisma.dailySnapshot.update({
        where: { date: today },
        data: {
          xpEarned: Math.max(0, existingSnap.xpEarned - xpEarned),
          goldEarned: Math.max(0, existingSnap.goldEarned - totalGoldToReverse),
          questsCompleted: Math.max(0, existingSnap.questsCompleted - 1),
        },
      });
    }

    // Delete the completion record
    if (lastCompletion) {
      await prisma.completion.delete({ where: { id: lastCompletion.id } });
    }

    return NextResponse.json({
      success: true,
      undone: true,
      xpReversed: xpEarned,
      goldReversed: totalGoldToReverse,
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

  // Build breakdown for UI
  const hustleBonus = Math.floor(hunter.hustle / 10);
  const { streakMultiplier: sm, CLASS_BUFFS: cb } = await import("@/lib/xp");
  const streakMult = sm(hunter.streak);
  const classBuff = cb[hunter.class];
  const classMatch = classBuff && classBuff.stat === quest.statTarget;
  const xpAfterStreak = Math.floor(quest.xpBase * streakMult);
  const xpFromStreak = xpAfterStreak - quest.xpBase;
  const xpFromClass = classMatch ? Math.floor(xpAfterStreak * (classBuff.multiplier - 1)) : 0;

  const levelResult = processXPGain(hunter.xp, hunter.level, hunter.xpToNext, xpEarned);

  const validStats = ["vitality", "intel", "hustle", "wealth", "focus", "agentIQ"];
  const statUpdate: Record<string, { increment: number }> = {};
  let actualStatGain = 0;
  if (validStats.includes(quest.statTarget)) {
    // Enforce rank-based stat cap (E=100, D=250, C=400, B=600, A=800, S/National=1000)
    const rankMeta = RANK_CONFIG[hunter.rank as keyof typeof RANK_CONFIG] || RANK_CONFIG.E;
    const currentStatVal = (hunter as Record<string, unknown>)[quest.statTarget] as number || 0;
    actualStatGain = Math.min(quest.statGain, rankMeta.statCap - currentStatVal);
    if (actualStatGain > 0) {
      statUpdate[quest.statTarget] = { increment: actualStatGain };
    }
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
      ...statUpdate,
    },
  });

  await prisma.quest.update({
    where: { id: questId },
    data: { isCompleted: true, completedAt: new Date() },
  });

  await prisma.completion.create({
    data: { questId, xpEarned, goldEarned, goldBonus: levelResult.goldBonus, notes: notes || null },
  });

  // Log level-up gold bonus in penalties section for visibility
  if (levelResult.goldBonus > 0) {
    await prisma.penalty.create({
      data: {
        questId,
        questTitle: quest.title,
        goldLost: levelResult.goldBonus,
        reason: "level_up_bonus",
        description: `Rank Up to ${levelResult.newRank}: +${levelResult.goldBonus}G bonus`,
      },
    });
  }

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

  const { rankLevel: rl } = await import("@/lib/xp");

  return NextResponse.json({
    success: true,
    xpEarned,
    goldEarned,
    // Breakdown: what contributed to the totals
    breakdown: {
      xp: {
        base: quest.xpBase,
        streakBonus: xpFromStreak,
        streakMultiplier: streakMult,
        classBonus: xpFromClass,
        classMatch: classMatch ? `${hunter.class} +10%` : null,
        total: xpEarned,
      },
      gold: {
        base: quest.goldBase,
        hustleBonus,
        hustleStat: hunter.hustle,
        total: goldEarned,
      },
      stat: {
        target: quest.statTarget,
        gain: actualStatGain,
        maxGain: quest.statGain,
        capped: actualStatGain < quest.statGain,
      },
    },
    statGain: actualStatGain,
    statTarget: quest.statTarget,
    didLevelUp: levelResult.didLevelUp,
    levelsGained: levelResult.levelsGained,
    newLevel: levelResult.newLevel,
    newRankLevel: rl(levelResult.newLevel),
    newRank: levelResult.newRank,
    isGateLocked: levelResult.isGateLocked,
    gateLevel: levelResult.gateLevel,
    statPointsEarned: levelResult.statPointsEarned,
    levelUpGoldBonus: levelResult.goldBonus,
  });
}
