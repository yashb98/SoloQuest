// api/quest-chains/route.ts — CRUD for quest chains + complete steps
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const chains = await prisma.questChain.findMany({
    orderBy: [{ isCompleted: "asc" }, { createdAt: "desc" }],
  });

  // Get steps for each chain
  const chainsWithSteps = await Promise.all(
    chains.map(async (chain) => {
      const steps = await prisma.questChainStep.findMany({
        where: { chainId: chain.id },
        orderBy: { stepOrder: "asc" },
      });
      return { ...chain, steps };
    })
  );

  return NextResponse.json(chainsWithSteps);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body as { action?: string };

  // Create a new chain with steps
  if (!action || action === "create") {
    const { title, description, steps, xpBonus, goldBonus } = body as {
      title: string;
      description?: string;
      steps: Array<{
        title: string;
        category?: string;
        difficulty?: string;
        xpBase?: number;
        goldBase?: number;
        statTarget?: string;
      }>;
      xpBonus?: number;
      goldBonus?: number;
    };

    if (!title?.trim() || !steps?.length) {
      return NextResponse.json({ error: "title and steps required" }, { status: 400 });
    }

    const chain = await prisma.questChain.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        totalSteps: steps.length,
        currentStep: 0,
        xpBonus: xpBonus || Math.floor(steps.length * 50),
        goldBonus: goldBonus || Math.floor(steps.length * 15),
      },
    });

    for (let i = 0; i < steps.length; i++) {
      await prisma.questChainStep.create({
        data: {
          chainId: chain.id,
          stepOrder: i + 1,
          title: steps[i].title,
          category: steps[i].category || "focus",
          difficulty: steps[i].difficulty || "normal",
          xpBase: steps[i].xpBase || 50,
          goldBase: steps[i].goldBase || 10,
          statTarget: steps[i].statTarget || "focus",
        },
      });
    }

    return NextResponse.json({ success: true, chain });
  }

  // Complete a step
  if (action === "complete_step") {
    const { stepId } = body as { stepId: number };
    if (!stepId) return NextResponse.json({ error: "stepId required" }, { status: 400 });

    const step = await prisma.questChainStep.findUnique({ where: { id: stepId } });
    if (!step || step.isCompleted) {
      return NextResponse.json({ error: "Step not found or already completed" }, { status: 400 });
    }

    await prisma.questChainStep.update({
      where: { id: stepId },
      data: { isCompleted: true, completedAt: new Date() },
    });

    // Award XP and gold for step
    const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
    if (hunter) {
      await prisma.hunter.update({
        where: { id: 1 },
        data: {
          xp: { increment: step.xpBase },
          gold: { increment: step.goldBase },
        },
      });
    }

    // Update chain progress
    const chain = await prisma.questChain.findUnique({ where: { id: step.chainId } });
    if (chain) {
      const completedSteps = await prisma.questChainStep.count({
        where: { chainId: chain.id, isCompleted: true },
      });

      const isChainDone = completedSteps >= chain.totalSteps;
      await prisma.questChain.update({
        where: { id: chain.id },
        data: {
          currentStep: completedSteps,
          isCompleted: isChainDone,
          completedAt: isChainDone ? new Date() : null,
        },
      });

      // Bonus rewards for completing the entire chain
      if (isChainDone && hunter) {
        await prisma.hunter.update({
          where: { id: 1 },
          data: {
            xp: { increment: chain.xpBonus },
            gold: { increment: chain.goldBonus },
          },
        });

        return NextResponse.json({
          success: true,
          chainCompleted: true,
          xpEarned: step.xpBase + chain.xpBonus,
          goldEarned: step.goldBase + chain.goldBonus,
        });
      }
    }

    return NextResponse.json({
      success: true,
      chainCompleted: false,
      xpEarned: step.xpBase,
      goldEarned: step.goldBase,
    });
  }

  // Delete a chain
  if (action === "delete") {
    const { chainId } = body as { chainId: number };
    if (!chainId) return NextResponse.json({ error: "chainId required" }, { status: 400 });

    await prisma.questChainStep.deleteMany({ where: { chainId } });
    await prisma.questChain.delete({ where: { id: chainId } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
