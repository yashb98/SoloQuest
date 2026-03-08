"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Undo2, ChevronDown, Clock, Lightbulb, Star, Wrench, Target, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { getQuestDetail } from "@/lib/quest-details";

interface Quest {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  tier: string;
  xpBase: number;
  goldBase: number;
  statTarget: string;
  statGain: number;
  isCompleted: boolean;
}

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: number) => void;
  onUndo: (questId: number) => void;
  onDelete?: (questId: number) => void;
  onEdit?: (quest: Quest) => void;
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

const difficultyConfig: Record<string, { label: string; color: string; stars: number }> = {
  normal: { label: "Normal", color: "text-green-600", stars: 2 },
  hard: { label: "Hard", color: "text-orange-500", stars: 3 },
  legendary: { label: "Legendary", color: "text-purple-600", stars: 4 },
};

export default function QuestCard({ quest, onComplete, onUndo, onDelete, onEdit, isLoading }: QuestCardProps) {
  const color = categoryColors[quest.category] || { bg: "bg-gray-100", text: "text-gray-600" };
  const [showUndo, setShowUndo] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const detail = getQuestDetail(quest.title);
  const diff = difficultyConfig[quest.difficulty] || difficultyConfig.normal;

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
      className={`bg-white rounded-2xl transition-all overflow-hidden
        ${quest.isCompleted
          ? "border-[1.5px] border-[#DDD6CE] opacity-[0.65]"
          : "border-[1.5px] border-sq-border shadow-sq-card"
        }`}
      style={{ background: quest.isCompleted ? "#F8F6F2" : "#FFFFFF" }}
    >
      {/* Main card row */}
      <div
        className="py-5 px-6 flex items-center justify-between gap-4"
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
            <span className={`flex items-center gap-0.5 text-[12px] font-semibold ${diff.color}`}>
              {Array.from({ length: diff.stars }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
              <span className="ml-1">{diff.label}</span>
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
          <div className="flex gap-4 mt-[10px] flex-wrap items-center">
            <span className="text-[15px] font-semibold text-sq-accent">+{quest.xpBase} XP</span>
            <span className="text-[15px] font-semibold text-sq-gold">+{quest.goldBase} G</span>
            <span className={`text-[15px] font-semibold ${statColors[quest.statTarget] || "text-sq-muted"}`}>
              +{quest.statGain} {statLabels[quest.statTarget] || quest.statTarget}
            </span>
            {detail && (
              <span className="flex items-center gap-1 text-[13px] text-sq-muted">
                <Clock className="w-3 h-3" />
                {detail.estimatedTime}
              </span>
            )}
          </div>
        </div>

        {/* Right side: edit + delete + expand + complete buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Edit button */}
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(quest); }}
              className="w-9 h-9 rounded-full flex items-center justify-center border-[1.5px] border-[#DDD6CE] bg-white hover:bg-blue-50 hover:border-blue-400 transition-all"
              title="Edit quest"
            >
              <Pencil className="w-4 h-4 text-sq-muted hover:text-blue-500" />
            </button>
          )}
          {/* Delete button */}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(quest.id); }}
              className="w-9 h-9 rounded-full flex items-center justify-center border-[1.5px] border-red-300 bg-white hover:bg-red-50 hover:border-red-400 transition-all"
              title="Delete quest"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
          {/* Expand button */}
          {detail && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className={`w-9 h-9 rounded-full flex items-center justify-center border-[1.5px] border-[#DDD6CE] bg-white hover:border-sq-accent/60 transition-all ${expanded ? "bg-[#FFF3ED] border-sq-accent" : ""}`}
              title="View details"
            >
              <ChevronDown className={`w-4 h-4 text-sq-muted transition-transform ${expanded ? "rotate-180 text-sq-accent" : ""}`} />
            </button>
          )}
          {/* Complete / Undo button */}
          <button
            onClick={handleClick}
            disabled={isLoading}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all relative group
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
        </div>
      </div>

      {/* Expandable detail panel */}
      <AnimatePresence>
        {expanded && detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1 border-t border-sq-border/50 space-y-4">
              {/* Why it matters */}
              <div className="bg-[#FFF8F3] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-sq-accent" />
                  <span className="text-[14px] font-bold text-sq-accent">Why This Matters</span>
                </div>
                <p className="text-[14px] text-sq-text leading-relaxed">{detail.whyItMatters}</p>
              </div>

              {/* Step by step */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-sq-accent/10 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-sq-accent">📋</span>
                  </div>
                  <span className="text-[14px] font-bold text-sq-text">Step-by-Step</span>
                </div>
                <div className="space-y-2.5 ml-1">
                  {detail.steps.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sq-hover flex items-center justify-center mt-0.5">
                        <span className="text-[12px] font-bold text-sq-muted">{i + 1}</span>
                      </div>
                      <p className="text-[14px] text-sq-text leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-[14px] font-bold text-sq-text">Pro Tips</span>
                </div>
                <div className="space-y-2 ml-1">
                  {detail.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-[13px] text-yellow-500 mt-0.5 flex-shrink-0">💡</span>
                      <p className="text-[13px] text-sq-muted leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools */}
              {detail.tools && detail.tools.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-4 h-4 text-sq-muted" />
                    <span className="text-[14px] font-bold text-sq-text">Tools & Resources</span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-1">
                    {detail.tools.map((tool, i) => (
                      <span key={i} className="bg-sq-hover text-sq-muted px-3 py-1 rounded-full text-[13px] font-medium">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
