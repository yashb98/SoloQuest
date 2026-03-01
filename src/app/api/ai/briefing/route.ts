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

  // Check if briefing already exists for today
  const existing = await prisma.briefing.findFirst({
    where: { date: today },
  });

  if (existing) {
    return NextResponse.json({ briefing: existing.content, cached: true });
  }

  // Generate new briefing
  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  // Find weakest stat
  const stats = {
    discipline: hunter.discipline,
    vitality: hunter.vitality,
    intelligence: hunter.intelligence,
    hustle: hunter.hustle,
    wealth: hunter.wealth,
  };
  const weakestStat = Object.entries(stats).sort((a, b) => a[1] - b[1])[0];

  // Get today's active quests
  const quests = await prisma.quest.findMany({
    where: { isActive: true, isCompleted: false, unlocksAtLevel: { lte: hunter.level } },
    take: 5,
  });

  try {
    const briefingText = await generateBriefing({
      hunterName: hunter.hunterName,
      rank: hunter.rank,
      level: hunter.level,
      streak: hunter.streak,
      weakestStat: weakestStat[0],
      weakestStatValue: weakestStat[1],
      hasShift: false,
      questTitles: quests.map((q) => q.title),
    });

    // Cache it
    await prisma.briefing.create({
      data: { content: briefingText, date: today },
    });

    return NextResponse.json({ briefing: briefingText, cached: false });
  } catch (error) {
    console.error("Briefing generation failed:", error);
    // Fallback briefing if AI fails
    const fallback = `Hunter ${hunter.hunterName}. Rank ${hunter.rank}-${hunter.level}. Streak: ${hunter.streak} days. ${quests.length} quests await. Begin.`;
    return NextResponse.json({ briefing: fallback, cached: false, fallback: true });
  }
}
