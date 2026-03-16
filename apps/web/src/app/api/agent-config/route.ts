// api/agent-config/route.ts — Manage per-agent configuration
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const configs = await prisma.agentConfig.findMany({
    orderBy: { agentName: "asc" },
  });

  return NextResponse.json(configs);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { agentName, enabled, config } = body as {
    agentName: string;
    enabled?: boolean;
    config?: string;
  };

  if (!agentName) {
    return NextResponse.json({ error: "agentName is required" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (enabled !== undefined) updateData.enabled = enabled;
  if (config !== undefined) updateData.config = config;

  const updated = await prisma.agentConfig.upsert({
    where: { agentName },
    update: updateData,
    create: {
      agentName,
      enabled: enabled ?? true,
      config: config || "{}",
    },
  });

  return NextResponse.json({ success: true, config: updated });
}
