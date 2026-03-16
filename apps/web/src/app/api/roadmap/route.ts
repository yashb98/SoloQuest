// api/roadmap/route.ts — Job Roadmap CRUD
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter?.activeRoadmapId) {
    return NextResponse.json({ roadmap: null });
  }

  const roadmap = await prisma.jobRoadmap.findUnique({
    where: { id: hunter.activeRoadmapId },
  });

  return NextResponse.json({ roadmap });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body as { action?: string };

  // Create a new roadmap profile
  if (!action || action === "create") {
    const { targetRole, experienceLevel, skills, timeline } = body as {
      targetRole: string;
      experienceLevel?: string;
      skills?: string[];
      timeline?: string;
    };

    if (!targetRole?.trim()) {
      return NextResponse.json({ error: "targetRole required" }, { status: 400 });
    }

    // Deactivate any existing active roadmap
    await prisma.jobRoadmap.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    const roadmap = await prisma.jobRoadmap.create({
      data: {
        targetRole: targetRole.trim(),
        experienceLevel: experienceLevel || "beginner",
        skills: JSON.stringify(skills || []),
        timeline: timeline || "6m",
      },
    });

    // Set as active on hunter
    await prisma.hunter.update({
      where: { id: 1 },
      data: { activeRoadmapId: roadmap.id },
    });

    return NextResponse.json({ success: true, roadmap });
  }

  // Update an existing roadmap profile
  if (action === "update") {
    const { roadmapId, targetRole, experienceLevel, skills, timeline } = body as {
      roadmapId: number;
      targetRole?: string;
      experienceLevel?: string;
      skills?: string[];
      timeline?: string;
    };

    if (!roadmapId) return NextResponse.json({ error: "roadmapId required" }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (targetRole) updateData.targetRole = targetRole.trim();
    if (experienceLevel) updateData.experienceLevel = experienceLevel;
    if (skills) updateData.skills = JSON.stringify(skills);
    if (timeline) updateData.timeline = timeline;

    const roadmap = await prisma.jobRoadmap.update({
      where: { id: roadmapId },
      data: updateData,
    });

    return NextResponse.json({ success: true, roadmap });
  }

  // Delete roadmap and all associated generated content
  if (action === "delete") {
    const { roadmapId } = body as { roadmapId: number };
    if (!roadmapId) return NextResponse.json({ error: "roadmapId required" }, { status: 400 });

    // Delete all generated items tagged with this roadmapId
    // Delete quest chain steps first (foreign key-like dependency)
    const chains = await prisma.questChain.findMany({
      where: { roadmapId },
      select: { id: true },
    });
    for (const chain of chains) {
      await prisma.questChainStep.deleteMany({ where: { chainId: chain.id } });
    }

    // Delete completions for roadmap quests
    const quests = await prisma.quest.findMany({
      where: { roadmapId },
      select: { id: true },
    });
    for (const quest of quests) {
      await prisma.completion.deleteMany({ where: { questId: quest.id } });
    }

    // Delete all tagged entities
    await Promise.all([
      prisma.quest.deleteMany({ where: { roadmapId } }),
      prisma.dungeon.deleteMany({ where: { roadmapId } }),
      prisma.goal.deleteMany({ where: { roadmapId } }),
      prisma.todoItem.deleteMany({ where: { roadmapId } }),
      prisma.questChain.deleteMany({ where: { roadmapId } }),
    ]);

    // Delete cert roadmaps + their todos
    const certs = await prisma.certRoadmap.findMany({
      where: { roadmapId },
      select: { id: true },
    });
    for (const cert of certs) {
      await prisma.todoItem.deleteMany({ where: { certId: cert.id } });
    }
    await prisma.certRoadmap.deleteMany({ where: { roadmapId } });

    // Delete the roadmap itself
    await prisma.jobRoadmap.delete({ where: { id: roadmapId } });

    // Clear hunter's active roadmap
    await prisma.hunter.update({
      where: { id: 1 },
      data: { activeRoadmapId: null },
    });

    return NextResponse.json({ success: true });
  }

  // Deactivate (keep items but unlink)
  if (action === "deactivate") {
    const { roadmapId } = body as { roadmapId: number };
    if (!roadmapId) return NextResponse.json({ error: "roadmapId required" }, { status: 400 });

    await prisma.jobRoadmap.update({
      where: { id: roadmapId },
      data: { isActive: false },
    });

    await prisma.hunter.update({
      where: { id: 1 },
      data: { activeRoadmapId: null },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
