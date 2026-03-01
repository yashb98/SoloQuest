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
  onUndo: (questId: number) => void;
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

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  health: { bg: "bg-[#DCFCE7]", text: "text-[#166534]", dot: "border-[#22C55E]" },
  learning: { bg: "bg-[#DBEAFE]", text: "text-[#1E40AF]", dot: "border-[#3B82F6]" },
  jobs: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", dot: "border-[#F59E0B]" },
  finance: { bg: "bg-[#E0E7FF]", text: "text-[#3730A3]", dot: "border-[#6366F1]" },
  focus: { bg: "bg-[#FCE7F3]", text: "text-[#9D174D]", dot: "border-[#EC4899]" },
  food: { bg: "bg-[#FFEDD5]", text: "text-[#9A3412]", dot: "border-[#F97316]" },
  mental: { bg: "bg-[#F3E8FF]", text: "text-[#6B21A8]", dot: "border-[#A855F7]" },
  agentiq: { bg: "bg-[#DBEAFE]", text: "text-[#1E40AF]", dot: "border-[#3B82F6]" },
};

export default function QuestBoard({ quests, onComplete, onUndo, loadingQuestId }: QuestBoardProps) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">
          Quest Board
        </h2>
        <span className="text-[17px] text-sq-muted font-medium">
          {completedCount}/{quests.length} complete
        </span>
      </div>

      {/* Tier filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-wrap">
        {TIERS.map((tier) => {
          const count = tier.key === "all" ? quests.length : quests.filter((q) => q.tier === tier.key).length;
          if (count === 0 && tier.key !== "all") return null;
          const isActive = activeTier === tier.key;
          return (
            <button
              key={tier.key}
              onClick={() => setActiveTier(tier.key)}
              className={`flex-shrink-0 px-[18px] py-2 rounded-full font-semibold text-[15px] transition-all whitespace-nowrap
                ${isActive
                  ? "border-2 border-sq-accent bg-[#FFF3ED] text-sq-accent"
                  : "border-[1.5px] border-[#DDD6CE] bg-white text-sq-subtle hover:border-sq-accent/40"
                }`}
            >
              {tier.label}{" "}
              <span className="opacity-70 font-medium text-[13px]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-wrap">
        {CATEGORIES.map((cat) => {
          const count = cat.key === "all" ? quests.length : quests.filter((q) => q.category === cat.key).length;
          if (count === 0 && cat.key !== "all") return null;
          const isActive = activeCategory === cat.key;
          const color = cat.key === "all" ? null : categoryColors[cat.key];
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-shrink-0 px-[18px] py-2 rounded-full font-semibold text-[15px] transition-all whitespace-nowrap
                ${isActive
                  ? `border-2 ${color ? color.dot : "border-sq-accent"} ${color ? color.bg : "bg-[#FFF3ED]"} ${color ? color.text : "text-sq-accent"}`
                  : "border-[1.5px] border-[#DDD6CE] bg-white text-sq-subtle hover:border-sq-accent/40"
                }`}
            >
              {cat.label}{" "}
              <span className="opacity-70 font-medium text-[13px]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Quest List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filteredQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onComplete={onComplete} onUndo={onUndo} isLoading={loadingQuestId === quest.id} />
          ))}
        </AnimatePresence>
        {filteredQuests.length === 0 && (
          <div className="text-center py-[60px] text-sq-muted text-[18px]">
            No quests found for this filter combination.
          </div>
        )}
      </div>
    </div>
  );
}
