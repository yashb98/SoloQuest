// api/goals/route.ts — CRUD for goals (Sprint/Monthly/Life Quest)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const goals = await prisma.goal.findMany({
    orderBy: [{ isCompleted: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body as { action?: string };

  if (action === "complete") {
    const { goalId } = body as { goalId: number };
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.isCompleted) {
      return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
    }

    await prisma.goal.update({
      where: { id: goalId },
      data: { isCompleted: true, completedAt: new Date() },
    });

    // Award XP and gold
    await prisma.hunter.update({
      where: { id: 1 },
      data: {
        xp: { increment: goal.xpReward },
        gold: { increment: goal.goldReward },
      },
    });

    return NextResponse.json({
      success: true,
      xpReward: goal.xpReward,
      goldReward: goal.goldReward,
    });
  }

  if (action === "delete") {
    const { goalId } = body as { goalId: number };
    await prisma.goal.delete({ where: { id: goalId } });
    return NextResponse.json({ success: true });
  }

  // Create new goal
  const { type, title, description, targetDate, xpReward, goldReward } = body as {
    type: string; title: string; description?: string;
    targetDate?: string; xpReward?: number; goldReward?: number;
  };

  if (!type || !title) {
    return NextResponse.json({ error: "type and title required" }, { status: 400 });
  }

  const defaults = { sprint: { xp: 200, gold: 100 }, monthly: { xp: 500, gold: 300 }, life: { xp: 2000, gold: 1000 } };
  const d = defaults[type as keyof typeof defaults] || defaults.sprint;

  const goal = await prisma.goal.create({
    data: {
      type,
      title,
      description: description || "",
      targetDate: targetDate ? new Date(targetDate) : null,
      xpReward: xpReward || d.xp,
      goldReward: goldReward || d.gold,
    },
  });

  return NextResponse.json({ success: true, goal });
}
