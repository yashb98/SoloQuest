"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Check, Trash2, X } from "lucide-react";

interface Goal {
  id: number;
  type: string;
  title: string;
  description: string;
  targetDate: string | null;
  xpReward: number;
  goldReward: number;
  isCompleted: boolean;
  completedAt: string | null;
}

const typeConfig: Record<string, { label: string; color: string; border: string }> = {
  sprint: { label: "SPRINT", color: "text-sq-green", border: "border-sq-green/30" },
  monthly: { label: "MONTHLY", color: "text-sq-blue", border: "border-sq-blue/30" },
  life: { label: "LIFE QUEST", color: "text-sq-gold", border: "border-sq-gold/30" },
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("sprint");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState("");

  const fetchGoals = useCallback(async () => {
    const res = await fetch("/api/goals");
    setGoals(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleCreate = async () => {
    if (!formTitle) return;
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: formType, title: formTitle,
        description: formDesc, targetDate: formDate || undefined,
      }),
    });
    setFormTitle(""); setFormDesc(""); setFormDate(""); setShowForm(false);
    fetchGoals();
  };

  const handleComplete = async (goalId: number) => {
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", goalId }),
    });
    fetchGoals();
  };

  const handleDelete = async (goalId: number) => {
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", goalId }),
    });
    fetchGoals();
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-border/30 rounded w-48" />
        {[1, 2, 3].map((i) => <div key={i} className="sq-panel p-6 h-24" />)}
      </div>
    );
  }

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-sq-gold">GOALS</h1>
        <button onClick={() => setShowForm(!showForm)} className="sq-button-gold text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Create Goal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sq-panel p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-sq-gold">Set New Goal</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-sq-muted" /></button>
            </div>
            <div className="flex gap-2">
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setFormType(key)}
                  className={`px-3 py-1 rounded text-xs font-display font-bold border transition-all ${
                    formType === key ? `${cfg.border} ${cfg.color} bg-sq-bg` : "border-sq-border text-sq-muted"
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Goal title..."
              className="w-full bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono"
            />
            <input
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono"
            />
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono"
            />
            <button onClick={handleCreate} className="sq-button-gold w-full text-sm">CREATE GOAL</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-sm text-sq-text">ACTIVE GOALS</h2>
          {activeGoals.map((goal) => {
            const cfg = typeConfig[goal.type] || typeConfig.sprint;
            return (
              <motion.div key={goal.id} layout className={`sq-panel p-4 border ${cfg.border}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                      <Target className={`w-3 h-3 ${cfg.color}`} />
                    </div>
                    <h3 className="font-display font-bold text-sm text-sq-text mt-1">{goal.title}</h3>
                    {goal.description && <p className="font-mono text-[11px] text-sq-muted mt-1">{goal.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-mono text-[10px] text-sq-gold">+{goal.xpReward} XP</span>
                      <span className="font-mono text-[10px] text-sq-gold">+{goal.goldReward} G</span>
                      {goal.targetDate && (
                        <span className="font-mono text-[10px] text-sq-muted">
                          Due: {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleComplete(goal.id)}
                      className="w-8 h-8 rounded-md border border-sq-green/30 text-sq-green flex items-center justify-center hover:bg-sq-green/10"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="w-8 h-8 rounded-md border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-sm text-sq-muted">COMPLETED</h2>
          {completedGoals.map((goal) => (
            <div key={goal.id} className="sq-panel p-3 opacity-50">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sq-green" />
                <span className="font-display text-sm text-sq-muted line-through">{goal.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeGoals.length === 0 && completedGoals.length === 0 && (
        <div className="sq-panel p-8 text-center">
          <Target className="w-8 h-8 text-sq-muted mx-auto mb-2" />
          <p className="font-mono text-sm text-sq-muted">No goals set. Create a Sprint, Monthly, or Life Quest goal.</p>
        </div>
      )}
    </div>
  );
}
