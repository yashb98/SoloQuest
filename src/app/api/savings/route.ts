// api/savings/route.ts — GET savings + spending + POST deposit/withdraw/spend
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  // Get savings balances by pot
  const savingsLogs = await prisma.savingsLog.findMany({
    orderBy: { loggedAt: "desc" },
  });

  // Calculate balances per pot
  const pots: Record<string, number> = { rewards: 0, certs: 0, emergency: 0 };
  for (const log of savingsLogs) {
    if (log.action === "deposit") {
      pots[log.pot] = (pots[log.pot] || 0) + log.amount;
    } else {
      pots[log.pot] = (pots[log.pot] || 0) - log.amount;
    }
  }

  // Get recent spending
  const recentSpending = await prisma.spendLog.findMany({
    orderBy: { spentAt: "desc" },
    take: 20,
  });

  // Calculate monthly spending totals by category
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlySpending = await prisma.spendLog.findMany({
    where: { spentAt: { gte: monthStart } },
  });

  const monthlyByCategory: Record<string, number> = {};
  let monthlyTotal = 0;
  for (const spend of monthlySpending) {
    monthlyByCategory[spend.category] =
      (monthlyByCategory[spend.category] || 0) + spend.amount;
    monthlyTotal += spend.amount;
  }

  return NextResponse.json({
    pots,
    recentSpending,
    monthlyByCategory,
    monthlyTotal,
    recentSavings: savingsLogs.slice(0, 10),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type } = body as { type: string };

  if (type === "savings") {
    const { pot, amount, action, note } = body as {
      pot: string;
      amount: number;
      action: string;
      note?: string;
    };

    if (!pot || !amount || !action) {
      return NextResponse.json(
        { error: "pot, amount, and action required" },
        { status: 400 }
      );
    }

    await prisma.savingsLog.create({
      data: { pot, amount, action, note: note || null },
    });

    return NextResponse.json({ success: true });
  }

  if (type === "spend") {
    const { category, amount, description } = body as {
      category: string;
      amount: number;
      description: string;
    };

    if (!category || !amount || !description) {
      return NextResponse.json(
        { error: "category, amount, and description required" },
        { status: 400 }
      );
    }

    // Convert £ to gold (£1 = 10 Gold) and deduct from hunter
    const goldCost = Math.round(amount * 10);

    await prisma.spendLog.create({
      data: { category, amount, description },
    });

    // Deduct gold (can go negative = debt)
    await prisma.hunter.update({
      where: { id: 1 },
      data: { gold: { decrement: goldCost } },
    });

    // Log as penalty for tracking
    await prisma.penalty.create({
      data: {
        goldLost: goldCost,
        reason: "spending",
        description: `${description} (£${amount.toFixed(2)})`,
      },
    });

    const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });

    return NextResponse.json({
      success: true,
      goldDeducted: goldCost,
      remainingGold: hunter?.gold ?? 0,
    });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
