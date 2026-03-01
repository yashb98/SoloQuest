"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Lock, Star } from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  requirement: string;
  rarity: string;
  xpReward: number;
  goldReward: number;
  titleReward: string | null;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

const rarityColors: Record<string, string> = {
  Common: "border-gray-500/50 text-gray-400",
  Rare: "border-sq-blue/50 text-sq-blue",
  Epic: "border-sq-purple/50 text-sq-purple",
  Legendary: "border-sq-gold/50 text-sq-gold shadow-sq-accent-glow",
  Mythic: "border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
};

const categoryLabels: Record<string, string> = {
  health: "Health & Vitality",
  career: "Career & Hustle",
  learning: "Learning & Intelligence",
  discipline: "Discipline & Streak",
  financial: "Financial Discipline",
  ai: "AI & Tech",
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    const res = await fetch("/api/achievements");
    setAchievements(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

  const categories = ["all", ...Object.keys(categoryLabels)];
  const filtered = filter === "all" ? achievements : achievements.filter((a) => a.category === filter);
  const unlocked = achievements.filter((a) => a.isUnlocked).length;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-hover rounded-xl w-48" />
        {[1, 2, 3, 4].map((i) => <div key={i} className="sq-panel p-6 h-24" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">Achievements</h1>
        <span className="text-sm text-sq-muted">
          {unlocked}/{achievements.length} unlocked
        </span>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-md font-semibold text-xs transition-all
              ${filter === cat
                ? "bg-[#FFF3ED] text-sq-accent border-2 border-sq-accent"
                : "bg-white text-sq-subtle border-[1.5px] border-[#DDD6CE] hover:border-sq-accent/40"
              }`}
          >
            {cat === "all" ? "All" : categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {/* Achievement list */}
      <div className="space-y-3">
        {filtered.map((achievement) => (
          <motion.div
            key={achievement.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`sq-panel p-4 border ${rarityColors[achievement.rarity] || "border-sq-border"} ${
              !achievement.isUnlocked ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                achievement.isUnlocked ? "bg-sq-gold/20" : "bg-sq-bg"
              }`}>
                {achievement.isUnlocked ? (
                  <Trophy className="w-5 h-5 text-sq-gold" />
                ) : (
                  <Lock className="w-5 h-5 text-sq-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-sq-text">
                    {achievement.name}
                  </h3>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    rarityColors[achievement.rarity]?.split(" ").pop() || "text-sq-muted"
                  } bg-sq-bg border ${rarityColors[achievement.rarity]?.split(" ")[0] || "border-sq-border"}`}>
                    {achievement.rarity.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-sq-muted mt-1">{achievement.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  {achievement.xpReward > 0 && (
                    <span className="text-[10px] text-sq-gold">+{achievement.xpReward} XP</span>
                  )}
                  {achievement.goldReward > 0 && (
                    <span className="text-[10px] text-sq-gold">+{achievement.goldReward} G</span>
                  )}
                  {achievement.titleReward && (
                    <span className="text-[10px] text-sq-purple flex items-center gap-1">
                      <Star className="w-3 h-3" /> {achievement.titleReward}
                    </span>
                  )}
                </div>
                {achievement.isUnlocked && achievement.unlockedAt && (
                  <p className="text-[9px] text-sq-green mt-1">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
