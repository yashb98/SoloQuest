// api/hunter/stats/route.ts — POST allocate stat points
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { stat } = body as { stat: string };

  const validStats = ["vitality", "intel", "hustle", "wealth", "focus", "agentIQ"];
  if (!validStats.includes(stat)) {
    return NextResponse.json({ error: "Invalid stat" }, { status: 400 });
  }

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter || hunter.statPoints <= 0) {
    return NextResponse.json({ error: "No stat points available" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {
    statPoints: { decrement: 1 },
    [stat]: { increment: 1 },
  };

  await prisma.hunter.update({ where: { id: 1 }, data: updateData });

  return NextResponse.json({ success: true, stat, remaining: hunter.statPoints - 1 });
}
