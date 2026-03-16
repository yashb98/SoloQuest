// POST /api/todos/progress — Update todo progress (called by AI agents)
// Body: { todoId, progressCurrent?, progressTarget?, progress?, progressUnit? }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { todoId, progressCurrent, progressTarget, progress, progressUnit } = body;

    if (!todoId) {
      return NextResponse.json({ error: "todoId required" }, { status: 400 });
    }

    const todo = await prisma.todoItem.findUnique({ where: { id: todoId } });
    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const update: any = {};

    if (progressCurrent !== undefined) update.progressCurrent = progressCurrent;
    if (progressTarget !== undefined) update.progressTarget = progressTarget;
    if (progressUnit !== undefined) update.progressUnit = progressUnit;

    if (progress !== undefined) {
      update.progress = Math.min(Math.max(Math.round(progress), 0), 100);
    } else if (progressCurrent !== undefined) {
      const target = progressTarget ?? todo.progressTarget;
      if (target > 0) {
        update.progress = Math.min(Math.max(Math.round((progressCurrent / target) * 100), 0), 100);
      }
    }

    const finalProgress = update.progress ?? todo.progress;
    if (finalProgress >= 100 && todo.autoComplete && !todo.isCompleted) {
      update.isCompleted = true;
      update.completedAt = new Date();
      update.progress = 100;
    }

    const updated = await prisma.todoItem.update({
      where: { id: todoId },
      data: update,
    });

    return NextResponse.json({ todo: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
