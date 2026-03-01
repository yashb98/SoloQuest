// prisma/seed.ts — Seeds Hunter profile, starter quests, and rewards
import path from "path";
import { createClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const dbPath = path.resolve(__dirname, "..", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🏰 Seeding Solo Quest database...\n");

  // --- Hunter Profile ---
  const hunter = await prisma.hunter.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      hunterName: "Yash",
      rank: "E",
      level: 1,
      xp: 0,
      xpToNext: 800,
      gold: 0,
      streak: 0,
      wakeUpTime: "06:30",
      discipline: 0,
      vitality: 0,
      intelligence: 0,
      hustle: 0,
      wealth: 0,
    },
  });
  console.log(`✅ Hunter created: ${hunter.hunterName} | Rank ${hunter.rank}-${hunter.level}`);

  // --- Starter Quests (E-Rank, Level 1) ---
  const quests = [
    // Health / Vitality
    {
      title: "Morning workout — 30 min bodyweight session",
      category: "health",
      difficulty: "normal",
      xpBase: 80,
      goldBase: 15,
      statTarget: "vitality",
      isDaily: true,
      unlocksAtLevel: 1,
    },
    {
      title: "Cook a proper meal — no takeaway",
      category: "food",
      difficulty: "normal",
      xpBase: 60,
      goldBase: 10,
      statTarget: "vitality",
      isDaily: true,
      unlocksAtLevel: 1,
    },
    {
      title: "Walk 8,000+ steps today",
      category: "health",
      difficulty: "normal",
      xpBase: 50,
      goldBase: 10,
      statTarget: "vitality",
      isDaily: true,
      unlocksAtLevel: 1,
    },
    // Learning / Intelligence
    {
      title: "Study DS/ML — 1 hour focused session",
      category: "learning",
      difficulty: "normal",
      xpBase: 100,
      goldBase: 20,
      statTarget: "intelligence",
      isDaily: true,
      unlocksAtLevel: 1,
    },
    {
      title: "Complete 1 LeetCode problem (any difficulty)",
      category: "learning",
      difficulty: "normal",
      xpBase: 90,
      goldBase: 18,
      statTarget: "intelligence",
      isDaily: true,
      unlocksAtLevel: 1,
    },
    {
      title: "Read 20 pages of a technical book",
      category: "learning",
      difficulty: "normal",
      xpBase: 70,
      goldBase: 12,
      statTarget: "intelligence",
      isDaily: true,
      unlocksAtLevel: 1,
    },
    // Discipline
    {
      title: "Wake up by 06:30 — no snooze",
      category: "health",
      difficulty: "normal",
      xpBase: 60,
      goldBase: 10,
      statTarget: "discipline",
      isDaily: true,
      unlocksAtLevel: 1,
    },
    {
      title: "No social media until 12:00",
      category: "mental",
      difficulty: "normal",
      xpBase: 50,
      goldBase: 8,
      statTarget: "discipline",
      isDaily: true,
      unlocksAtLevel: 1,
    },
    {
      title: "Plan tomorrow's schedule before bed",
      category: "mental",
      difficulty: "normal",
      xpBase: 40,
      goldBase: 8,
      statTarget: "discipline",
      isDaily: true,
      unlocksAtLevel: 1,
    },
    // Hustle / Job Search
    {
      title: "Apply to 3 DS/ML job listings",
      category: "job_search",
      difficulty: "hard",
      xpBase: 150,
      goldBase: 30,
      statTarget: "hustle",
      isDaily: true,
      unlocksAtLevel: 1,
    },
    {
      title: "Update CV/portfolio with latest project",
      category: "job_search",
      difficulty: "hard",
      xpBase: 120,
      goldBase: 25,
      statTarget: "hustle",
      isDaily: false,
      unlocksAtLevel: 1,
    },
    // Finance / Wealth
    {
      title: "Log all spending today — every penny",
      category: "finance",
      difficulty: "normal",
      xpBase: 40,
      goldBase: 8,
      statTarget: "wealth",
      isDaily: true,
      unlocksAtLevel: 1,
    },
    // Interview Prep (unlocks at level 3)
    {
      title: "Practice 1 ML interview question out loud",
      category: "interview_prep",
      difficulty: "hard",
      xpBase: 130,
      goldBase: 25,
      statTarget: "intelligence",
      isDaily: true,
      unlocksAtLevel: 3,
    },
    // Hard quests (unlocks at level 5)
    {
      title: "Build and push a portfolio project feature",
      category: "learning",
      difficulty: "hard",
      xpBase: 200,
      goldBase: 40,
      statTarget: "intelligence",
      isDaily: false,
      unlocksAtLevel: 5,
    },
    // Legendary quest (unlocks at level 10)
    {
      title: "Complete a full mock technical interview",
      category: "interview_prep",
      difficulty: "legendary",
      xpBase: 500,
      goldBase: 100,
      statTarget: "hustle",
      isDaily: false,
      unlocksAtLevel: 10,
    },
  ];

  for (const quest of quests) {
    await prisma.quest.create({ data: quest });
  }
  console.log(`✅ ${quests.length} quests seeded`);

  // --- Rewards (tiered by rank) ---
  const rewards = [
    // E-Rank rewards (cheap, small)
    { title: "Fancy coffee from a café", tier: "E", costGold: 50, realCost: 5.0 },
    { title: "New Spotify playlist curation hour", tier: "E", costGold: 30, realCost: 3.0 },
    { title: "One episode guilt-free (Netflix/anime)", tier: "E", costGold: 40, realCost: 4.0 },
    // D-Rank rewards
    { title: "New book (technical or fiction)", tier: "D", costGold: 150, realCost: 15.0 },
    { title: "Takeaway meal from favourite restaurant", tier: "D", costGold: 200, realCost: 20.0 },
    { title: "Cinema ticket", tier: "D", costGold: 120, realCost: 12.0 },
    // C-Rank rewards
    { title: "New mechanical keyboard", tier: "C", costGold: 500, realCost: 50.0 },
    { title: "Online course (Udemy/Coursera)", tier: "C", costGold: 300, realCost: 30.0 },
    { title: "Day trip somewhere new", tier: "C", costGold: 400, realCost: 40.0 },
    // B-Rank rewards
    { title: "New monitor or tech upgrade", tier: "B", costGold: 1500, realCost: 150.0 },
    { title: "Weekend getaway", tier: "B", costGold: 2000, realCost: 200.0 },
    // A-Rank rewards
    { title: "New laptop fund contribution (£250)", tier: "A", costGold: 2500, realCost: 250.0 },
    { title: "Conference ticket (in-person)", tier: "A", costGold: 3000, realCost: 300.0 },
    // S-Rank rewards
    { title: "International trip fund (£500)", tier: "S", costGold: 5000, realCost: 500.0 },
    { title: "Custom PC build fund (£1000)", tier: "S", costGold: 10000, realCost: 1000.0 },
  ];

  for (const reward of rewards) {
    await prisma.reward.create({ data: reward });
  }
  console.log(`✅ ${rewards.length} rewards seeded`);

  console.log("\n🏰 Seed complete. The System is ready.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
