"use client";

import { motion } from "framer-motion";
import { Check, Undo2 } from "lucide-react";
import { useState } from "react";

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

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: number) => void;
  onUndo: (questId: number) => void;
  isLoading: boolean;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  health: { bg: "bg-[#DCFCE7]", text: "text-[#166534]" },
  learning: { bg: "bg-[#DBEAFE]", text: "text-[#1E40AF]" },
  jobs: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]" },
  finance: { bg: "bg-[#E0E7FF]", text: "text-[#3730A3]" },
  focus: { bg: "bg-[#FCE7F3]", text: "text-[#9D174D]" },
  food: { bg: "bg-[#FFEDD5]", text: "text-[#9A3412]" },
  mental: { bg: "bg-[#F3E8FF]", text: "text-[#6B21A8]" },
  agentiq: { bg: "bg-[#DBEAFE]", text: "text-[#1E40AF]" },
};

const categoryLabels: Record<string, string> = {
  health: "Health", food: "Food", learning: "Learning", mental: "Mental",
  jobs: "Jobs", finance: "Finance", focus: "Focus", agentiq: "AI/Tech",
};

const statColors: Record<string, string> = {
  vitality: "text-[#22C55E]",
  intel: "text-[#3B82F6]",
  hustle: "text-[#F97316]",
  wealth: "text-[#F59E0B]",
  focus: "text-[#EC4899]",
  agentIQ: "text-[#A855F7]",
};

const statLabels: Record<string, string> = {
  vitality: "VIT", intel: "INT", hustle: "HUS", wealth: "WLT", focus: "FOC", agentIQ: "AIQ",
};

export default function QuestCard({ quest, onComplete, onUndo, isLoading }: QuestCardProps) {
  const color = categoryColors[quest.category] || { bg: "bg-gray-100", text: "text-gray-600" };
  const [showUndo, setShowUndo] = useState(false);

  const handleClick = () => {
    if (quest.isCompleted) {
      onUndo(quest.id);
    } else {
      onComplete(quest.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`bg-white rounded-2xl py-5 px-6 flex items-center justify-between gap-4 transition-all
        ${quest.isCompleted
          ? "border-[1.5px] border-[#DDD6CE] opacity-[0.65]"
          : "border-[1.5px] border-sq-border shadow-sq-card"
        }`}
      style={{ background: quest.isCompleted ? "#F8F6F2" : "#FFFFFF" }}
      onMouseEnter={() => quest.isCompleted && setShowUndo(true)}
      onMouseLeave={() => setShowUndo(false)}
    >
      <div className="flex-1 min-w-0">
        {/* Badges row */}
        <div className="flex items-center gap-[10px] mb-2 flex-wrap">
          <span className="bg-sq-hover text-[#8B7E72] px-3 py-[3px] rounded-full text-[12px] font-bold tracking-[0.05em] uppercase">
            {quest.tier}
          </span>
          <span className={`${color.bg} ${color.text} px-3 py-[3px] rounded-full text-[12px] font-semibold`}>
            {categoryLabels[quest.category] || quest.category}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-[19px] font-semibold tracking-[-0.01em] ${
            quest.isCompleted ? "text-sq-muted line-through" : "text-sq-text"
          }`}
        >
          {quest.title}
        </h3>

        {/* Rewards */}
        <div className="flex gap-4 mt-[10px] flex-wrap">
          <span className="text-[15px] font-semibold text-sq-accent">+{quest.xpBase} XP</span>
          <span className="text-[15px] font-semibold text-sq-gold">+{quest.goldBase} G</span>
          <span className={`text-[15px] font-semibold ${statColors[quest.statTarget] || "text-sq-muted"}`}>
            +{statLabels[quest.statTarget] || quest.statTarget}
          </span>
        </div>
      </div>

      {/* Complete / Undo button */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all relative group
          ${quest.isCompleted
            ? "bg-gradient-to-br from-sq-accent to-sq-accent-light shadow-sq-accent-glow hover:from-red-400 hover:to-red-500"
            : "border-[2.5px] border-[#DDD6CE] bg-white hover:border-sq-accent/60"
          }
          ${isLoading ? "animate-pulse" : ""}
        `}
        title={quest.isCompleted ? "Click to undo" : "Click to complete"}
      >
        {quest.isCompleted ? (
          <>
            <Check className={`w-[22px] h-[22px] text-white transition-opacity ${showUndo ? "opacity-0" : "opacity-100"}`} strokeWidth={3} />
            <Undo2 className={`w-[18px] h-[18px] text-white absolute transition-opacity ${showUndo ? "opacity-100" : "opacity-0"}`} strokeWidth={2.5} />
          </>
        ) : null}
      </button>
    </motion.div>
  );
}
