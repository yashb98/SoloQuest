// api/todos/recurring/route.ts — Manage recurring tasks: create recurring templates, generate daily instances
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function getDayOfWeek(): string {
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date().getDay()];
}

export async function GET() {
  // Get all recurring task templates
  const recurring = await prisma.todoItem.findMany({
    where: { isRecurring: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(recurring);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body as { action?: string };

  // Create a recurring task template
  if (!action || action === "create") {
    const { title, category, priority, recurType, recurDays } = body as {
      title: string;
      category?: string;
      priority?: number;
      recurType: string; // daily|weekly|weekdays|custom
      recurDays?: string[]; // for custom: ["mon","wed","fri"]
    };

    if (!title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const template = await prisma.todoItem.create({
      data: {
        title: title.trim(),
        date: "recurring", // special marker
        isRecurring: true,
        recurType,
        recurDays: recurDays ? JSON.stringify(recurDays) : null,
        category: category || "general",
        priority: priority || 0,
      },
    });

    return NextResponse.json({ success: true, template });
  }

  // Generate today's recurring tasks (called daily or on page load)
  if (action === "generate_today") {
    const today = todayStr();
    const dayOfWeek = getDayOfWeek();

    const templates = await prisma.todoItem.findMany({
      where: { isRecurring: true },
    });

    let created = 0;

    for (const tpl of templates) {
      // Check if this template should fire today
      let shouldCreate = false;

      if (tpl.recurType === "daily") {
        shouldCreate = true;
      } else if (tpl.recurType === "weekdays") {
        shouldCreate = !["sat", "sun"].includes(dayOfWeek);
      } else if (tpl.recurType === "weekly") {
        // Weekly = same day as creation day
        const createDay = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date(tpl.createdAt).getDay()];
        shouldCreate = dayOfWeek === createDay;
      } else if (tpl.recurType === "custom" && tpl.recurDays) {
        try {
          const days = JSON.parse(tpl.recurDays) as string[];
          shouldCreate = days.includes(dayOfWeek);
        } catch { /* skip */ }
      }

      if (!shouldCreate) continue;

      // Check if already exists for today
      const existing = await prisma.todoItem.findFirst({
        where: { title: tpl.title, date: today, isRecurring: false },
      });

      if (!existing) {
        const maxSort = await prisma.todoItem.findFirst({
          where: { date: today },
          orderBy: { sortOrder: "desc" },
          select: { sortOrder: true },
        });

        await prisma.todoItem.create({
          data: {
            title: tpl.title,
            description: tpl.description,
            date: today,
            priority: tpl.priority,
            sortOrder: (maxSort?.sortOrder ?? -1) + 1,
            category: tpl.category,
            isRecurring: false, // this is an instance, not a template
          },
        });
        created++;
      }
    }

    return NextResponse.json({ success: true, created, date: today });
  }

  // Delete a recurring template
  if (action === "delete") {
    const { templateId } = body as { templateId: number };
    if (!templateId) return NextResponse.json({ error: "templateId required" }, { status: 400 });

    await prisma.todoItem.delete({ where: { id: templateId } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
