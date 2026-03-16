// api/achievements/route.ts — GET achievements + POST check/unlock
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const achievements = await prisma.achievement.findMany({
    orderBy: [{ isUnlocked: "desc" }, { rarity: "asc" }, { id: "asc" }],
  });
  return NextResponse.json(achievements);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { achievementId } = body as { achievementId: number };

  const achievement = await prisma.achievement.findUnique({ where: { id: achievementId } });
  if (!achievement || achievement.isUnlocked) {
    return NextResponse.json({ error: "Invalid or already unlocked" }, { status: 400 });
  }

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) return NextResponse.json({ error: "Hunter not found" }, { status: 404 });

  // Unlock the achievement
  await prisma.achievement.update({
    where: { id: achievementId },
    data: { isUnlocked: true, unlockedAt: new Date() },
  });

  // Award rewards
  const updateData: Record<string, unknown> = {};
  if (achievement.xpReward > 0) updateData.xp = { increment: achievement.xpReward };
  if (achievement.goldReward > 0) updateData.gold = { increment: achievement.goldReward };
  if (achievement.titleReward) updateData.title = achievement.titleReward;

  if (Object.keys(updateData).length > 0) {
    await prisma.hunter.update({ where: { id: 1 }, data: updateData });
  }

  return NextResponse.json({
    success: true,
    name: achievement.name,
    xpReward: achievement.xpReward,
    goldReward: achievement.goldReward,
    titleReward: achievement.titleReward,
  });
}
