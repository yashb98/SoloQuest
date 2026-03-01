// api/certs/route.ts — Certification roadmap tracker (Step 8)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const certs = await prisma.certRoadmap.findMany({
    orderBy: [{ isPassed: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(certs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body as { action?: string };

  if (action === "create") {
    const { certName, provider, totalWeeks, weeklyHours, targetExamDate, goldBonus } = body as {
      certName: string; provider: string; totalWeeks?: number;
      weeklyHours?: number; targetExamDate?: string; goldBonus?: number;
    };

    if (!certName || !provider) {
      return NextResponse.json({ error: "certName and provider required" }, { status: 400 });
    }

    const cert = await prisma.certRoadmap.create({
      data: {
        certName,
        provider,
        totalWeeks: totalWeeks || 8,
        weeklyHours: weeklyHours || 10,
        targetExamDate: targetExamDate ? new Date(targetExamDate) : null,
        goldBonus: goldBonus || 2000,
      },
    });

    return NextResponse.json({ success: true, cert });
  }

  if (action === "advance_week") {
    const { certId } = body as { certId: number };
    const cert = await prisma.certRoadmap.findUnique({ where: { id: certId } });
    if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.certRoadmap.update({
      where: { id: certId },
      data: { currentWeek: { increment: 1 } },
    });

    return NextResponse.json({ success: true, currentWeek: cert.currentWeek + 1 });
  }

  if (action === "pass") {
    const { certId } = body as { certId: number };
    const cert = await prisma.certRoadmap.findUnique({ where: { id: certId } });
    if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.certRoadmap.update({
      where: { id: certId },
      data: { isPassed: true, passedAt: new Date() },
    });

    // Award massive bonus (Step 8.3)
    await prisma.hunter.update({
      where: { id: 1 },
      data: {
        xp: { increment: 500 },
        gold: { increment: cert.goldBonus },
        intel: { increment: 10 },
      },
    });

    return NextResponse.json({
      success: true,
      xpReward: 500,
      goldReward: cert.goldBonus,
      statReward: "+10 Intel",
    });
  }

  if (action === "delete") {
    const { certId } = body as { certId: number };
    await prisma.certRoadmap.delete({ where: { id: certId } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
