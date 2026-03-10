"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Undo2, ChevronDown, Clock, Lightbulb, Star, Wrench, Target, Trash2, Pencil, CheckSquare, Square, RefreshCw, Loader2, ListChecks, Sparkles, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { getQuestDetail } from "@/lib/quest-details";

interface Quest {
  id: number;
  title: string;
  description: string;
  checklist: string;
  category: string;
  difficulty: string;
  tier: string;
  xpBase: number;
  goldBase: number;
  statTarget: string;
  statGain: number;
  isCompleted: boolean;
}

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: number) => void;
  onUndo: (questId: number) => void;
  onDelete?: (questId: number) => void;
  onEdit?: (quest: Quest) => void;
  onChecklistUpdate?: (questId: number, checklist: string) => void;
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

export default function QuestCard({ quest, onComplete, onUndo, onDelete, onEdit, onChecklistUpdate, isLoading }: QuestCardProps) {
  const color = categoryColors[quest.category] || { bg: "bg-gray-100", text: "text-gray-600" };
  const [showUndo, setShowUndo] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const detail = getQuestDetail(quest.title);
  const hasDescription = !!quest.description?.trim();
  const diff = difficultyConfig[quest.difficulty] || difficultyConfig.normal;

  // Parse checklist
  const checklistItems: ChecklistItem[] = (() => {
    try {
      const parsed = JSON.parse(quest.checklist || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const hasChecklist = checklistItems.length > 0;
  const checkedCount = checklistItems.filter((i) => i.done).length;

  const handleClick = () => {
    if (quest.isCompleted) {
      onUndo(quest.id);
    } else {
      onComplete(quest.id);
    }
  };

  const handleToggleItem = (itemId: string) => {
    const updated = checklistItems.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    const newJson = JSON.stringify(updated);
    onChecklistUpdate?.(quest.id, newJson);
  };

  const handleGenerate = async (customInstructions?: string) => {
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/ai/generate-quest-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId: quest.id,
          title: quest.title,
          category: quest.category,
          difficulty: quest.difficulty,
          description: quest.description,
          ...(customInstructions?.trim() ? { customInstructions: customInstructions.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        onChecklistUpdate?.(quest.id, data.checklistJson);
        setShowCustomInput(false);
        setCustomPrompt("");
      }
    } catch (err) {
      console.error("Failed to generate checklist:", err);
    }
    setIsRegenerating(false);
  };

  const handleCustomSubmit = () => {
    if (!customPrompt.trim()) return;
    handleGenerate(customPrompt);
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

          {/* Rewards + checklist progress */}
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
            {hasChecklist && (
              <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${checkedCount === checklistItems.length ? "text-sq-green" : "text-sq-muted"}`}>
                <ListChecks className="w-3.5 h-3.5" />
                {checkedCount}/{checklistItems.length}
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
          {/* Expand button — always show now (checklist can be generated even without detail/description) */}
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center border-[1.5px] border-[#DDD6CE] bg-white hover:border-sq-accent/60 transition-all ${expanded ? "bg-[#FFF3ED] border-sq-accent" : ""}`}
            title="View details"
          >
            <ChevronDown className={`w-4 h-4 text-sq-muted transition-transform ${expanded ? "rotate-180 text-sq-accent" : ""}`} />
          </button>
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
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1 border-t border-sq-border/50 space-y-4">
              {detail ? (
                <>
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
                </>
              ) : hasDescription ? (
                /* AI-generated or user-written description fallback */
                <div className="bg-[#FFF8F3] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-sq-accent" />
                    <span className="text-[14px] font-bold text-sq-accent">Quest Details</span>
                  </div>
                  <p className="text-[14px] text-sq-text leading-relaxed whitespace-pre-line">{quest.description}</p>
                </div>
              ) : null}

              {/* Checklist section */}
              {hasChecklist && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-sq-accent" />
                      <span className="text-[14px] font-bold text-sq-text">
                        Checklist ({checkedCount}/{checklistItems.length})
                      </span>
                    </div>
                    <button
                      onClick={() => handleGenerate()}
                      disabled={isRegenerating}
                      className="flex items-center gap-1 text-[12px] font-semibold text-sq-muted hover:text-sq-accent transition-colors disabled:opacity-50"
                    >
                      {isRegenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Regenerate
                    </button>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-sq-hover rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sq-accent to-sq-green rounded-full transition-all duration-300"
                      style={{ width: `${checklistItems.length > 0 ? (checkedCount / checklistItems.length) * 100 : 0}%` }}
                    />
                  </div>
                  {/* Checklist items */}
                  <div className="space-y-2">
                    {checklistItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
                        className="flex items-start gap-3 w-full text-left group"
                      >
                        {item.done ? (
                          <CheckSquare className="w-5 h-5 text-sq-accent flex-shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-5 h-5 text-sq-muted group-hover:text-sq-accent flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-[14px] leading-relaxed ${item.done ? "text-sq-muted line-through" : "text-sq-text"}`}>
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate checklist options (when no checklist exists yet) */}
              {!hasChecklist && !isRegenerating && !showCustomInput && (
                <div className="space-y-3">
                  <p className="text-[13px] font-semibold text-sq-text">Generate Checklist</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerate()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-[1.5px] border-sq-accent bg-sq-accent/5 text-[13px] font-semibold text-sq-accent hover:bg-sq-accent/10 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Auto Generate
                    </button>
                    <button
                      onClick={() => setShowCustomInput(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-[1.5px] border-sq-border text-[13px] font-semibold text-sq-text hover:border-sq-accent/50 hover:bg-sq-hover transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Custom
                    </button>
                  </div>
                </div>
              )}

              {/* Custom instructions input */}
              {!hasChecklist && showCustomInput && !isRegenerating && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-sq-text">Describe how to break this quest down</p>
                    <button
                      onClick={() => { setShowCustomInput(false); setCustomPrompt(""); }}
                      className="text-[12px] text-sq-muted hover:text-sq-text transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                      placeholder="e.g., Focus on coding tasks only, 30 min each..."
                      className="flex-1 px-4 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[13px] text-sq-text placeholder:text-sq-muted/50 focus:outline-none focus:border-sq-accent"
                      autoFocus
                    />
                    <button
                      onClick={handleCustomSubmit}
                      disabled={!customPrompt.trim()}
                      className="px-4 py-2.5 rounded-xl bg-sq-accent text-white text-[13px] font-semibold hover:bg-sq-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Generate
                    </button>
                  </div>
                </div>
              )}

              {/* Generating state */}
              {!hasChecklist && isRegenerating && (
                <div className="flex items-center gap-2 text-[13px] font-semibold text-sq-accent">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating checklist...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
