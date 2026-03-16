// api/agent-runs/route.ts — View agent execution history
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const agentName = searchParams.get("agent");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (agentName) where.agentName = agentName;
  if (status) where.status = status;

  const runs = await prisma.agentRun.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(runs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agentName, eventType, input, output, status, durationMs, traceId } = body;

  if (!agentName || !eventType) {
    return NextResponse.json({ error: "agentName and eventType are required" }, { status: 400 });
  }

  const run = await prisma.agentRun.create({
    data: {
      agentName,
      eventType,
      input: JSON.stringify(input || {}),
      output: JSON.stringify(output || {}),
      status: status || "success",
      durationMs: durationMs || 0,
      traceId: traceId || null,
    },
  });

  return NextResponse.json({ success: true, id: run.id });
}
