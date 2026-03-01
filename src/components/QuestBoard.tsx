"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import QuestCard from "./QuestCard";

interface Quest {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  tier: string;
  xpBase: number;
  goldBase: number;
  statTarget: string;
  isCompleted: boolean;
}

interface QuestBoardProps {
  quests: Quest[];
  onComplete: (questId: number) => void;
  loadingQuestId: number | null;
}

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "health", label: "Health" },
  { key: "learning", label: "Learning" },
  { key: "jobs", label: "Jobs" },
  { key: "finance", label: "Finance" },
  { key: "focus", label: "Focus" },
  { key: "agentiq", label: "AI/Tech" },
  { key: "food", label: "Food" },
  { key: "mental", label: "Mental" },
] as const;

const TIERS = [
  { key: "all", label: "All Tiers" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "custom", label: "Custom" },
] as const;

export default function QuestBoard({ quests, onComplete, loadingQuestId }: QuestBoardProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTier, setActiveTier] = useState("all");

  const filteredQuests = useMemo(() => {
    let filtered = quests;
    if (activeCategory !== "all") filtered = filtered.filter((q) => q.category === activeCategory);
    if (activeTier !== "all") filtered = filtered.filter((q) => q.tier === activeTier);
    return filtered;
  }, [quests, activeCategory, activeTier]);

  const completedCount = quests.filter((q) => q.isCompleted).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-sq-gold">QUEST BOARD</h2>
        <span className="font-mono text-sm text-sq-muted">{completedCount}/{quests.length} complete</span>
      </div>

      {/* Tier tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TIERS.map((tier) => {
          const count = tier.key === "all" ? quests.length : quests.filter((q) => q.tier === tier.key).length;
          if (count === 0 && tier.key !== "all") return null;
          return (
            <button
              key={tier.key}
              onClick={() => setActiveTier(tier.key)}
              className={`flex-shrink-0 px-3 py-1 rounded-md font-display font-semibold text-xs transition-all ${
                activeTier === tier.key
                  ? "bg-sq-blue/20 text-sq-blue border border-sq-blue/40"
                  : "bg-sq-bg text-sq-muted border border-sq-border hover:text-sq-text"
              }`}
            >
              {tier.label} <span className="ml-1 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const count = cat.key === "all" ? quests.length : quests.filter((q) => q.category === cat.key).length;
          if (count === 0 && cat.key !== "all") return null;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md font-display font-semibold text-xs transition-all ${
                activeCategory === cat.key
                  ? "bg-sq-gold/20 text-sq-gold border border-sq-gold/40"
                  : "bg-sq-bg text-sq-muted border border-sq-border hover:text-sq-text"
              }`}
            >
              {cat.label} <span className="ml-1 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onComplete={onComplete} isLoading={loadingQuestId === quest.id} />
          ))}
        </AnimatePresence>
        {filteredQuests.length === 0 && (
          <div className="sq-panel p-8 text-center">
            <p className="text-sq-muted font-mono text-sm">No quests in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
