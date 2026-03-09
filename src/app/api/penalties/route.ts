// api/penalties/route.ts — GET penalty history + gold gains summary
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const GAIN_REASONS = ["level_up_bonus"];

export async function GET() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const todayStart = new Date(todayStr + "T00:00:00Z");
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  // Recent entries (last 50) — both penalties and gains
  const recent = await prisma.penalty.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Today's entries
  const todayEntries = await prisma.penalty.findMany({
    where: {
      createdAt: { gte: todayStart, lt: tomorrowStart },
    },
    orderBy: { createdAt: "desc" },
  });

  const todayPenalties = todayEntries.filter((p) => !GAIN_REASONS.includes(p.reason));
  const todayGains = todayEntries.filter((p) => GAIN_REASONS.includes(p.reason));

  // Weekly totals
  const weeklyEntries = await prisma.penalty.findMany({
    where: { createdAt: { gte: weekStart } },
  });
  const weeklyTotal = weeklyEntries
    .filter((p) => !GAIN_REASONS.includes(p.reason))
    .reduce((sum, p) => sum + p.goldLost, 0);
  const weeklyGainTotal = weeklyEntries
    .filter((p) => GAIN_REASONS.includes(p.reason))
    .reduce((sum, p) => sum + p.goldLost, 0);

  // Monthly totals
  const monthlyEntries = await prisma.penalty.findMany({
    where: { createdAt: { gte: monthStart } },
  });
  const monthlyPenalties = monthlyEntries.filter((p) => !GAIN_REASONS.includes(p.reason));
  const monthlyTotal = monthlyPenalties.reduce((sum, p) => sum + p.goldLost, 0);
  const monthlyFromQuests = monthlyPenalties
    .filter((p) => p.reason === "quest_failed")
    .reduce((sum, p) => sum + p.goldLost, 0);
  const monthlyFromSpending = monthlyPenalties
    .filter((p) => p.reason === "spending")
    .reduce((sum, p) => sum + p.goldLost, 0);
  const monthlyFromRedeems = monthlyPenalties
    .filter((p) => p.reason === "custom_redeem")
    .reduce((sum, p) => sum + p.goldLost, 0);
  const monthlyGainTotal = monthlyEntries
    .filter((p) => GAIN_REASONS.includes(p.reason))
    .reduce((sum, p) => sum + p.goldLost, 0);

  const todayTotal = todayPenalties.reduce((sum, p) => sum + p.goldLost, 0);
  const todayGainTotal = todayGains.reduce((sum, p) => sum + p.goldLost, 0);

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });

  return NextResponse.json({
    recent,
    todayPenalties,
    todayGains,
    todayTotal,
    todayGainTotal,
    weeklyTotal,
    weeklyGainTotal,
    monthlyTotal,
    monthlyGainTotal,
    monthlyFromQuests,
    monthlyFromSpending,
    monthlyFromRedeems,
    currentGold: hunter?.gold ?? 0,
    isInDebt: (hunter?.gold ?? 0) < 0,
    debtAmount: Math.abs(Math.min(0, hunter?.gold ?? 0)),
  });
}
