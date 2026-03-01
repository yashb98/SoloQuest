// api/rewards/route.ts — GET rewards + POST redeem
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rewards = await prisma.reward.findMany({
    orderBy: [{ tier: "asc" }, { costGold: "asc" }],
  });
  return NextResponse.json(rewards);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { rewardId } = body as { rewardId: number };

  if (!rewardId) {
    return NextResponse.json({ error: "rewardId required" }, { status: 400 });
  }

  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward) {
    return NextResponse.json({ error: "Reward not found" }, { status: 404 });
  }
  if (reward.isRedeemed) {
    return NextResponse.json(
      { error: "Reward already redeemed" },
      { status: 400 }
    );
  }

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  if (hunter.gold < reward.costGold) {
    return NextResponse.json(
      { error: "Insufficient gold", required: reward.costGold, current: hunter.gold },
      { status: 400 }
    );
  }

  // Deduct gold and mark redeemed
  await prisma.hunter.update({
    where: { id: 1 },
    data: { gold: { decrement: reward.costGold } },
  });

  await prisma.reward.update({
    where: { id: rewardId },
    data: { isRedeemed: true, redeemedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    reward: reward.title,
    goldSpent: reward.costGold,
    remainingGold: hunter.gold - reward.costGold,
  });
}
