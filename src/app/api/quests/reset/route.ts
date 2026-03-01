// api/quests/reset/route.ts — Daily quest reset + enhanced streak engine (Step 5)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { streakBonusGold, streakTitle } from "@/lib/xp";

export const dynamic = "force-dynamic";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export async function POST() {
  const today = todayStr();

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  if (hunter.lastStreakDate === today) {
    return NextResponse.json({ message: "Already reset today", streak: hunter.streak });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const yesterdayCompletions = await prisma.completion.count({
    where: {
      completedAt: {
        gte: new Date(yesterdayStr + "T00:00:00Z"),
        lt: new Date(today + "T00:00:00Z"),
      },
    },
  });

  let newStreak = hunter.streak;
  let shieldsUsed = false;
  let goldPenalty = 0;

  if (yesterdayCompletions > 0) {
    // Completed quests yesterday — increment streak
    newStreak = hunter.streak + 1;
  } else if (hunter.lastStreakDate && hunter.lastStreakDate !== yesterdayStr) {
    // Missed a day — check protections (Step 5.2)

    // 1. Check streak shields
    if (hunter.streakShields > 0) {
      shieldsUsed = true;
      await prisma.hunter.update({
        where: { id: 1 },
        data: { streakShields: { decrement: 1 } },
      });
      // Shield preserves streak
    } else {
      // Streak breaks — apply penalty (Step 5.3)
      goldPenalty = Math.min(Math.floor(hunter.gold * 0.10), 500);
      newStreak = 0;
    }
  }

  // Award streak milestone bonuses
  let bonusGold = 0;
  let newTitle = hunter.title;
  if (newStreak > 0) {
    bonusGold = streakBonusGold(newStreak);
    const title = streakTitle(newStreak);
    if (title) newTitle = title;

    // Award streak shield at 21-day milestones
    if (newStreak % 21 === 0 && hunter.streakShields < 3) {
      await prisma.hunter.update({
        where: { id: 1 },
        data: { streakShields: { increment: 1 } },
      });
    }
  }

  // Update best streak
  const bestStreak = Math.max(hunter.bestStreak, newStreak);

  // Reset all daily quests
  await prisma.quest.updateMany({
    where: { isDaily: true },
    data: { isCompleted: false, completedAt: null },
  });

  // Update hunter
  await prisma.hunter.update({
    where: { id: 1 },
    data: {
      streak: newStreak,
      bestStreak,
      lastStreakDate: today,
      title: newTitle,
      gold: { increment: bonusGold - goldPenalty },
    },
  });

  return NextResponse.json({
    success: true,
    streak: newStreak,
    bestStreak,
    bonusGold,
    goldPenalty,
    shieldsUsed,
    questsReset: true,
    date: today,
  });
}
