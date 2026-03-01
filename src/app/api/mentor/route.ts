// api/mentor/route.ts — AI Mentor chat (Step 10)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mentorChat } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function GET() {
  const logs = await prisma.mentorLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message } = body as { message: string };

  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  const activeQuests = await prisma.quest.findMany({
    where: { isActive: true, isCompleted: false, unlocksAtLevel: { lte: hunter.level } },
    take: 5,
    select: { title: true },
  });

  const recentCompletions = await prisma.completion.findMany({
    orderBy: { completedAt: "desc" },
    take: 5,
    include: { quest: { select: { title: true } } },
  });

  try {
    const response = await mentorChat({
      hunterName: hunter.hunterName,
      class: hunter.class,
      rank: hunter.rank,
      level: hunter.level,
      stats: {
        vitality: hunter.vitality,
        intel: hunter.intel,
        hustle: hunter.hustle,
        wealth: hunter.wealth,
        focus: hunter.focus,
        agentIQ: hunter.agentIQ,
      },
      streak: hunter.streak,
      activeQuests: activeQuests.map((q) => q.title),
      recentHistory: recentCompletions.map((c) => c.quest.title),
      userMessage: message,
    });

    await prisma.mentorLog.create({
      data: { prompt: message, response, feature: "chat" },
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Mentor chat failed:", error);
    return NextResponse.json({
      response: "The System is currently unavailable. Continue your quests, Hunter.",
    });
  }
}
