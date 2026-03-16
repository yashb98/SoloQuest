// api/analytics/route.ts — Analytics data for progress history, heatmap, trends
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export async function GET() {
  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) return NextResponse.json({ error: "Hunter not found" }, { status: 404 });

  // Get all completions (last 90 days)
  const ninetyDaysAgo = new Date(daysAgoStr(90));
  const completions = await prisma.completion.findMany({
    where: { completedAt: { gte: ninetyDaysAgo } },
    include: { quest: { select: { category: true, xpBase: true, goldBase: true, statTarget: true } } },
    orderBy: { completedAt: "asc" },
  });

  // Build daily data for heatmap (last 90 days)
  const heatmapData: Record<string, { date: string; xp: number; quests: number; gold: number; penaltyGold: number }> = {};
  for (let i = 89; i >= 0; i--) {
    const d = daysAgoStr(i);
    heatmapData[d] = { date: d, xp: 0, quests: 0, gold: 0, penaltyGold: 0 };
  }

  for (const c of completions) {
    const day = new Date(c.completedAt).toISOString().split("T")[0];
    if (heatmapData[day]) {
      heatmapData[day].xp += c.xpEarned;
      heatmapData[day].quests += 1;
      heatmapData[day].gold += c.goldEarned + (c.goldBonus || 0);
    }
  }

  // Add penalty data to heatmap days
  const penalties = await prisma.penalty.findMany({
    where: { createdAt: { gte: ninetyDaysAgo } },
    orderBy: { createdAt: "asc" },
  });
  for (const p of penalties) {
    const day = new Date(p.createdAt).toISOString().split("T")[0];
    if (heatmapData[day]) {
      heatmapData[day].penaltyGold += p.goldLost;
    }
  }

  // Weekly XP trend (last 12 weeks)
  const weeklyTrend: Array<{ week: string; xp: number; quests: number }> = [];
  for (let w = 11; w >= 0; w--) {
    const weekStart = daysAgoStr(w * 7 + 6);
    const weekEnd = daysAgoStr(w * 7);
    let xp = 0;
    let quests = 0;
    for (const c of completions) {
      const d = new Date(c.completedAt).toISOString().split("T")[0];
      if (d >= weekStart && d <= weekEnd) {
        xp += c.xpEarned;
        quests += 1;
      }
    }
    weeklyTrend.push({
      week: `W${12 - w}`,
      xp,
      quests,
    });
  }

  // Category breakdown
  const categoryBreakdown: Record<string, { count: number; xp: number }> = {};
  for (const c of completions) {
    const cat = c.quest.category;
    if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { count: 0, xp: 0 };
    categoryBreakdown[cat].count += 1;
    categoryBreakdown[cat].xp += c.xpEarned;
  }

  // Stat distribution from quest stat targets
  const statDistribution: Record<string, number> = {};
  for (const c of completions) {
    const stat = c.quest.statTarget;
    statDistribution[stat] = (statDistribution[stat] || 0) + 1;
  }

  // Time-focused data from time sessions
  const sessions = await prisma.timeSession.findMany({
    where: { isCompleted: true, completedAt: { gte: ninetyDaysAgo } },
    orderBy: { completedAt: "asc" },
  });
  const totalMinutesFocused = sessions.reduce((sum, s) => sum + Math.floor(s.elapsed / 60), 0);

  // Enrich heatmap with timer XP from DailySnapshot (only timer XP to avoid double-counting quests)
  const snapshots = await prisma.dailySnapshot.findMany({
    where: { date: { gte: daysAgoStr(89) } },
  });
  for (const snap of snapshots) {
    if (heatmapData[snap.date]) {
      // Add focus minutes as extra activity data
      heatmapData[snap.date].xp += snap.minutesFocused; // 1 XP per minute focused
    }
  }

  // Totals
  const totalXP = completions.reduce((sum, c) => sum + c.xpEarned, 0);
  const totalGold = completions.reduce((sum, c) => sum + c.goldEarned + (c.goldBonus || 0), 0);
  const totalQuests = completions.length;

  // Best day
  let bestDay = { date: "", xp: 0 };
  for (const [date, data] of Object.entries(heatmapData)) {
    if (data.xp > bestDay.xp) bestDay = { date, xp: data.xp };
  }

  // Current stats
  const stats = {
    vitality: hunter.vitality,
    intel: hunter.intel,
    hustle: hunter.hustle,
    wealth: hunter.wealth,
    focus: hunter.focus,
    agentIQ: hunter.agentIQ,
  };

  return NextResponse.json({
    heatmap: Object.values(heatmapData),
    weeklyTrend,
    categoryBreakdown,
    statDistribution,
    stats,
    totals: {
      xp: totalXP,
      gold: totalGold,
      quests: totalQuests,
      minutesFocused: totalMinutesFocused,
      sessions: sessions.length,
    },
    bestDay,
    streak: hunter.streak,
    bestStreak: hunter.bestStreak,
    level: hunter.level,
    rank: hunter.rank,
  });
}
