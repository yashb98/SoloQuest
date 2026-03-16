"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Plus, Check, X, Sparkles, Loader2, Trash2, ChevronDown } from "lucide-react";
import { useHunter } from "@/contexts/HunterContext";

interface ChainStep {
  id: number;
  chainId: number;
  stepOrder: number;
  title: string;
  category: string;
  difficulty: string;
  xpBase: number;
  goldBase: number;
  statTarget: string;
  isCompleted: boolean;
}

interface Chain {
  id: number;
  title: string;
  description: string;
  totalSteps: number;
  currentStep: number;
  isCompleted: boolean;
  xpBonus: number;
  goldBonus: number;
  steps: ChainStep[];
}

export default function ChainsPage() {
  const { addToast, refreshHunter, checkAchievements } = useHunter();
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedChain, setExpandedChain] = useState<number | null>(null);

  const fetchChains = useCallback(async () => {
    const res = await fetch("/api/quest-chains");
    setChains(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchChains(); }, [fetchChains]);

  const handleCompleteStep = async (stepId: number) => {
    try {
      const res = await fetch("/api/quest-chains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete_step", stepId }),
      });
      const data = await res.json();
      if (data.success) {
        addToast({
          type: "xp",
          title: `Step Complete! +${data.xpEarned} XP`,
          description: data.chainCompleted ? "Chain completed! Bonus rewards!" : `+${data.goldEarned}G`,
          duration: 3000,
        });
        refreshHunter();
        checkAchievements();
        fetchChains();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChain = async (chainId: number) => {
    try {
      await fetch("/api/quest-chains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", chainId }),
      });
      fetchChains();
      addToast({ type: "info", title: "Chain deleted" });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-hover rounded-xl w-48" />
        {[1, 2, 3].map((i) => <div key={i} className="sq-panel p-6 h-32" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">Quest Chains</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sq-accent text-white text-[14px] font-semibold hover:bg-sq-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Chain
        </button>
      </div>

      {chains.length === 0 && (
        <div className="sq-panel p-8 text-center">
          <Link2 className="w-8 h-8 text-sq-muted mx-auto mb-3" />
          <p className="text-[15px] text-sq-muted">No quest chains yet. Create one or use AI to generate a chain!</p>
        </div>
      )}

      {/* Chains List */}
      <div className="space-y-4">
        {chains.map((chain) => {
          const pct = chain.totalSteps > 0 ? Math.round((chain.currentStep / chain.totalSteps) * 100) : 0;
          const isExpanded = expandedChain === chain.id;

          return (
            <motion.div
              key={chain.id}
              layout
              className={`sq-panel overflow-hidden ${chain.isCompleted ? "opacity-70" : ""}`}
            >
              {/* Chain header */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedChain(isExpanded ? null : chain.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Link2 className={`w-5 h-5 ${chain.isCompleted ? "text-sq-green" : "text-sq-accent"}`} />
                    <h3 className="text-[17px] font-bold text-sq-text">{chain.title}</h3>
                    {chain.isCompleted && (
                      <span className="text-[11px] bg-sq-green/20 text-sq-green px-2 py-0.5 rounded-full font-bold">COMPLETE</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteChain(chain.id); }}
                      className="p-1.5 rounded-lg text-sq-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-sq-muted transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {chain.description && (
                  <p className="text-[13px] text-sq-muted mb-3">{chain.description}</p>
                )}

                <div className="flex items-center gap-4 mb-2">
                  <span className="text-[13px] text-sq-accent font-semibold">{chain.currentStep}/{chain.totalSteps} steps</span>
                  <span className="text-[12px] text-sq-muted">Bonus: +{chain.xpBonus} XP +{chain.goldBonus}G</span>
                </div>

                <div className="h-1.5 bg-sq-hover rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${chain.isCompleted ? "bg-sq-green" : "bg-sq-accent"}`}
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Expanded steps */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-sq-border space-y-2">
                      {chain.steps.map((step) => {
                        const isNext = !step.isCompleted && chain.steps.filter((s) => !s.isCompleted)[0]?.id === step.id;
                        return (
                          <div
                            key={step.id}
                            className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${
                              step.isCompleted ? "bg-sq-green/5" : isNext ? "bg-sq-accent/5 border border-sq-accent/20" : "bg-sq-hover/50"
                            }`}
                          >
                            <button
                              onClick={() => !step.isCompleted && handleCompleteStep(step.id)}
                              disabled={step.isCompleted || !isNext}
                              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                step.isCompleted
                                  ? "bg-sq-green text-white"
                                  : isNext
                                  ? "border-2 border-sq-accent bg-white hover:bg-sq-accent hover:text-white"
                                  : "border-2 border-sq-border bg-white opacity-50"
                              }`}
                            >
                              {step.isCompleted && <Check className="w-4 h-4" />}
                              {isNext && !step.isCompleted && <span className="text-[11px] font-bold text-sq-accent">{step.stepOrder}</span>}
                              {!step.isCompleted && !isNext && <span className="text-[11px] font-bold text-sq-muted">{step.stepOrder}</span>}
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className={`text-[14px] font-medium ${step.isCompleted ? "text-sq-muted line-through" : "text-sq-text"}`}>
                                {step.title}
                              </span>
                            </div>
                            <span className="text-[12px] text-sq-accent font-semibold flex-shrink-0">+{step.xpBase} XP</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Create Chain Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateChainModal
            onClose={() => setShowCreate(false)}
            onCreated={() => { setShowCreate(false); fetchChains(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Create Chain Modal ---
function CreateChainModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<Array<{ title: string; category: string; xpBase: number; statTarget: string }>>([]);
  const [saving, setSaving] = useState(false);

  const handleAiGenerate = async () => {
    if (!goal.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-chain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal.trim() }),
      });
      const data = await res.json();
      if (data.success && data.chain) {
        setTitle(data.chain.title || goal.trim());
        setSteps(data.chain.steps || []);
      }
    } catch {
      // Fallback
      setTitle(goal.trim());
      setSteps([
        { title: "Research and plan approach", category: "learning", xpBase: 40, statTarget: "intel" },
        { title: "Set up tools and resources", category: "focus", xpBase: 30, statTarget: "focus" },
        { title: "Execute main task", category: "focus", xpBase: 80, statTarget: "focus" },
        { title: "Review and iterate", category: "learning", xpBase: 50, statTarget: "intel" },
        { title: "Document results", category: "learning", xpBase: 40, statTarget: "intel" },
      ]);
    }
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!title.trim() || steps.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/quest-chains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), steps }),
      });
      const data = await res.json();
      if (data.success) onCreated();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="sq-panel p-6 max-w-lg w-full mx-4 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] font-bold text-sq-text">Create Quest Chain</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-sq-muted hover:text-sq-text hover:bg-sq-hover">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Generate */}
        <div>
          <label className="text-[13px] font-semibold text-sq-text block mb-1.5">What&apos;s your goal?</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Build a portfolio website..."
              className="sq-input flex-1"
            />
            <button
              onClick={handleAiGenerate}
              disabled={!goal.trim() || generating}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-sq-accent text-white text-[13px] font-semibold disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "..." : "AI"}
            </button>
          </div>
        </div>

        {/* Title */}
        {steps.length > 0 && (
          <>
            <div>
              <label className="text-[13px] font-semibold text-sq-text block mb-1.5">Chain Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="sq-input"
              />
            </div>

            {/* Steps preview */}
            <div>
              <label className="text-[13px] font-semibold text-sq-text block mb-2">Steps ({steps.length})</label>
              <div className="space-y-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 py-2 px-3 rounded-xl bg-sq-hover">
                    <span className="text-[12px] font-bold text-sq-muted w-6 text-center">{i + 1}</span>
                    <span className="text-[14px] text-sq-text flex-1">{step.title}</span>
                    <span className="text-[11px] text-sq-accent font-semibold">+{step.xpBase} XP</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="sq-button-accent w-full text-[14px] disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Chain"}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
