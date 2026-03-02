// api/dashboard/route.ts — Aggregated dashboard data for widgets
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export async function GET() {
  const today = todayStr();

  // Parallel fetch everything
  const [
    hunter,
    todayTodos,
    todayQuests,
    activeDungeons,
    upcomingGoals,
    recentCompletions,
    weeklyCompletions,
    achievements,
  ] = await Promise.all([
    prisma.hunter.findFirst({ where: { id: 1 } }),
    prisma.todoItem.findMany({ where: { date: today } }),
    prisma.quest.findMany(),
    prisma.dungeon.findMany({ where: { isActive: true } }),
    prisma.goal.findMany({
      where: { isCompleted: false },
      orderBy: { targetDate: "asc" },
      take: 5,
    }),
    // Last 7 days of completions for XP chart
    prisma.completion.findMany({
      where: { completedAt: { gte: new Date(daysAgoStr(7)) } },
      orderBy: { completedAt: "asc" },
    }),
    // This week's completions
    prisma.completion.findMany({
      where: { completedAt: { gte: new Date(daysAgoStr(7)) } },
    }),
    prisma.achievement.findMany(),
  ]);

  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  // Today's planner progress
  const todayTodosTotal = todayTodos.length;
  const todayTodosCompleted = todayTodos.filter((t) => t.isCompleted).length;

  // Quest progress
  const questsTotal = todayQuests.length;
  const questsCompleted = todayQuests.filter((q) => q.isCompleted).length;

  // Active dungeon info
  const activeDungeon = activeDungeons[0]
    ? {
        title: activeDungeons[0].title,
        deadline: activeDungeons[0].deadline,
        activatedAt: activeDungeons[0].activatedAt,
        dayNumber: activeDungeons[0].activatedAt
          ? Math.ceil(
              (Date.now() - new Date(activeDungeons[0].activatedAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 1,
      }
    : null;

  // Weekly XP chart data (last 7 days)
  const xpByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    xpByDay[daysAgoStr(i)] = 0;
  }
  for (const c of recentCompletions) {
    const day = new Date(c.completedAt).toISOString().split("T")[0];
    if (xpByDay[day] !== undefined) {
      xpByDay[day] += c.xpEarned;
    }
  }
  const weeklyXPChart = Object.entries(xpByDay).map(([date, xp]) => ({
    date,
    day: new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }),
    xp,
  }));

  // Weekly totals
  const weeklyXP = weeklyCompletions.reduce((sum, c) => sum + c.xpEarned, 0);
  const weeklyGold = weeklyCompletions.reduce((sum, c) => sum + c.goldEarned, 0);
  const weeklyQuestsCompleted = weeklyCompletions.length;

  // Achievement progress
  const achievementsUnlocked = achievements.filter((a) => a.isUnlocked).length;
  const achievementsTotal = achievements.length;

  // Upcoming goals
  const goals = upcomingGoals.map((g) => ({
    id: g.id,
    title: g.title,
    type: g.type,
    targetDate: g.targetDate,
    xpReward: g.xpReward,
  }));

  return NextResponse.json({
    // Planner progress
    todayTodos: { total: todayTodosTotal, completed: todayTodosCompleted },
    // Quest progress
    quests: { total: questsTotal, completed: questsCompleted },
    // Active dungeon
    activeDungeon,
    // Weekly XP chart
    weeklyXPChart,
    // Weekly totals
    weeklyStats: { xp: weeklyXP, gold: weeklyGold, quests: weeklyQuestsCompleted },
    // Achievements
    achievements: { unlocked: achievementsUnlocked, total: achievementsTotal },
    // Goals
    upcomingGoals: goals,
    // Streak
    streak: hunter.streak,
    bestStreak: hunter.bestStreak,
    streakShields: hunter.streakShields,
  });
}
