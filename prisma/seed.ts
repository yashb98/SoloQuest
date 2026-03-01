// prisma/seed.ts — Seeds the complete Solo Quest gamification system
// Blueprint Steps 1-11: Full quest library, dungeons, achievements, rewards
import path from "path";
import { createClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const dbPath = path.resolve(__dirname, "..", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🏰 Seeding Solo Quest — Full Gamification Blueprint...\n");

  // --- Hunter Profile (Step 1) ---
  const hunter = await prisma.hunter.upsert({
    where: { id: 1 },
    update: {
      hunterName: "Yash",
      class: "none",
      title: "Newcomer",
      rank: "E",
      level: 1,
      xp: 0,
      xpToNext: 205,
      gold: 0,
      streak: 0,
      bestStreak: 0,
      streakShields: 0,
      streakFreezes: 0,
      statPoints: 0,
      vitality: 0,
      intel: 0,
      hustle: 0,
      wealth: 0,
      focus: 0,
      agentIQ: 0,
      goldToMoneyRatio: 0.10,
      prestigeCount: 0,
      wakeUpTime: "06:30",
    },
    create: {
      id: 1,
      hunterName: "Yash",
      class: "none",
      title: "Newcomer",
      rank: "E",
      level: 1,
      xp: 0,
      xpToNext: 205,
      gold: 0,
      streak: 0,
      bestStreak: 0,
      streakShields: 0,
      streakFreezes: 0,
      statPoints: 0,
      vitality: 0,
      intel: 0,
      hustle: 0,
      wealth: 0,
      focus: 0,
      agentIQ: 0,
      goldToMoneyRatio: 0.10,
      prestigeCount: 0,
      wakeUpTime: "06:30",
    },
  });
  console.log(`✅ Hunter: ${hunter.hunterName} | ${hunter.rank}-${hunter.level}`);

  // --- Reset existing data on re-seed ---
  // Reset all quests to incomplete
  await prisma.quest.updateMany({ data: { isCompleted: false, completedAt: null } });
  // Reset all dungeons
  await prisma.dungeon.updateMany({
    data: { isActive: false, isCompleted: false, isFailed: false, activatedAt: null, deadline: null, completedAt: null },
  });
  // Clear completion history
  await prisma.completion.deleteMany({});
  console.log("✅ Reset quests, dungeons, and completion history");

  // Delete existing quests/dungeons/rewards/achievements to avoid duplicates on re-seed
  await prisma.quest.deleteMany({});
  await prisma.dungeon.deleteMany({});
  await prisma.reward.deleteMany({});
  await prisma.achievement.deleteMany({});

  // --- Full Quest Library (Step 4) ---
  const quests = [
    // ===== HEALTH & VITALITY =====
    { title: "Morning Workout (30+ min)", category: "health", difficulty: "normal", tier: "daily", xpBase: 80, goldBase: 20, statTarget: "vitality", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Walk 8,000+ Steps", category: "health", difficulty: "normal", tier: "daily", xpBase: 50, goldBase: 10, statTarget: "vitality", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Drink 8 Glasses of Water", category: "health", difficulty: "normal", tier: "daily", xpBase: 30, goldBase: 5, statTarget: "vitality", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Sleep Before 11:30 PM", category: "health", difficulty: "normal", tier: "daily", xpBase: 60, goldBase: 15, statTarget: "vitality", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Cook a Healthy Meal", category: "food", difficulty: "normal", tier: "daily", xpBase: 50, goldBase: 10, statTarget: "vitality", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "No Junk Food Today", category: "food", difficulty: "normal", tier: "daily", xpBase: 40, goldBase: 10, statTarget: "vitality", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Stretch / Yoga (15 min)", category: "health", difficulty: "normal", tier: "daily", xpBase: 40, goldBase: 8, statTarget: "vitality", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Meditate (10 min)", category: "mental", difficulty: "normal", tier: "daily", xpBase: 40, goldBase: 10, statTarget: "focus", statGain: 1, isDaily: true, unlocksAtLevel: 1 },

    // ===== JOB SEARCH & HUSTLE =====
    { title: "Apply to 3 Jobs", category: "jobs", difficulty: "hard", tier: "daily", xpBase: 100, goldBase: 25, statTarget: "hustle", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Tailor Resume for a Role", category: "jobs", difficulty: "normal", tier: "daily", xpBase: 80, goldBase: 20, statTarget: "hustle", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Write a Cover Letter", category: "jobs", difficulty: "normal", tier: "daily", xpBase: 70, goldBase: 15, statTarget: "hustle", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Network: Send 3 LinkedIn Messages", category: "jobs", difficulty: "normal", tier: "daily", xpBase: 60, goldBase: 15, statTarget: "hustle", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Practice STAR Interview Answer", category: "jobs", difficulty: "normal", tier: "daily", xpBase: 60, goldBase: 15, statTarget: "hustle", statGain: 1, isDaily: true, unlocksAtLevel: 3 },
    { title: "Research 2 Target Companies", category: "jobs", difficulty: "normal", tier: "daily", xpBase: 50, goldBase: 10, statTarget: "hustle", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Update LinkedIn Profile Section", category: "jobs", difficulty: "normal", tier: "daily", xpBase: 40, goldBase: 10, statTarget: "hustle", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Follow Up on Application", category: "jobs", difficulty: "normal", tier: "daily", xpBase: 50, goldBase: 12, statTarget: "hustle", statGain: 1, isDaily: true, unlocksAtLevel: 1 },

    // ===== STUDY & INTELLIGENCE =====
    { title: "Solve 1 LeetCode Problem", category: "learning", difficulty: "normal", tier: "daily", xpBase: 80, goldBase: 20, statTarget: "intel", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Study Cert Material (1 hr)", category: "learning", difficulty: "hard", tier: "daily", xpBase: 100, goldBase: 25, statTarget: "intel", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Complete 1 SQL Challenge", category: "learning", difficulty: "normal", tier: "daily", xpBase: 60, goldBase: 15, statTarget: "intel", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Read 30 Pages (Tech Book)", category: "learning", difficulty: "normal", tier: "daily", xpBase: 50, goldBase: 10, statTarget: "intel", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Watch Tech Tutorial (45 min)", category: "learning", difficulty: "normal", tier: "daily", xpBase: 40, goldBase: 10, statTarget: "intel", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Write Technical Notes / Blog", category: "learning", difficulty: "normal", tier: "daily", xpBase: 70, goldBase: 18, statTarget: "intel", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Practice System Design (30 min)", category: "learning", difficulty: "hard", tier: "daily", xpBase: 80, goldBase: 20, statTarget: "intel", statGain: 1, isDaily: true, unlocksAtLevel: 5 },
    { title: "ML / AI Concept Deep Dive", category: "learning", difficulty: "hard", tier: "daily", xpBase: 90, goldBase: 22, statTarget: "intel", statGain: 1, isDaily: true, unlocksAtLevel: 5 },

    // ===== FINANCIAL DISCIPLINE & WEALTH =====
    { title: "Log Every Expense Today", category: "finance", difficulty: "normal", tier: "daily", xpBase: 50, goldBase: 12, statTarget: "wealth", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "No Unnecessary Spending", category: "finance", difficulty: "normal", tier: "daily", xpBase: 60, goldBase: 15, statTarget: "wealth", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Transfer to Savings", category: "finance", difficulty: "normal", tier: "daily", xpBase: 80, goldBase: 20, statTarget: "wealth", statGain: 2, isDaily: true, unlocksAtLevel: 1 },
    { title: "Review Budget vs Actual", category: "finance", difficulty: "normal", tier: "weekly", xpBase: 40, goldBase: 10, statTarget: "wealth", statGain: 1, isDaily: false, unlocksAtLevel: 1 },
    { title: "Cook Instead of Ordering", category: "food", difficulty: "normal", tier: "daily", xpBase: 50, goldBase: 12, statTarget: "wealth", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Earn Side Income Today", category: "finance", difficulty: "hard", tier: "daily", xpBase: 120, goldBase: 30, statTarget: "wealth", statGain: 2, isDaily: true, unlocksAtLevel: 5 },
    { title: "Cancel Unused Subscription", category: "finance", difficulty: "normal", tier: "custom", xpBase: 60, goldBase: 15, statTarget: "wealth", statGain: 1, isDaily: false, unlocksAtLevel: 1 },
    { title: "No Coffee Shop Purchase", category: "finance", difficulty: "normal", tier: "daily", xpBase: 30, goldBase: 8, statTarget: "wealth", statGain: 1, isDaily: true, unlocksAtLevel: 1 },

    // ===== FOCUS & DISCIPLINE =====
    { title: "Pomodoro Session (4x25 min)", category: "focus", difficulty: "hard", tier: "daily", xpBase: 100, goldBase: 25, statTarget: "focus", statGain: 2, isDaily: true, unlocksAtLevel: 1 },
    { title: "No Social Media Until 12 PM", category: "focus", difficulty: "normal", tier: "daily", xpBase: 60, goldBase: 15, statTarget: "focus", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Deep Work Block (2 hrs)", category: "focus", difficulty: "hard", tier: "daily", xpBase: 120, goldBase: 30, statTarget: "focus", statGain: 2, isDaily: true, unlocksAtLevel: 1 },
    { title: "Morning Routine Complete", category: "focus", difficulty: "normal", tier: "daily", xpBase: 50, goldBase: 12, statTarget: "focus", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Evening Review (15 min)", category: "focus", difficulty: "normal", tier: "daily", xpBase: 40, goldBase: 10, statTarget: "focus", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Phone Screen Time < 3 hrs", category: "focus", difficulty: "normal", tier: "daily", xpBase: 50, goldBase: 12, statTarget: "focus", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Inbox Zero", category: "focus", difficulty: "normal", tier: "daily", xpBase: 40, goldBase: 10, statTarget: "focus", statGain: 1, isDaily: true, unlocksAtLevel: 1 },
    { title: "Plan Tomorrow Night Before", category: "focus", difficulty: "normal", tier: "daily", xpBase: 30, goldBase: 8, statTarget: "focus", statGain: 1, isDaily: true, unlocksAtLevel: 1 },

    // ===== AI & TECH (AgentIQ) =====
    { title: "Build / Improve an AI Agent", category: "agentiq", difficulty: "hard", tier: "daily", xpBase: 120, goldBase: 30, statTarget: "agentIQ", statGain: 2, isDaily: true, unlocksAtLevel: 5 },
    { title: "Fine-tune a Model (LoRA/QLoRA)", category: "agentiq", difficulty: "legendary", tier: "custom", xpBase: 150, goldBase: 40, statTarget: "agentIQ", statGain: 3, isDaily: false, unlocksAtLevel: 10 },
    { title: "Write a Prompt Engineering Doc", category: "agentiq", difficulty: "normal", tier: "daily", xpBase: 80, goldBase: 20, statTarget: "agentIQ", statGain: 1, isDaily: true, unlocksAtLevel: 5 },
    { title: "Deploy a Model to Production", category: "agentiq", difficulty: "legendary", tier: "custom", xpBase: 150, goldBase: 40, statTarget: "agentIQ", statGain: 3, isDaily: false, unlocksAtLevel: 10 },
    { title: "LangChain / LangSmith Practice", category: "agentiq", difficulty: "normal", tier: "daily", xpBase: 80, goldBase: 20, statTarget: "agentIQ", statGain: 1, isDaily: true, unlocksAtLevel: 5 },
    { title: "Read AI Research Paper", category: "agentiq", difficulty: "normal", tier: "daily", xpBase: 70, goldBase: 18, statTarget: "agentIQ", statGain: 1, isDaily: true, unlocksAtLevel: 5 },
    { title: "MLOps Task (Airflow/MLflow)", category: "agentiq", difficulty: "hard", tier: "daily", xpBase: 100, goldBase: 25, statTarget: "agentIQ", statGain: 2, isDaily: true, unlocksAtLevel: 10 },
    { title: "Kaggle Notebook Submission", category: "agentiq", difficulty: "hard", tier: "custom", xpBase: 100, goldBase: 25, statTarget: "agentIQ", statGain: 2, isDaily: false, unlocksAtLevel: 5 },

    // ===== WEEKLY QUESTS =====
    { title: "Apply to 10 Jobs This Week", category: "jobs", difficulty: "hard", tier: "weekly", xpBase: 400, goldBase: 100, statTarget: "hustle", statGain: 3, isDaily: false, unlocksAtLevel: 1 },
    { title: "7 Workouts This Week", category: "health", difficulty: "hard", tier: "weekly", xpBase: 350, goldBase: 80, statTarget: "vitality", statGain: 3, isDaily: false, unlocksAtLevel: 1 },
    { title: "5 LeetCode Problems This Week", category: "learning", difficulty: "hard", tier: "weekly", xpBase: 300, goldBase: 70, statTarget: "intel", statGain: 3, isDaily: false, unlocksAtLevel: 1 },
    { title: "Stay Under Budget All Week", category: "finance", difficulty: "hard", tier: "weekly", xpBase: 250, goldBase: 60, statTarget: "wealth", statGain: 2, isDaily: false, unlocksAtLevel: 1 },
    { title: "7 Deep Work Sessions This Week", category: "focus", difficulty: "hard", tier: "weekly", xpBase: 400, goldBase: 100, statTarget: "focus", statGain: 3, isDaily: false, unlocksAtLevel: 1 },
    { title: "Complete an AI Mini-Project", category: "agentiq", difficulty: "legendary", tier: "weekly", xpBase: 500, goldBase: 120, statTarget: "agentIQ", statGain: 4, isDaily: false, unlocksAtLevel: 10 },

    // ===== LEGENDARY QUESTS =====
    { title: "Complete Full Mock Technical Interview", category: "jobs", difficulty: "legendary", tier: "custom", xpBase: 500, goldBase: 100, statTarget: "hustle", statGain: 3, isDaily: false, unlocksAtLevel: 10 },
    { title: "Build and Push Portfolio Project Feature", category: "learning", difficulty: "legendary", tier: "custom", xpBase: 200, goldBase: 40, statTarget: "intel", statGain: 2, isDaily: false, unlocksAtLevel: 5 },
  ];

  for (const quest of quests) {
    await prisma.quest.create({ data: quest });
  }
  console.log(`✅ ${quests.length} quests seeded (daily, weekly, custom)`);

  // --- Dungeon Library (Step 6) ---
  const dungeons = [
    {
      title: "The Iron Body",
      description: "7 days of intense physical training and healthy living.",
      objectives: JSON.stringify(["7 workouts", "7x 8K steps", "7x cook healthy", "Sleep by 11:30 all 7 days"]),
      bonusXP: 850, bonusGold: 200, statReward: "vitality", statAmount: 8,
    },
    {
      title: "The Algorithm Gauntlet",
      description: "Master algorithms and data structures through intense practice.",
      objectives: JSON.stringify(["7 LeetCode problems", "7 SQL challenges", "3 ML derivations"]),
      bonusXP: 950, bonusGold: 220, statReward: "intel", statAmount: 6,
    },
    {
      title: "The Application Blitz",
      description: "Aggressive job search sprint with maximum coverage.",
      objectives: JSON.stringify(["20 job applications", "5 tailored cover letters", "1 LinkedIn post"]),
      bonusXP: 900, bonusGold: 200, statReward: "hustle", statAmount: 6,
    },
    {
      title: "The Agent Architect",
      description: "Build a complete AI agent from scratch with proper tooling.",
      objectives: JSON.stringify(["Build ReAct agent", "LangSmith tracing setup", "Write eval report"]),
      bonusXP: 1100, bonusGold: 280, statReward: "agentIQ", statAmount: 8,
    },
    {
      title: "The Wealth Fortress",
      description: "Total financial discipline for one week.",
      objectives: JSON.stringify(["Log every transaction", "Stay on budget", "Transfer savings", "No eating out"]),
      bonusXP: 700, bonusGold: 180, statReward: "wealth", statAmount: 8,
    },
    {
      title: "The Cert Sprint",
      description: "Intensive certification preparation week.",
      objectives: JSON.stringify(["7 cert modules completed", "2 practice tests", "1 mock exam"]),
      bonusXP: 1000, bonusGold: 250, statReward: "intel", statAmount: 7,
    },
    {
      title: "The Focus Forge",
      description: "Train your mind through disciplined deep work.",
      objectives: JSON.stringify(["7 deep work blocks (2h each)", "No social media before noon all week"]),
      bonusXP: 900, bonusGold: 220, statReward: "focus", statAmount: 8,
    },
    {
      title: "The Portfolio Week",
      description: "Build your public-facing developer portfolio.",
      objectives: JSON.stringify(["Deploy 1 live demo", "Improve 3 GitHub READMEs", "1 Kaggle notebook"]),
      bonusXP: 1200, bonusGold: 300, statReward: "hustle", statAmount: 8,
    },
    {
      title: "The MLOps Forge",
      description: "Set up production ML infrastructure.",
      objectives: JSON.stringify(["Set up Airflow DAG", "MLflow on project", "Model monitoring"]),
      bonusXP: 1000, bonusGold: 250, statReward: "agentIQ", statAmount: 7,
    },
    {
      title: "The Full Stack Trial",
      description: "Build a complete full-stack feature end to end.",
      objectives: JSON.stringify(["Build frontend UI", "Build API endpoint", "Set up database", "Deploy to production"]),
      bonusXP: 1300, bonusGold: 350, statReward: "intel", statAmount: 10,
    },
  ];

  for (const dungeon of dungeons) {
    await prisma.dungeon.create({ data: dungeon });
  }
  console.log(`✅ ${dungeons.length} dungeons seeded`);

  // --- Rewards (Step 7) ---
  const rewards = [
    // Tier 1 (E-Rank)
    { title: "Favorite coffee + pastry", tier: "E", costGold: 150, realCost: 15.0, category: "treat" },
    { title: "New book (physical or Kindle)", tier: "E", costGold: 200, realCost: 20.0, category: "learning" },
    { title: "Movie night (theater)", tier: "E", costGold: 250, realCost: 25.0, category: "entertainment" },
    // Tier 2 (C-Rank)
    { title: "New sneakers or clothing item", tier: "C", costGold: 500, realCost: 50.0, category: "personal" },
    { title: "Nice restaurant dinner", tier: "C", costGold: 800, realCost: 80.0, category: "treat" },
    { title: "Wireless earbuds / accessory", tier: "C", costGold: 1200, realCost: 120.0, category: "gadget" },
    // Tier 3 (A-Rank)
    { title: "Weekend getaway (nearby city)", tier: "A", costGold: 2500, realCost: 250.0, category: "travel" },
    { title: "Online bootcamp / course", tier: "A", costGold: 3000, realCost: 300.0, category: "learning" },
    { title: "Mechanical keyboard / monitor", tier: "A", costGold: 4000, realCost: 400.0, category: "gadget" },
    // Tier 4 (S-Rank)
    { title: "Gaming console / tablet", tier: "S", costGold: 6000, realCost: 600.0, category: "gadget" },
    { title: "New laptop / workstation", tier: "S", costGold: 12000, realCost: 1200.0, category: "gadget" },
    // Tier 5 (National)
    { title: "International flight + 3 nights", tier: "S", costGold: 20000, realCost: 2000.0, category: "travel" },
  ];

  for (const reward of rewards) {
    await prisma.reward.create({ data: reward });
  }
  console.log(`✅ ${rewards.length} rewards seeded`);

  // --- Achievements (Step 11) ---
  const achievements = [
    // Health & Vitality
    { name: "First Steps", description: "Complete first workout quest", category: "health", requirement: "Complete 1 health quest", checkType: "quest_count", checkValue: 1, xpReward: 50, goldReward: 0, rarity: "Common" },
    { name: "Iron Body", description: "Complete 100 health quests", category: "health", requirement: "Complete 100 health quests", checkType: "quest_count", checkValue: 100, xpReward: 500, goldReward: 0, titleReward: "Iron Body", rarity: "Rare" },
    { name: "Marathon Runner", description: "Hit 8K steps for 30 consecutive days", category: "health", requirement: "30-day step streak", checkType: "streak", checkValue: 30, xpReward: 800, goldReward: 200, rarity: "Epic" },
    { name: "Clean Eater", description: "Cook at home 60 times", category: "health", requirement: "Cook 60 healthy meals", checkType: "quest_count", checkValue: 60, xpReward: 400, goldReward: 100, rarity: "Rare" },
    { name: "Zen Master", description: "Meditate 100 times", category: "health", requirement: "100 meditation sessions", checkType: "quest_count", checkValue: 100, xpReward: 500, goldReward: 0, titleReward: "Zen Master", rarity: "Epic" },

    // Career & Hustle
    { name: "First Application", description: "Submit first job application", category: "career", requirement: "Apply to 1 job", checkType: "quest_count", checkValue: 1, xpReward: 50, goldReward: 0, rarity: "Common" },
    { name: "Application Machine", description: "Submit 100 job applications", category: "career", requirement: "Apply to 100 jobs", checkType: "quest_count", checkValue: 100, xpReward: 500, goldReward: 0, titleReward: "Application Machine", rarity: "Rare" },
    { name: "Interview Survivor", description: "Complete 10 interviews", category: "career", requirement: "Complete 10 interviews", checkType: "quest_count", checkValue: 10, xpReward: 400, goldReward: 100, rarity: "Rare" },
    { name: "Offer Hunter", description: "Receive 3 job offers", category: "career", requirement: "Get 3 offers", checkType: "custom", checkValue: 3, xpReward: 1000, goldReward: 500, rarity: "Legendary" },
    { name: "Employed!", description: "Accept a job offer", category: "career", requirement: "Accept an offer", checkType: "custom", checkValue: 1, xpReward: 2000, goldReward: 1000, titleReward: "Employed!", rarity: "Legendary" },

    // Learning & Intelligence
    { name: "First Solve", description: "Solve first LeetCode problem", category: "learning", requirement: "Solve 1 problem", checkType: "quest_count", checkValue: 1, xpReward: 50, goldReward: 0, rarity: "Common" },
    { name: "Algorithm Adept", description: "Solve 100 LeetCode problems", category: "learning", requirement: "Solve 100 problems", checkType: "quest_count", checkValue: 100, xpReward: 500, goldReward: 0, titleReward: "Algorithm Adept", rarity: "Rare" },
    { name: "Certified", description: "Pass first certification exam", category: "learning", requirement: "Pass 1 cert", checkType: "custom", checkValue: 1, xpReward: 800, goldReward: 200, rarity: "Epic" },
    { name: "Double Certified", description: "Pass 2 certification exams", category: "learning", requirement: "Pass 2 certs", checkType: "custom", checkValue: 2, xpReward: 1200, goldReward: 400, rarity: "Epic" },
    { name: "Scholar Supreme", description: "Reach Intel stat of 100", category: "learning", requirement: "Intel >= 100", checkType: "stat_threshold", checkValue: 100, xpReward: 1500, goldReward: 500, titleReward: "Scholar Supreme", rarity: "Legendary" },

    // Discipline & Streak
    { name: "Day One", description: "Complete first daily quest", category: "discipline", requirement: "Complete 1 quest", checkType: "quest_count", checkValue: 1, xpReward: 30, goldReward: 0, rarity: "Common" },
    { name: "Week Warrior", description: "Maintain a 7-day streak", category: "discipline", requirement: "7-day streak", checkType: "streak", checkValue: 7, xpReward: 200, goldReward: 50, rarity: "Common" },
    { name: "Month of Iron", description: "Maintain a 30-day streak", category: "discipline", requirement: "30-day streak", checkType: "streak", checkValue: 30, xpReward: 800, goldReward: 200, titleReward: "Iron Will", rarity: "Epic" },
    { name: "Quarter Dominator", description: "Maintain a 90-day streak", category: "discipline", requirement: "90-day streak", checkType: "streak", checkValue: 90, xpReward: 2000, goldReward: 500, rarity: "Legendary" },
    { name: "The Sovereign", description: "Maintain a 365-day streak", category: "discipline", requirement: "365-day streak", checkType: "streak", checkValue: 365, xpReward: 5000, goldReward: 2500, titleReward: "Sovereign", rarity: "Mythic" },

    // Financial Discipline
    { name: "Penny Pincher", description: "Log expenses for 7 consecutive days", category: "financial", requirement: "7 days of expense logging", checkType: "streak", checkValue: 7, xpReward: 100, goldReward: 0, rarity: "Common" },
    { name: "Budget Master", description: "Stay under budget for 30 days", category: "financial", requirement: "30 days under budget", checkType: "streak", checkValue: 30, xpReward: 500, goldReward: 150, rarity: "Rare" },
    { name: "First Reward Earned", description: "Purchase first item from Reward Shop", category: "financial", requirement: "Redeem 1 reward", checkType: "custom", checkValue: 1, xpReward: 200, goldReward: 0, rarity: "Common" },
    { name: "Saver Elite", description: "Accumulate 5,000 Gold in Reward Fund", category: "financial", requirement: "5,000G total", checkType: "gold", checkValue: 5000, xpReward: 800, goldReward: 0, titleReward: "Saver Elite", rarity: "Epic" },
    { name: "Wealth Sovereign", description: "Accumulate 20,000 Gold lifetime", category: "financial", requirement: "20,000G lifetime", checkType: "gold", checkValue: 20000, xpReward: 2000, goldReward: 500, rarity: "Legendary" },

    // AI & Tech
    { name: "First Agent", description: "Build first AI agent", category: "ai", requirement: "Build 1 AI agent", checkType: "quest_count", checkValue: 1, xpReward: 100, goldReward: 0, rarity: "Common" },
    { name: "Fine-Tuner", description: "Fine-tune 3 models", category: "ai", requirement: "Fine-tune 3 models", checkType: "quest_count", checkValue: 3, xpReward: 500, goldReward: 150, rarity: "Rare" },
    { name: "Shipped It", description: "Deploy 3 models to production", category: "ai", requirement: "Deploy 3 models", checkType: "quest_count", checkValue: 3, xpReward: 800, goldReward: 200, rarity: "Epic" },
    { name: "Kaggle Competitor", description: "Submit 10 Kaggle notebooks", category: "ai", requirement: "10 Kaggle submissions", checkType: "quest_count", checkValue: 10, xpReward: 600, goldReward: 150, rarity: "Rare" },
    { name: "Agent Sovereign", description: "Reach AgentIQ stat of 100", category: "ai", requirement: "AgentIQ >= 100", checkType: "stat_threshold", checkValue: 100, xpReward: 1500, goldReward: 500, titleReward: "Agent Sovereign", rarity: "Legendary" },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.create({ data: achievement });
  }
  console.log(`✅ ${achievements.length} achievements seeded`);

  console.log("\n🏰 Seed complete. The System is ready. Choose your class, Hunter.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
