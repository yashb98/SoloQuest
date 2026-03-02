// api/timer/route.ts — Time tracking sessions CRUD
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessions = await prisma.timeSession.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body as { action?: string };

  // Start a new session
  if (!action || action === "start") {
    const { label, duration, questId, todoId } = body as {
      label?: string;
      duration: number; // minutes
      questId?: number;
      todoId?: number;
    };

    if (!duration || duration < 1) {
      return NextResponse.json({ error: "duration required (minutes)" }, { status: 400 });
    }

    const session = await prisma.timeSession.create({
      data: {
        label: label || "Focus Session",
        duration,
        questId: questId || null,
        todoId: todoId || null,
        elapsed: 0,
      },
    });

    return NextResponse.json({ success: true, session });
  }

  // Complete a session
  if (action === "complete") {
    const { sessionId, elapsed } = body as { sessionId: number; elapsed: number };
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    const session = await prisma.timeSession.findUnique({ where: { id: sessionId } });
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const actualElapsed = elapsed || session.duration * 60;

    await prisma.timeSession.update({
      where: { id: sessionId },
      data: {
        isCompleted: true,
        elapsed: actualElapsed,
        completedAt: new Date(),
      },
    });

    // Award XP based on minutes focused (1 XP per minute)
    const minutesFocused = Math.floor(actualElapsed / 60);
    const xpEarned = Math.max(5, minutesFocused);
    const goldEarned = Math.max(2, Math.floor(minutesFocused / 5));

    await prisma.hunter.update({
      where: { id: 1 },
      data: {
        xp: { increment: xpEarned },
        gold: { increment: goldEarned },
        focus: { increment: 1 },
      },
    });

    // Update daily snapshot
    const today = new Date().toISOString().split("T")[0];
    const existing = await prisma.dailySnapshot.findUnique({ where: { date: today } });
    if (existing) {
      await prisma.dailySnapshot.update({
        where: { date: today },
        data: { minutesFocused: { increment: minutesFocused } },
      });
    } else {
      await prisma.dailySnapshot.create({
        data: { date: today, minutesFocused },
      });
    }

    return NextResponse.json({
      success: true,
      xpEarned,
      goldEarned,
      minutesFocused,
    });
  }

  // Update elapsed time (for saving progress)
  if (action === "update_elapsed") {
    const { sessionId, elapsed } = body as { sessionId: number; elapsed: number };
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    await prisma.timeSession.update({
      where: { id: sessionId },
      data: { elapsed },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
