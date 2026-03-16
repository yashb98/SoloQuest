// api/roadmap/progress/route.ts — Aggregated progress for active job roadmap
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  if (!hunter.activeRoadmapId) {
    return NextResponse.json({ hasRoadmap: false });
  }

  const roadmapId = hunter.activeRoadmapId;

  const roadmap = await prisma.jobRoadmap.findUnique({
    where: { id: roadmapId },
  });

  if (!roadmap) {
    return NextResponse.json({ hasRoadmap: false });
  }

  // Aggregate progress across all entity types linked to this roadmap
  const [
    allQuests,
    allDungeons,
    allCerts,
    allGoals,
    allChains,
    allHabits,
  ] = await Promise.all([
    prisma.quest.findMany({ where: { roadmapId } }),
    prisma.dungeon.findMany({ where: { roadmapId } }),
    prisma.certRoadmap.findMany({ where: { roadmapId } }),
    prisma.goal.findMany({ where: { roadmapId } }),
    prisma.questChain.findMany({ where: { roadmapId } }),
    prisma.todoItem.findMany({ where: { isRecurring: true, roadmapId } }),
  ]);

  const totalQuests = allQuests.length;
  const completedQuests = allQuests.filter((q) => q.isCompleted).length;

  const totalDungeons = allDungeons.length;
  const completedDungeons = allDungeons.filter((d) => d.isCompleted).length;

  const totalCerts = allCerts.length;
  const passedCerts = allCerts.filter((c) => c.isPassed).length;

  const totalGoals = allGoals.length;
  const completedGoals = allGoals.filter((g) => g.isCompleted).length;

  const totalChains = allChains.length;
  const completedChains = allChains.filter((ch) => ch.isCompleted).length;

  const totalHabits = allHabits.length;

  // Calculate overall progress percentage
  const totalItems = totalQuests + totalDungeons + totalCerts + totalGoals + totalChains;
  const completedItems = completedQuests + completedDungeons + passedCerts + completedGoals + completedChains;
  const overall = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Parse milestones from JSON string
  let milestones: Array<{ title: string; description: string; weekNumber: number; isCompleted: boolean }> = [];
  try {
    milestones = JSON.parse(roadmap.milestones);
  } catch {
    milestones = [];
  }

  return NextResponse.json({
    hasRoadmap: true,
    roadmap: {
      id: roadmap.id,
      targetRole: roadmap.targetRole,
      experienceLevel: roadmap.experienceLevel,
      timeline: roadmap.timeline,
      summary: roadmap.summary,
      createdAt: roadmap.createdAt,
    },
    progress: {
      quests: { total: totalQuests, completed: completedQuests },
      dungeons: { total: totalDungeons, completed: completedDungeons },
      certs: { total: totalCerts, passed: passedCerts },
      goals: { total: totalGoals, completed: completedGoals },
      chains: { total: totalChains, completed: completedChains },
      habits: { total: totalHabits },
      overall,
    },
    milestones,
  });
}
