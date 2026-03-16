// api/achievements/check/route.ts — Auto-detect and unlock achievements based on current hunter state
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) return NextResponse.json({ error: "Hunter not found" }, { status: 404 });

  // Get all locked achievements
  const locked = await prisma.achievement.findMany({ where: { isUnlocked: false } });
  if (locked.length === 0) return NextResponse.json({ unlocked: [] });

  // Get completion counts by category
  const completions = await prisma.completion.findMany({
    include: { quest: { select: { category: true, title: true } } },
  });

  const totalCompletions = completions.length;

  // Count completions by category keyword matching
  const healthCompletions = completions.filter((c) =>
    ["health", "food"].includes(c.quest.category)
  ).length;
  const jobCompletions = completions.filter((c) => c.quest.category === "jobs").length;
  const learningCompletions = completions.filter((c) => c.quest.category === "learning").length;
  const _focusCompletions = completions.filter((c) => c.quest.category === "focus").length;
  const financeCompletions = completions.filter((c) => c.quest.category === "finance").length;
  void _focusCompletions; // used for future focus-category achievements
  const aiCompletions = completions.filter((c) => c.quest.category === "agentiq").length;

  // Count specific quest completions by title keyword
  const workoutCompletions = completions.filter((c) =>
    c.quest.title.toLowerCase().includes("workout") || c.quest.title.toLowerCase().includes("walk")
  ).length;
  const cookCompletions = completions.filter((c) =>
    c.quest.title.toLowerCase().includes("cook") || c.quest.title.toLowerCase().includes("healthy meal")
  ).length;
  const meditateCompletions = completions.filter((c) =>
    c.quest.title.toLowerCase().includes("meditat")
  ).length;
  const leetcodeCompletions = completions.filter((c) =>
    c.quest.title.toLowerCase().includes("leetcode")
  ).length;
  const agentCompletions = completions.filter((c) =>
    c.quest.title.toLowerCase().includes("agent") || c.quest.title.toLowerCase().includes("ai agent")
  ).length;
  const finetuneCompletions = completions.filter((c) =>
    c.quest.title.toLowerCase().includes("fine-tune") || c.quest.title.toLowerCase().includes("fine tune")
  ).length;
  const deployCompletions = completions.filter((c) =>
    c.quest.title.toLowerCase().includes("deploy")
  ).length;
  const kaggleCompletions = completions.filter((c) =>
    c.quest.title.toLowerCase().includes("kaggle")
  ).length;

  // Get dungeon completions (used for future dungeon achievements)
  const _dungeonCompletions = await prisma.dungeon.count({ where: { isCompleted: true } });
  void _dungeonCompletions;

  // Get reward redemptions
  const rewardRedemptions = await prisma.reward.count({ where: { isRedeemed: true } });

  // Get passed certs
  const certsPassed = await prisma.certRoadmap.count({ where: { isPassed: true } });

  // Get applications with offers
  const offersCount = await prisma.application.count({ where: { status: "offer" } });
  const acceptedCount = await prisma.application.count({ where: { status: "accepted" } });

  // Get exam passes (used for future exam achievements)
  const _examsPassed = await prisma.exam.count({ where: { passed: true } });
  void _examsPassed;

  // Calculate total gold earned (estimate from completions)
  const totalGoldEarned = hunter.gold;

  const unlocked: Array<{ name: string; rarity: string; xpReward: number; goldReward: number; titleReward?: string }> = [];

  for (const achievement of locked) {
    let shouldUnlock = false;

    switch (achievement.checkType) {
      case "quest_count": {
        // Map achievement category to relevant completion count
        const cat = achievement.category;
        let count = totalCompletions;

        if (cat === "health") {
          // Check specific health achievement names
          if (achievement.name === "First Steps") count = workoutCompletions;
          else if (achievement.name === "Iron Body") count = healthCompletions;
          else if (achievement.name === "Clean Eater") count = cookCompletions;
          else if (achievement.name === "Zen Master") count = meditateCompletions;
          else count = healthCompletions;
        } else if (cat === "career") {
          if (achievement.name === "First Application" || achievement.name === "Application Machine") count = jobCompletions;
          else if (achievement.name === "Interview Survivor") count = jobCompletions; // approx
          else count = jobCompletions;
        } else if (cat === "learning") {
          if (achievement.name === "First Solve" || achievement.name === "Algorithm Adept") count = leetcodeCompletions;
          else count = learningCompletions;
        } else if (cat === "discipline") {
          count = totalCompletions;
        } else if (cat === "ai") {
          if (achievement.name === "First Agent") count = agentCompletions;
          else if (achievement.name === "Fine-Tuner") count = finetuneCompletions;
          else if (achievement.name === "Shipped It") count = deployCompletions;
          else if (achievement.name === "Kaggle Competitor") count = kaggleCompletions;
          else count = aiCompletions;
        } else if (cat === "financial") {
          count = financeCompletions;
        }

        shouldUnlock = count >= achievement.checkValue;
        break;
      }

      case "streak":
        shouldUnlock = hunter.streak >= achievement.checkValue || hunter.bestStreak >= achievement.checkValue;
        break;

      case "stat_threshold": {
        if (achievement.name.includes("Intel") || achievement.name.includes("Scholar"))
          shouldUnlock = hunter.intel >= achievement.checkValue;
        else if (achievement.name.includes("AgentIQ") || achievement.name.includes("Agent"))
          shouldUnlock = hunter.agentIQ >= achievement.checkValue;
        else if (achievement.name.includes("Vitality"))
          shouldUnlock = hunter.vitality >= achievement.checkValue;
        else if (achievement.name.includes("Hustle"))
          shouldUnlock = hunter.hustle >= achievement.checkValue;
        else if (achievement.name.includes("Wealth"))
          shouldUnlock = hunter.wealth >= achievement.checkValue;
        else if (achievement.name.includes("Focus"))
          shouldUnlock = hunter.focus >= achievement.checkValue;
        break;
      }

      case "gold":
        shouldUnlock = totalGoldEarned >= achievement.checkValue;
        break;

      case "custom": {
        if (achievement.name === "Offer Hunter") shouldUnlock = offersCount + acceptedCount >= achievement.checkValue;
        else if (achievement.name === "Employed!") shouldUnlock = acceptedCount >= achievement.checkValue;
        else if (achievement.name === "Certified") shouldUnlock = certsPassed >= achievement.checkValue;
        else if (achievement.name === "Double Certified") shouldUnlock = certsPassed >= achievement.checkValue;
        else if (achievement.name === "First Reward Earned") shouldUnlock = rewardRedemptions >= achievement.checkValue;
        break;
      }
    }

    if (shouldUnlock) {
      // Unlock the achievement
      await prisma.achievement.update({
        where: { id: achievement.id },
        data: { isUnlocked: true, unlockedAt: new Date() },
      });

      // Award rewards
      const updateData: Record<string, unknown> = {};
      if (achievement.xpReward > 0) updateData.xp = { increment: achievement.xpReward };
      if (achievement.goldReward > 0) updateData.gold = { increment: achievement.goldReward };
      if (achievement.titleReward) updateData.title = achievement.titleReward;

      if (Object.keys(updateData).length > 0) {
        await prisma.hunter.update({ where: { id: 1 }, data: updateData });
      }

      unlocked.push({
        name: achievement.name,
        rarity: achievement.rarity,
        xpReward: achievement.xpReward,
        goldReward: achievement.goldReward,
        titleReward: achievement.titleReward || undefined,
      });
    }
  }

  return NextResponse.json({ unlocked, checked: locked.length });
}
