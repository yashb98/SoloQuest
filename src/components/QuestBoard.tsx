"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
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
  statGain: number;
  isCompleted: boolean;
}

interface QuestBoardProps {
  quests: Quest[];
  onComplete: (questId: number) => void;
  onUndo: (questId: number) => void;
  onQuestCreated?: () => void;
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

const STAT_OPTIONS = [
  { key: "vitality", label: "Vitality (VIT)" },
  { key: "intel", label: "Intelligence (INT)" },
  { key: "hustle", label: "Hustle (HUS)" },
  { key: "wealth", label: "Wealth (WLT)" },
  { key: "focus", label: "Focus (FOC)" },
  { key: "agentIQ", label: "Agent IQ (AIQ)" },
];

export default function QuestBoard({ quests, onComplete, onUndo, onQuestCreated, loadingQuestId }: QuestBoardProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTier, setActiveTier] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-baseline gap-4">
          <h2 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">Quest Board</h2>
          <span className="text-[15px] text-sq-muted font-medium">{completedCount}/{quests.length} complete</span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sq-accent text-white text-[14px] font-semibold hover:bg-sq-accent/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Quest
        </button>
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
              className={`flex-shrink-0 px-[18px] py-2 rounded-full font-semibold text-[14px] transition-all whitespace-nowrap
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
              className={`flex-shrink-0 px-[18px] py-2 rounded-full font-semibold text-[14px] transition-all whitespace-nowrap
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
          <div className="text-center py-[60px] text-sq-muted text-[15px]">
            No quests found for this filter combination.
          </div>
        )}
      </div>

      {/* Add Quest Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddQuestModal
            onClose={() => setShowAddModal(false)}
            onCreated={() => { setShowAddModal(false); onQuestCreated?.(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Add Quest Modal ---
function AddQuestModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("focus");
  const [difficulty, setDifficulty] = useState("normal");
  const [tier, setTier] = useState("custom");
  const [statTarget, setStatTarget] = useState("focus");
  const [xpBase, setXpBase] = useState(50);
  const [goldBase, setGoldBase] = useState(10);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), category, difficulty, tier, xpBase, goldBase, statTarget, statGain: 1 }),
      });
      const data = await res.json();
      if (data.success) onCreated();
    } catch (e) {
      console.error("Failed to create quest:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="sq-panel p-6 max-w-md w-full mx-4 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] font-bold text-sq-text">Create Custom Quest</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-sq-muted hover:text-sq-text hover:bg-sq-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="text-[13px] font-semibold text-sq-text block mb-1.5">Quest Title</label>
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Complete a portfolio project..."
            className="w-full px-4 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text placeholder:text-sq-muted/50 focus:outline-none focus:border-sq-accent"
          />
        </div>

        {/* Category + Difficulty row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[13px] font-semibold text-sq-text block mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text focus:outline-none focus:border-sq-accent"
            >
              <option value="health">Health</option>
              <option value="learning">Learning</option>
              <option value="jobs">Jobs</option>
              <option value="finance">Finance</option>
              <option value="focus">Focus</option>
              <option value="food">Food</option>
              <option value="mental">Mental</option>
              <option value="agentiq">AI/Tech</option>
            </select>
          </div>
          <div>
            <label className="text-[13px] font-semibold text-sq-text block mb-1.5">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text focus:outline-none focus:border-sq-accent"
            >
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
        </div>

        {/* Tier + Stat */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[13px] font-semibold text-sq-text block mb-1.5">Tier</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text focus:outline-none focus:border-sq-accent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="text-[13px] font-semibold text-sq-text block mb-1.5">Stat Target</label>
            <select value={statTarget} onChange={(e) => setStatTarget(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text focus:outline-none focus:border-sq-accent"
            >
              {STAT_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* XP + Gold */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[13px] font-semibold text-sq-text block mb-1.5">Base XP</label>
            <input type="number" value={xpBase} onChange={(e) => setXpBase(Number(e.target.value))} min={10} max={500}
              className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text focus:outline-none focus:border-sq-accent"
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-sq-text block mb-1.5">Base Gold</label>
            <input type="number" value={goldBase} onChange={(e) => setGoldBase(Number(e.target.value))} min={5} max={200}
              className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text focus:outline-none focus:border-sq-accent"
            />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!title.trim() || saving}
          className="sq-button-gold w-full text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Creating..." : "Create Quest"}
        </button>
      </motion.div>
    </motion.div>
  );
}
