// api/dungeons/route.ts — GET all dungeons + POST activate/complete
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processXPGain } from "@/lib/leveling";

export const dynamic = "force-dynamic";

// Dungeon minimum levels by title (stable across re-seeds)
const DUNGEON_MIN_LEVELS_BY_TITLE: Record<string, number> = {
  "The Iron Body": 1,          // starter
  "The Algorithm Gauntlet": 3, // E-Rank+
  "The Application Blitz": 3,  // E-Rank+
  "The Agent Architect": 10,   // D-Rank
  "The Wealth Fortress": 1,    // starter
  "The Cert Sprint": 5,        // E-Rank+
  "The Focus Forge": 3,        // E-Rank+
  "The Portfolio Week": 10,    // D-Rank
  "The MLOps Forge": 15,       // D-Rank+
  "The Full Stack Trial": 20,  // C-Rank
};

export async function GET() {
  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  const dungeons = await prisma.dungeon.findMany({
    orderBy: { id: "asc" },
  });

  // Attach minLevel info for frontend (lookup by title so IDs don't matter)
  const dungeonsWithLevel = dungeons.map((d) => {
    const minLevel = DUNGEON_MIN_LEVELS_BY_TITLE[d.title] ?? 1;
    return {
      ...d,
      minLevel,
      canActivate: hunter ? hunter.level >= minLevel : false,
    };
  });

  return NextResponse.json(dungeonsWithLevel);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, dungeonId } = body as { action: string; dungeonId: number };

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) return NextResponse.json({ error: "Hunter not found" }, { status: 404 });

  if (action === "activate") {
    // Check if another dungeon is active
    const activeDungeon = await prisma.dungeon.findFirst({ where: { isActive: true } });
    if (activeDungeon) {
      return NextResponse.json({ error: "Another dungeon is already active" }, { status: 400 });
    }

    // Check hunter meets minimum level for this dungeon (lookup by title)
    const targetDungeon = await prisma.dungeon.findUnique({ where: { id: dungeonId } });
    if (!targetDungeon) {
      return NextResponse.json({ error: "Dungeon not found" }, { status: 404 });
    }
    const minLvl = DUNGEON_MIN_LEVELS_BY_TITLE[targetDungeon.title] ?? 1;
    if (hunter.level < minLvl) {
      return NextResponse.json({
        error: `This dungeon requires Level ${minLvl}+. You are Level ${hunter.level}.`,
      }, { status: 400 });
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.dungeon.update({
      where: { id: dungeonId },
      data: { isActive: true, activatedAt: now, deadline, isFailed: false, isCompleted: false },
    });

    return NextResponse.json({ success: true, deadline });
  }

  if (action === "complete") {
    const dungeon = await prisma.dungeon.findUnique({ where: { id: dungeonId } });
    if (!dungeon || !dungeon.isActive) {
      return NextResponse.json({ error: "Dungeon not active" }, { status: 400 });
    }

    // Process XP through leveling system (properly handles level-ups)
    const levelResult = processXPGain(hunter.xp, hunter.level, hunter.xpToNext, dungeon.bonusXP);

    const validStats = ["vitality", "intel", "hustle", "wealth", "focus", "agentIQ"];
    const statIncrement: Record<string, number> = {};
    if (validStats.includes(dungeon.statReward)) {
      statIncrement[dungeon.statReward] = dungeon.statAmount;
    }

    await prisma.hunter.update({
      where: { id: 1 },
      data: {
        xp: levelResult.newXP,
        level: levelResult.newLevel,
        rank: levelResult.newRank,
        xpToNext: levelResult.newXPToNext,
        gold: { increment: dungeon.bonusGold + levelResult.goldBonus },
        statPoints: { increment: levelResult.statPointsEarned },
        ...statIncrement,
      },
    });

    await prisma.dungeon.update({
      where: { id: dungeonId },
      data: { isActive: false, isCompleted: true, completedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      bonusXP: dungeon.bonusXP,
      bonusGold: dungeon.bonusGold,
      statReward: dungeon.statReward,
      statAmount: dungeon.statAmount,
      didLevelUp: levelResult.didLevelUp,
      levelsGained: levelResult.levelsGained,
      newLevel: levelResult.newLevel,
      newRank: levelResult.newRank,
    });
  }

  if (action === "abandon") {
    await prisma.dungeon.update({
      where: { id: dungeonId },
      data: { isActive: false, isFailed: true },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "uncomplete") {
    const dungeon = await prisma.dungeon.findUnique({ where: { id: dungeonId } });
    if (!dungeon || !dungeon.isCompleted) {
      return NextResponse.json({ error: "Dungeon is not completed" }, { status: 400 });
    }

    const { xpForLevel, rankFromLevel } = await import("@/lib/xp");

    // Reverse the stat reward
    const validStats = ["vitality", "intel", "hustle", "wealth", "focus", "agentIQ"];
    const statDecrement: Record<string, number> = {};
    if (validStats.includes(dungeon.statReward)) {
      const currentVal = (hunter as Record<string, unknown>)[dungeon.statReward] as number;
      statDecrement[dungeon.statReward] = Math.max(0, currentVal - dungeon.statAmount);
    }

    // To properly reverse, we need to figure out how many levels the dungeon XP caused.
    // We do this by computing total accumulated XP before and after, then recalculating level.
    // Total accumulated XP = sum of all thresholds up to current level + current xp
    let totalAccumulatedXP = hunter.xp;
    for (let l = 1; l < hunter.level; l++) {
      totalAccumulatedXP += xpForLevel(l + 1);
    }

    // Subtract the dungeon's bonusXP
    const newTotalXP = Math.max(0, totalAccumulatedXP - dungeon.bonusXP);

    // Walk from level 1 to find the new level and remaining XP
    let recalcLevel = 1;
    let remainingXP = newTotalXP;
    let recalcXPToNext = xpForLevel(2);

    while (remainingXP >= recalcXPToNext && recalcLevel < 100) {
      remainingXP -= recalcXPToNext;
      recalcLevel += 1;
      recalcXPToNext = xpForLevel(recalcLevel + 1);
    }

    // Calculate levels lost to reverse gold bonus and stat points
    const levelsLost = hunter.level - recalcLevel;
    const goldBonusToReverse = levelsLost * 50; // each level-up gives +50 gold
    const totalGoldReversed = dungeon.bonusGold + goldBonusToReverse;
    const newGold = Math.max(0, hunter.gold - totalGoldReversed);

    await prisma.hunter.update({
      where: { id: 1 },
      data: {
        xp: remainingXP,
        level: recalcLevel,
        rank: rankFromLevel(recalcLevel),
        xpToNext: recalcXPToNext,
        gold: newGold,
        statPoints: Math.max(0, hunter.statPoints - levelsLost),
        ...(validStats.includes(dungeon.statReward)
          ? { [dungeon.statReward]: statDecrement[dungeon.statReward] }
          : {}),
      },
    });

    await prisma.dungeon.update({
      where: { id: dungeonId },
      data: { isCompleted: false, completedAt: null, isFailed: false },
    });

    return NextResponse.json({
      success: true,
      undone: true,
      xpReversed: dungeon.bonusXP,
      goldReversed: totalGoldReversed,
      levelsLost,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
