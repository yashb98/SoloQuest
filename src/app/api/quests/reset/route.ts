// api/quests/reset/route.ts — Daily quest reset + streak management
// Called by cron at 6:30AM or manually
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function todayStr(): string {
  return new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
}

export async function POST() {
  const today = todayStr();

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  // Check if already reset today
  if (hunter.lastStreakDate === today) {
    return NextResponse.json({
      message: "Already reset today",
      streak: hunter.streak,
    });
  }

  // Calculate streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Check if any quests were completed yesterday
  const yesterdayCompletions = await prisma.completion.count({
    where: {
      completedAt: {
        gte: new Date(yesterdayStr + "T00:00:00Z"),
        lt: new Date(today + "T00:00:00Z"),
      },
    },
  });

  let newStreak = hunter.streak;
  if (yesterdayCompletions > 0) {
    // Completed quests yesterday — increment streak
    newStreak = hunter.streak + 1;
  } else if (hunter.lastStreakDate && hunter.lastStreakDate !== yesterdayStr) {
    // Missed a day — reset streak
    newStreak = 0;
  }

  // Reset all daily quests
  await prisma.quest.updateMany({
    where: { isDaily: true },
    data: { isCompleted: false, completedAt: null },
  });

  // Update hunter streak
  await prisma.hunter.update({
    where: { id: 1 },
    data: {
      streak: newStreak,
      lastStreakDate: today,
    },
  });

  return NextResponse.json({
    success: true,
    streak: newStreak,
    questsReset: true,
    date: today,
  });
}
