// api/todos/route.ts — GET todos by date + POST create/toggle/delete
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || todayStr();

  const todos = await prisma.todoItem.findMany({
    where: { date },
    orderBy: [{ isCompleted: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ todos, date, today: todayStr(), tomorrow: tomorrowStr() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body as { action?: string };

  // Create a new todo
  if (!action || action === "create") {
    const { title, date, priority, category } = body as {
      title: string;
      date?: string;
      priority?: number;
      category?: string;
    };

    if (!title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const validCategories = ["general", "health", "learning", "jobs", "finance", "focus", "food", "mental", "agentiq"];
    const validDate = date || tomorrowStr();

    const todo = await prisma.todoItem.create({
      data: {
        title: title.trim(),
        date: validDate,
        priority: Math.min(2, Math.max(0, priority || 0)),
        category: validCategories.includes(category || "") ? category! : "general",
      },
    });

    return NextResponse.json({ success: true, todo });
  }

  // Toggle completion
  if (action === "toggle") {
    const { todoId } = body as { todoId: number };
    if (!todoId) return NextResponse.json({ error: "todoId required" }, { status: 400 });

    const todo = await prisma.todoItem.findUnique({ where: { id: todoId } });
    if (!todo) return NextResponse.json({ error: "Todo not found" }, { status: 404 });

    const updated = await prisma.todoItem.update({
      where: { id: todoId },
      data: {
        isCompleted: !todo.isCompleted,
        completedAt: !todo.isCompleted ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, todo: updated });
  }

  // Delete a todo
  if (action === "delete") {
    const { todoId } = body as { todoId: number };
    if (!todoId) return NextResponse.json({ error: "todoId required" }, { status: 400 });

    await prisma.todoItem.delete({ where: { id: todoId } });
    return NextResponse.json({ success: true });
  }

  // Copy incomplete todos from today to tomorrow
  if (action === "carry_over") {
    const today = todayStr();
    const tomorrow = tomorrowStr();

    const incompleteTodos = await prisma.todoItem.findMany({
      where: { date: today, isCompleted: false },
    });

    let created = 0;
    for (const todo of incompleteTodos) {
      // Check if already exists for tomorrow
      const exists = await prisma.todoItem.findFirst({
        where: { title: todo.title, date: tomorrow },
      });
      if (!exists) {
        await prisma.todoItem.create({
          data: {
            title: todo.title,
            date: tomorrow,
            priority: todo.priority,
            category: todo.category,
          },
        });
        created++;
      }
    }

    return NextResponse.json({ success: true, carried: created });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
