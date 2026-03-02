// api/todos/route.ts — GET todos by date + POST create/toggle/delete/update/reorder
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
    orderBy: [{ isCompleted: "asc" }, { sortOrder: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ todos, date, today: todayStr(), tomorrow: tomorrowStr() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body as { action?: string };

  // Create a new todo
  if (!action || action === "create") {
    const { title, description, date, priority, category } = body as {
      title: string;
      description?: string;
      date?: string;
      priority?: number;
      category?: string;
    };

    if (!title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const validCategories = ["general", "health", "learning", "jobs", "finance", "focus", "food", "mental", "agentiq"];
    const validDate = date || tomorrowStr();

    // Get the max sortOrder for this date to place new items at the end
    const maxSort = await prisma.todoItem.findFirst({
      where: { date: validDate },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const nextSortOrder = (maxSort?.sortOrder ?? -1) + 1;

    const todo = await prisma.todoItem.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        date: validDate,
        priority: Math.min(2, Math.max(0, priority || 0)),
        sortOrder: nextSortOrder,
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

    // Update DailySnapshot for analytics when completing (not uncompleting)
    if (!todo.isCompleted) {
      const today = new Date().toISOString().split("T")[0];
      const existingSnap = await prisma.dailySnapshot.findUnique({ where: { date: today } });
      if (existingSnap) {
        await prisma.dailySnapshot.update({
          where: { date: today },
          data: { todosCompleted: { increment: 1 } },
        });
      } else {
        await prisma.dailySnapshot.create({
          data: { date: today, todosCompleted: 1 },
        });
      }
    }

    return NextResponse.json({ success: true, todo: updated });
  }

  // Update a todo (edit title, description, priority, category)
  if (action === "update") {
    const { todoId, title, description, priority, category } = body as {
      todoId: number;
      title?: string;
      description?: string;
      priority?: number;
      category?: string;
    };
    if (!todoId) return NextResponse.json({ error: "todoId required" }, { status: 400 });

    const todo = await prisma.todoItem.findUnique({ where: { id: todoId } });
    if (!todo) return NextResponse.json({ error: "Todo not found" }, { status: 404 });

    const validCategories = ["general", "health", "learning", "jobs", "finance", "focus", "food", "mental", "agentiq"];
    const updateData: Record<string, unknown> = {};
    if (title !== undefined && title.trim()) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = Math.min(2, Math.max(0, priority));
    if (category !== undefined && validCategories.includes(category)) updateData.category = category;

    const updated = await prisma.todoItem.update({
      where: { id: todoId },
      data: updateData,
    });

    return NextResponse.json({ success: true, todo: updated });
  }

  // Reorder todos (drag & drop) — receives array of { id, sortOrder }
  if (action === "reorder") {
    const { items } = body as { items: Array<{ id: number; sortOrder: number }> };
    if (!items?.length) return NextResponse.json({ error: "items required" }, { status: 400 });

    for (const item of items) {
      await prisma.todoItem.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      });
    }

    return NextResponse.json({ success: true });
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
        const maxSort = await prisma.todoItem.findFirst({
          where: { date: tomorrow },
          orderBy: { sortOrder: "desc" },
          select: { sortOrder: true },
        });
        await prisma.todoItem.create({
          data: {
            title: todo.title,
            description: todo.description,
            date: tomorrow,
            priority: todo.priority,
            sortOrder: (maxSort?.sortOrder ?? -1) + 1,
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
