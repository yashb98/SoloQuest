"use client";

import { motion } from "framer-motion";
import { Check, Swords, Star, Zap } from "lucide-react";

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

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: number) => void;
  isLoading: boolean;
}

const difficultyConfig = {
  normal: {
    border: "border-sq-green/50",
    badge: "bg-sq-green/20 text-sq-green",
    icon: Swords,
    label: "NORMAL",
  },
  hard: {
    border: "border-sq-blue/50",
    badge: "bg-sq-blue/20 text-sq-blue",
    icon: Star,
    label: "HARD",
  },
  legendary: {
    border: "border-sq-purple/50 shadow-sq-purple-glow",
    badge: "bg-sq-purple/20 text-sq-purple",
    icon: Zap,
    label: "LEGENDARY",
  },
};

const categoryLabels: Record<string, string> = {
  health: "Health",
  food: "Food",
  learning: "Learning",
  mental: "Mental",
  job_search: "Job Search",
  interview_prep: "Interview Prep",
  finance: "Finance",
  part_time: "Part-Time",
};

export default function QuestCard({
  quest,
  onComplete,
  isLoading,
}: QuestCardProps) {
  const config =
    difficultyConfig[quest.difficulty as keyof typeof difficultyConfig] ||
    difficultyConfig.normal;
  const DifficultyIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`sq-panel p-4 border ${config.border} ${
        quest.isCompleted ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Difficulty + Category badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${config.badge}`}
            >
              <DifficultyIcon className="w-3 h-3" />
              {config.label}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-sq-muted bg-sq-bg border border-sq-border">
              {categoryLabels[quest.category] || quest.category}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`font-display font-semibold text-sm leading-tight ${
              quest.isCompleted ? "line-through text-sq-muted" : "text-sq-text"
            }`}
          >
            {quest.title}
          </h3>

          {/* Rewards */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-sq-gold">
              +{quest.xpBase} XP
            </span>
            <span className="font-mono text-xs text-sq-gold">
              +{quest.goldBase} G
            </span>
            <span className="font-mono text-[10px] text-sq-muted uppercase">
              {quest.statTarget}
            </span>
          </div>
        </div>

        {/* Complete button */}
        <button
          onClick={() => onComplete(quest.id)}
          disabled={quest.isCompleted || isLoading}
          className={`flex-shrink-0 w-10 h-10 rounded-md border flex items-center justify-center transition-all
            ${
              quest.isCompleted
                ? "bg-sq-green/20 border-sq-green text-sq-green cursor-default"
                : "border-sq-border text-sq-muted hover:border-sq-gold hover:text-sq-gold hover:bg-sq-gold/10 active:scale-95"
            }
            ${isLoading ? "animate-pulse" : ""}
          `}
        >
          <Check className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
