// api/ai/generate-task-details/route.ts — AI-generate description/steps for a task title
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Dynamic import to avoid build issues if ai.ts references missing env vars at import time
async function getAiCall() {
  const { generateTaskDetails } = await import("@/lib/ai");
  return generateTaskDetails;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, category, type } = body as {
    title: string;
    category?: string;
    type?: "todo" | "quest"; // context for AI
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const generateTaskDetails = await getAiCall();
    const description = await generateTaskDetails(title.trim(), category || "general", type || "todo");

    if (!description) {
      return NextResponse.json({
        success: true,
        description: `Steps for "${title}":\n1. Break down the task into smaller parts\n2. Set a timer and start working\n3. Review your progress\n4. Mark as complete when done`,
      });
    }

    return NextResponse.json({ success: true, description });
  } catch (err) {
    console.error("[AI] Task details generation failed:", err);
    return NextResponse.json({
      success: true,
      description: `Steps for "${title}":\n1. Break down the task into smaller parts\n2. Set a timer and start working\n3. Review your progress\n4. Mark as complete when done`,
    });
  }
}
