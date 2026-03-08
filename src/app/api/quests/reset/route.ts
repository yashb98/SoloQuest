// api/quests/reset/route.ts — Daily/weekly quest reset + penalty engine + streak
// Uses optimistic locking to prevent duplicate penalty creation from race conditions
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { streakBonusGold, streakTitle } from "@/lib/xp";

export const dynamic = "force-dynamic";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// Get ISO week string (e.g. "2026-W10") for weekly reset tracking
function getWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
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

  // ── Optimistic lock: claim the reset by setting lastStreakDate FIRST ──
  // Only updates if lastStreakDate hasn't changed since we read it.
  // If another request already claimed it, updateMany returns count: 0.
  const previousStreakDate = hunter.lastStreakDate;
  const lockResult = await prisma.hunter.updateMany({
    where: {
      id: 1,
      lastStreakDate: previousStreakDate, // optimistic check
    },
    data: {
      lastStreakDate: today,
    },
  });

  if (lockResult.count === 0) {
    // Another request already claimed today's reset — bail out
    return NextResponse.json({ message: "Already reset today (concurrent)", streak: hunter.streak });
  }

  // ── We now own today's reset. Proceed safely. ──

  // ── FRESH START: No penalties on first day ──
  // If lastStreakDate is null, the user hasn't had a day to complete quests yet.
  // Just reset quests and set the date — penalties start TOMORROW.
  if (!previousStreakDate) {
    await prisma.quest.updateMany({
      where: { isDaily: true },
      data: { isCompleted: false, completedAt: null },
    });
    return NextResponse.json({
      success: true,
      freshStart: true,
      message: "First day — no penalties. Go earn gold!",
      streak: 0,
      date: today,
    });
  }

  // ── NORMAL DAY TRANSITION: Penalties for yesterday's incomplete quests ──

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
    newStreak = hunter.streak + 1;
  } else if (previousStreakDate !== yesterdayStr) {
    // Missed a day — check streak shields
    if (hunter.streakShields > 0) {
      shieldsUsed = true;
      await prisma.hunter.update({
        where: { id: 1 },
        data: { streakShields: { decrement: 1 } },
      });
    } else {
      goldPenalty = Math.min(Math.floor(Math.max(hunter.gold, 0) * 0.10), 500);
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

    if (newStreak % 21 === 0 && hunter.streakShields < 3) {
      await prisma.hunter.update({
        where: { id: 1 },
        data: { streakShields: { increment: 1 } },
      });
    }
  }

  const bestStreak = Math.max(hunter.bestStreak, newStreak);

  // --- Penalty for failed daily quests (yesterday's incomplete) ---
  const failedDailyQuests = await prisma.quest.findMany({
    where: { isDaily: true, isCompleted: false, isActive: true },
  });

  let questPenalty = 0;
  if (failedDailyQuests.length > 0) {
    for (const fq of failedDailyQuests) {
      const penalty = fq.goldBase;
      questPenalty += penalty;
      await prisma.penalty.create({
        data: {
          questId: fq.id,
          questTitle: fq.title,
          goldLost: penalty,
          reason: "quest_failed",
          description: `Failed daily: ${fq.title}`,
        },
      });
    }
  }

  // --- Penalty for failed weekly quests (end-of-week, Monday) ---
  const now = new Date();
  const dayOfWeek = now.getDay();
  const isNewWeek = dayOfWeek === 1;
  const currentWeekStr = getWeekString(now);

  let weeklyPenalty = 0;
  let failedWeeklyCount = 0;
  if (isNewWeek && hunter.lastWeeklyReset !== currentWeekStr) {
    const failedWeeklyQuests = await prisma.quest.findMany({
      where: { tier: "weekly", isCompleted: false, isActive: true },
    });

    if (failedWeeklyQuests.length > 0) {
      for (const fq of failedWeeklyQuests) {
        const penalty = fq.goldBase;
        weeklyPenalty += penalty;
        failedWeeklyCount++;
        await prisma.penalty.create({
          data: {
            questId: fq.id,
            questTitle: fq.title,
            goldLost: penalty,
            reason: "quest_failed",
            description: `Failed weekly: ${fq.title}`,
          },
        });
      }
    }

    await prisma.quest.updateMany({
      where: { tier: "weekly" },
      data: { isCompleted: false, completedAt: null },
    });
  }

  // Reset all daily quests for today
  await prisma.quest.updateMany({
    where: { isDaily: true },
    data: { isCompleted: false, completedAt: null },
  });

  // Update hunter (lastStreakDate already set by the lock above)
  const totalPenalty = questPenalty + weeklyPenalty;
  await prisma.hunter.update({
    where: { id: 1 },
    data: {
      streak: newStreak,
      bestStreak,
      title: newTitle,
      gold: { increment: bonusGold - goldPenalty - totalPenalty },
      ...(isNewWeek ? { lastWeeklyReset: currentWeekStr } : {}),
    },
  });

  return NextResponse.json({
    success: true,
    streak: newStreak,
    bestStreak,
    bonusGold,
    goldPenalty,
    questPenalty,
    weeklyPenalty,
    failedDailyCount: failedDailyQuests.length,
    failedWeeklyCount,
    shieldsUsed,
    questsReset: true,
    weeklyReset: isNewWeek && hunter.lastWeeklyReset !== currentWeekStr,
    date: today,
  });
}
