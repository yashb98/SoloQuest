"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import QuestCard from "./QuestCard";

interface Quest {
  id: number;
  title: string;
  category: string;
  difficulty: string;
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
  { key: "job_search", label: "Jobs" },
  { key: "interview_prep", label: "Interview" },
  { key: "food", label: "Food" },
  { key: "mental", label: "Mental" },
  { key: "finance", label: "Finance" },
] as const;

export default function QuestBoard({
  quests,
  onComplete,
  loadingQuestId,
}: QuestBoardProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredQuests = useMemo(() => {
    if (activeCategory === "all") return quests;
    return quests.filter((q) => q.category === activeCategory);
  }, [quests, activeCategory]);

  const completedCount = quests.filter((q) => q.isCompleted).length;
  const totalCount = quests.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-sq-gold">
          QUEST BOARD
        </h2>
        <span className="font-mono text-sm text-sq-muted">
          {completedCount}/{totalCount} complete
        </span>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const count =
            cat.key === "all"
              ? quests.length
              : quests.filter((q) => q.category === cat.key).length;
          if (count === 0 && cat.key !== "all") return null;

          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md font-display font-semibold text-xs transition-all
                ${
                  activeCategory === cat.key
                    ? "bg-sq-gold/20 text-sq-gold border border-sq-gold/40"
                    : "bg-sq-bg text-sq-muted border border-sq-border hover:text-sq-text"
                }`}
            >
              {cat.label}
              <span className="ml-1 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Quest list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={onComplete}
              isLoading={loadingQuestId === quest.id}
            />
          ))}
        </AnimatePresence>
        {filteredQuests.length === 0 && (
          <div className="sq-panel p-8 text-center">
            <p className="text-sq-muted font-mono text-sm">
              No quests in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
