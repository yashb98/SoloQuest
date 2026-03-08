// api/penalties/route.ts — GET penalty history + summary
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

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

  // Recent penalties (last 50)
  const recent = await prisma.penalty.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Today's penalties
  const todayPenalties = await prisma.penalty.findMany({
    where: {
      createdAt: { gte: todayStart, lt: tomorrowStart },
    },
    orderBy: { createdAt: "desc" },
  });

  // Weekly total
  const weeklyPenalties = await prisma.penalty.findMany({
    where: { createdAt: { gte: weekStart } },
  });
  const weeklyTotal = weeklyPenalties.reduce((sum, p) => sum + p.goldLost, 0);

  // Monthly total
  const monthlyPenalties = await prisma.penalty.findMany({
    where: { createdAt: { gte: monthStart } },
  });
  const monthlyTotal = monthlyPenalties.reduce((sum, p) => sum + p.goldLost, 0);
  const monthlyFromQuests = monthlyPenalties
    .filter((p) => p.reason === "quest_failed")
    .reduce((sum, p) => sum + p.goldLost, 0);
  const monthlyFromSpending = monthlyPenalties
    .filter((p) => p.reason === "spending")
    .reduce((sum, p) => sum + p.goldLost, 0);

  const todayTotal = todayPenalties.reduce((sum, p) => sum + p.goldLost, 0);

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });

  return NextResponse.json({
    recent,
    todayPenalties,
    todayTotal,
    weeklyTotal,
    monthlyTotal,
    monthlyFromQuests,
    monthlyFromSpending,
    currentGold: hunter?.gold ?? 0,
    isInDebt: (hunter?.gold ?? 0) < 0,
    debtAmount: Math.abs(Math.min(0, hunter?.gold ?? 0)),
  });
}
