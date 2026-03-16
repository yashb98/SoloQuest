// POST /api/quests/progress — Update quest progress (called by AI agents)
// Body: { questId, progressCurrent?, progressTarget?, progress?, progressUnit? }
// Auto-completes quest if progress >= 100% and autoComplete is true
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questId, progressCurrent, progressTarget, progress, progressUnit } = body;

    if (!questId) {
      return NextResponse.json({ error: "questId required" }, { status: 400 });
    }

    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Build update data
    const update: any = {};

    if (progressCurrent !== undefined) update.progressCurrent = progressCurrent;
    if (progressTarget !== undefined) update.progressTarget = progressTarget;
    if (progressUnit !== undefined) update.progressUnit = progressUnit;

    // Calculate progress percentage
    if (progress !== undefined) {
      update.progress = Math.min(Math.max(Math.round(progress), 0), 100);
    } else if (progressCurrent !== undefined) {
      const target = progressTarget ?? quest.progressTarget;
      if (target > 0) {
        update.progress = Math.min(Math.max(Math.round((progressCurrent / target) * 100), 0), 100);
      }
    }

    // Auto-complete if progress hits 100% and autoComplete is enabled
    const finalProgress = update.progress ?? quest.progress;
    const shouldAutoComplete = finalProgress >= 100 && quest.autoComplete && !quest.isCompleted;

    if (shouldAutoComplete) {
      update.isCompleted = true;
      update.completedAt = new Date();
      update.progress = 100;
    }

    const updated = await prisma.quest.update({
      where: { id: questId },
      data: update,
    });

    // If auto-completed, award XP/gold/stats
    let rewards = null;
    if (shouldAutoComplete) {
      const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
      if (hunter) {
        rewards = {
          xp: quest.xpBase,
          gold: quest.goldBase,
          stat: quest.statTarget,
          statGain: quest.statGain,
        };

        const statUpdate: any = {};
        if (quest.statTarget && quest.statGain) {
          statUpdate[quest.statTarget] = { increment: quest.statGain };
        }

        await prisma.hunter.update({
          where: { id: 1 },
          data: {
            xp: { increment: quest.xpBase },
            gold: { increment: quest.goldBase },
            ...statUpdate,
          },
        });

        // Log completion
        await prisma.completion.create({
          data: {
            questId: quest.id,
            xpEarned: quest.xpBase,
            goldEarned: quest.goldBase,
            notes: `Auto-completed by agent at ${progressCurrent}/${quest.progressTarget} ${quest.progressUnit}`,
          },
        });
      }
    }

    return NextResponse.json({
      quest: updated,
      autoCompleted: shouldAutoComplete,
      rewards,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
