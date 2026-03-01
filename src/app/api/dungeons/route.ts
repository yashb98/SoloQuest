// api/dungeons/route.ts — GET all dungeons + POST activate/complete
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const dungeons = await prisma.dungeon.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(dungeons);
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

    // Check hunter is D-Rank+ (level 10+)
    if (hunter.level < 10) {
      return NextResponse.json({ error: "Dungeons unlock at D-Rank (Level 10)" }, { status: 400 });
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

    // Award bonus XP and gold
    const statIncrement: Record<string, number> = {};
    const validStats = ["vitality", "intel", "hustle", "wealth", "focus", "agentIQ"];
    if (validStats.includes(dungeon.statReward)) {
      statIncrement[dungeon.statReward] = dungeon.statAmount;
    }

    await prisma.hunter.update({
      where: { id: 1 },
      data: {
        xp: { increment: dungeon.bonusXP },
        gold: { increment: dungeon.bonusGold },
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
    });
  }

  if (action === "abandon") {
    await prisma.dungeon.update({
      where: { id: dungeonId },
      data: { isActive: false, isFailed: true },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
