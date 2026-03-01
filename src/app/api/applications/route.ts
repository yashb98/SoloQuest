// api/applications/route.ts — Job application tracker (Step 9)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const STAGE_XP: Record<string, { xp: number; gold: number }> = {
  discovered: { xp: 10, gold: 2 },
  applied: { xp: 40, gold: 10 },
  followed_up: { xp: 30, gold: 8 },
  phone_screen: { xp: 80, gold: 20 },
  technical: { xp: 150, gold: 40 },
  final: { xp: 200, gold: 50 },
  offer: { xp: 500, gold: 200 },
  accepted: { xp: 1000, gold: 500 },
  rejected: { xp: 20, gold: 5 },
};

export async function GET() {
  const applications = await prisma.application.findMany({
    orderBy: { updatedAt: "desc" },
  });

  // Pipeline summary
  const pipeline: Record<string, number> = {};
  for (const app of applications) {
    pipeline[app.status] = (pipeline[app.status] || 0) + 1;
  }

  return NextResponse.json({ applications, pipeline });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body as { action?: string };

  if (action === "create") {
    const { company, role, link, salaryRange, contactPerson, notes } = body as {
      company: string; role: string; link?: string;
      salaryRange?: string; contactPerson?: string; notes?: string;
    };

    if (!company || !role) {
      return NextResponse.json({ error: "company and role required" }, { status: 400 });
    }

    const app = await prisma.application.create({
      data: { company, role, link: link || "", salaryRange, contactPerson, notes },
    });

    // Award XP for discovering
    const reward = STAGE_XP.discovered;
    await prisma.hunter.update({
      where: { id: 1 },
      data: {
        xp: { increment: reward.xp },
        gold: { increment: reward.gold },
        hustle: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, application: app, xp: reward.xp, gold: reward.gold });
  }

  if (action === "update_status") {
    const { applicationId, status } = body as { applicationId: number; status: string };

    const validStatuses = Object.keys(STAGE_XP);
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    // Award XP for stage progression
    const reward = STAGE_XP[status];
    await prisma.hunter.update({
      where: { id: 1 },
      data: {
        xp: { increment: reward.xp },
        gold: { increment: reward.gold },
        hustle: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, status, xp: reward.xp, gold: reward.gold });
  }

  if (action === "update") {
    const { applicationId, ...fields } = body as { applicationId: number; [key: string]: unknown };
    delete fields.action;
    await prisma.application.update({ where: { id: applicationId }, data: fields });
    return NextResponse.json({ success: true });
  }

  if (action === "delete") {
    const { applicationId } = body as { applicationId: number };
    await prisma.application.delete({ where: { id: applicationId } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
