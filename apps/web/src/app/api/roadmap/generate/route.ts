// api/roadmap/generate/route.ts — AI-powered roadmap content generation
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roadmapId, regenerate } = body as { roadmapId: number; regenerate?: boolean };

  if (!roadmapId) {
    return NextResponse.json({ error: "roadmapId required" }, { status: 400 });
  }

  const roadmap = await prisma.jobRoadmap.findUnique({ where: { id: roadmapId } });
  if (!roadmap) return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) return NextResponse.json({ error: "Hunter not found" }, { status: 404 });

  // If regenerating, delete all existing items with this roadmapId
  if (regenerate) {
    const chains = await prisma.questChain.findMany({ where: { roadmapId }, select: { id: true } });
    for (const chain of chains) {
      await prisma.questChainStep.deleteMany({ where: { chainId: chain.id } });
    }
    const quests = await prisma.quest.findMany({ where: { roadmapId }, select: { id: true } });
    for (const quest of quests) {
      await prisma.completion.deleteMany({ where: { questId: quest.id } });
    }
    const certs = await prisma.certRoadmap.findMany({ where: { roadmapId }, select: { id: true } });
    for (const cert of certs) {
      await prisma.todoItem.deleteMany({ where: { certId: cert.id } });
    }
    await Promise.all([
      prisma.quest.deleteMany({ where: { roadmapId } }),
      prisma.dungeon.deleteMany({ where: { roadmapId } }),
      prisma.goal.deleteMany({ where: { roadmapId } }),
      prisma.todoItem.deleteMany({ where: { roadmapId } }),
      prisma.questChain.deleteMany({ where: { roadmapId } }),
      prisma.certRoadmap.deleteMany({ where: { roadmapId } }),
    ]);
  }

  // Try AI generation
  let data: RoadmapData | null = null;
  try {
    const { generateJobRoadmap } = await import("@/lib/ai");
    const raw = await generateJobRoadmap({
      hunterName: hunter.hunterName,
      level: hunter.level,
      rank: hunter.rank,
      stats: {
        vitality: hunter.vitality,
        intel: hunter.intel,
        hustle: hunter.hustle,
        wealth: hunter.wealth,
        focus: hunter.focus,
        agentIQ: hunter.agentIQ,
      },
      targetRole: roadmap.targetRole,
      experienceLevel: roadmap.experienceLevel,
      skills: JSON.parse(roadmap.skills),
      timeline: roadmap.timeline,
    });

    if (raw) {
      // Try to parse JSON — handle markdown wrapping
      let jsonStr = raw;
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1];
      data = JSON.parse(jsonStr);
    }
  } catch (err) {
    console.warn("[Roadmap] AI generation failed, using fallback:", (err as Error).message);
  }

  // Fallback to templates
  if (!data) {
    try {
      const { getTemplate } = await import("@/lib/roadmap-templates");
      data = getTemplate(roadmap.targetRole) as unknown as RoadmapData;
    } catch {
      return NextResponse.json({ error: "Failed to generate roadmap content" }, { status: 500 });
    }
  }

  // Create all entities
  const created = { quests: 0, dungeons: 0, certs: 0, goals: 0, habits: 0, chains: 0 };

  // 1. Create quests
  if (data.quests?.length) {
    for (const q of data.quests) {
      await prisma.quest.create({
        data: {
          title: q.title,
          category: q.category || "learning",
          difficulty: q.difficulty || "normal",
          tier: q.tier || "daily",
          xpBase: q.xpBase || 50,
          goldBase: q.goldBase || 10,
          statTarget: q.statTarget || "intel",
          statGain: q.statGain || 1,
          isDaily: q.isDaily ?? (q.tier === "daily"),
          roadmapId,
        },
      });
      created.quests++;
    }
  }

  // 2. Create dungeons
  if (data.dungeons?.length) {
    for (const d of data.dungeons) {
      await prisma.dungeon.create({
        data: {
          title: d.title,
          description: d.description || "",
          objectives: JSON.stringify(d.objectives || []),
          bonusXP: d.bonusXP || 800,
          bonusGold: d.bonusGold || 200,
          statReward: d.statReward || "intel",
          statAmount: d.statAmount || 6,
          roadmapId,
        },
      });
      created.dungeons++;
    }
  }

  // 3. Create certifications (+ auto-generate study plans)
  if (data.certifications?.length) {
    for (const c of data.certifications) {
      const cert = await prisma.certRoadmap.create({
        data: {
          certName: c.certName,
          provider: c.provider,
          totalWeeks: c.totalWeeks || 8,
          weeklyHours: c.weeklyHours || 10,
          goldBonus: c.goldBonus || 2000,
          roadmapId,
        },
      });

      // Try to auto-generate study plan for this cert
      try {
        const { generateCertStudyPlan } = await import("@/lib/ai");
        const planRaw = await generateCertStudyPlan({
          certName: c.certName,
          provider: c.provider,
          totalWeeks: c.totalWeeks || 8,
          weeklyHours: c.weeklyHours || 10,
          hunterLevel: hunter.level,
        });
        if (planRaw) {
          let planJson = planRaw;
          const match = planRaw.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (match) planJson = match[1];
          const parsed = JSON.parse(planJson);
          await prisma.certRoadmap.update({
            where: { id: cert.id },
            data: { studyPlan: JSON.stringify(parsed.weeks || parsed) },
          });
        }
      } catch {
        // Study plan generation failed — cert still created without plan
      }

      created.certs++;
    }
  }

  // 4. Create goals
  if (data.goals?.length) {
    for (const g of data.goals) {
      const targetDate = g.weeksFromNow
        ? new Date(Date.now() + g.weeksFromNow * 7 * 24 * 60 * 60 * 1000)
        : null;
      await prisma.goal.create({
        data: {
          type: g.type || "sprint",
          title: g.title,
          description: g.description || "",
          targetDate,
          xpReward: g.xpReward || 200,
          goldReward: g.goldReward || 100,
          roadmapId,
        },
      });
      created.goals++;
    }
  }

  // 5. Create recurring habits as todo templates
  if (data.recurringHabits?.length) {
    for (const h of data.recurringHabits) {
      await prisma.todoItem.create({
        data: {
          title: h.title,
          description: "",
          date: "recurring",
          category: h.category || "learning",
          priority: h.priority || 0,
          isRecurring: true,
          recurType: h.recurType || "daily",
          roadmapId,
        },
      });
      created.habits++;
    }
  }

  // 6. Create quest chains
  if (data.questChains?.length) {
    for (const chain of data.questChains) {
      const steps = chain.steps || [];
      const created_chain = await prisma.questChain.create({
        data: {
          title: chain.title,
          description: chain.description || "",
          totalSteps: steps.length,
          xpBonus: steps.length * 50,
          goldBonus: steps.length * 15,
          roadmapId,
        },
      });

      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        await prisma.questChainStep.create({
          data: {
            chainId: created_chain.id,
            stepOrder: i + 1,
            title: s.title,
            category: s.category || "learning",
            difficulty: s.difficulty || "normal",
            xpBase: s.xpBase || 50,
            goldBase: s.goldBase || 10,
            statTarget: s.statTarget || "intel",
          },
        });
      }
      created.chains++;
    }
  }

  // 7. Update roadmap with milestones and summary
  const milestones = (data.milestones || []).map((m: { title: string; description: string; weekNumber: number }) => ({
    ...m,
    isCompleted: false,
  }));

  await prisma.jobRoadmap.update({
    where: { id: roadmapId },
    data: {
      milestones: JSON.stringify(milestones),
      summary: data.summary || `Career roadmap for ${roadmap.targetRole}`,
    },
  });

  return NextResponse.json({
    success: true,
    created,
    summary: data.summary || "",
  });
}

// Type for the AI/fallback response
interface RoadmapData {
  summary?: string;
  quests?: Array<{
    title: string; category?: string; difficulty?: string; tier?: string;
    xpBase?: number; goldBase?: number; statTarget?: string; statGain?: number; isDaily?: boolean;
  }>;
  dungeons?: Array<{
    title: string; description?: string; objectives?: string[];
    bonusXP?: number; bonusGold?: number; statReward?: string; statAmount?: number;
  }>;
  certifications?: Array<{
    certName: string; provider: string; totalWeeks?: number; weeklyHours?: number; goldBonus?: number;
  }>;
  goals?: Array<{
    type?: string; title: string; description?: string;
    weeksFromNow?: number; xpReward?: number; goldReward?: number;
  }>;
  recurringHabits?: Array<{
    title: string; category?: string; priority?: number; recurType?: string;
  }>;
  questChains?: Array<{
    title: string; description?: string;
    steps?: Array<{
      title: string; category?: string; difficulty?: string;
      xpBase?: number; goldBase?: number; statTarget?: string;
    }>;
  }>;
  milestones?: Array<{
    title: string; description: string; weekNumber: number;
  }>;
}
