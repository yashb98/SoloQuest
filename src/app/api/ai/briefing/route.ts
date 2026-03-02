// api/ai/briefing/route.ts — GET cached daily briefing from Claude
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateBriefing } from "@/lib/ai";

export const dynamic = "force-dynamic";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET() {
  const today = todayStr();

  const existing = await prisma.briefing.findFirst({ where: { date: today } });
  if (existing) {
    return NextResponse.json({ briefing: existing.content, cached: true });
  }

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  const stats: Record<string, number> = {
    vitality: hunter.vitality,
    intel: hunter.intel,
    hustle: hunter.hustle,
    wealth: hunter.wealth,
    focus: hunter.focus,
    agentIQ: hunter.agentIQ,
  };
  const weakestEntry = Object.entries(stats).sort((a, b) => a[1] - b[1])[0];

  const quests = await prisma.quest.findMany({
    where: { isActive: true, isCompleted: false, unlocksAtLevel: { lte: hunter.level } },
    take: 5,
  });

  // Fetch active roadmap target role for career-aware briefings
  let targetRole: string | undefined;
  if (hunter.activeRoadmapId) {
    const roadmap = await prisma.jobRoadmap.findUnique({ where: { id: hunter.activeRoadmapId } });
    if (roadmap) targetRole = roadmap.targetRole;
  }

  try {
    const briefingText = await generateBriefing({
      hunterName: hunter.hunterName,
      class: hunter.class,
      rank: hunter.rank,
      level: hunter.level,
      streak: hunter.streak,
      weakestStat: weakestEntry[0],
      weakestStatValue: weakestEntry[1],
      stats,
      questTitles: quests.map((q) => q.title),
      targetRole,
    });

    await prisma.briefing.create({ data: { content: briefingText, date: today } });
    return NextResponse.json({ briefing: briefingText, cached: false });
  } catch (error) {
    console.error("Briefing generation failed:", error);
    const fallback = `Hunter ${hunter.hunterName}. Rank ${hunter.rank}-${hunter.level}. Streak: ${hunter.streak} days. ${quests.length} quests await. Begin.`;
    return NextResponse.json({ briefing: fallback, cached: false, fallback: true });
  }
}
