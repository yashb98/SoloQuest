"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trophy, Swords, CheckCircle } from "lucide-react";

interface Dungeon {
  id: number;
  title: string;
  description: string;
  objectives: string;
  bonusXP: number;
  bonusGold: number;
  statReward: string;
  statAmount: number;
  isActive: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  activatedAt: string | null;
  deadline: string | null;
}

const statIcons: Record<string, string> = {
  vitality: "VIT", intel: "INT", hustle: "HUS", wealth: "WLT", focus: "FOC", agentIQ: "AIQ",
};

export default function DungeonsPage() {
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<{ bonusXP: number; bonusGold: number } | null>(null);

  const fetchDungeons = useCallback(async () => {
    const res = await fetch("/api/dungeons");
    setDungeons(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchDungeons(); }, [fetchDungeons]);

  const handleAction = async (action: string, dungeonId: number) => {
    setActionId(dungeonId);
    const res = await fetch("/api/dungeons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, dungeonId }),
    });
    const data = await res.json();
    if (data.success && action === "complete") {
      setShowResult({ bonusXP: data.bonusXP, bonusGold: data.bonusGold });
    }
    if (!data.success && data.error) {
      alert(data.error);
    }
    fetchDungeons();
    setActionId(null);
  };

  const activeDungeon = dungeons.find((d) => d.isActive);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-border/30 rounded w-48" />
        {[1, 2, 3].map((i) => <div key={i} className="sq-panel p-6 h-32" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-sq-gold">DUNGEONS</h1>
        <span className="font-mono text-xs text-sq-muted">Weekly Challenges</span>
      </div>

      {/* Active Dungeon Banner */}
      {activeDungeon && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sq-panel p-5 border-2 border-sq-purple/50 shadow-sq-purple-glow"
        >
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-5 h-5 text-sq-purple" />
            <span className="font-display font-bold text-sq-purple">ACTIVE DUNGEON</span>
          </div>
          <h3 className="font-display font-bold text-lg text-sq-text">{activeDungeon.title}</h3>
          <p className="font-mono text-xs text-sq-muted mt-1">{activeDungeon.description}</p>

          {/* Objectives */}
          <div className="mt-3 space-y-1">
            {JSON.parse(activeDungeon.objectives).map((obj: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-sq-purple" />
                <span className="font-mono text-xs text-sq-text">{obj}</span>
              </div>
            ))}
          </div>

          {activeDungeon.deadline && (
            <div className="flex items-center gap-1 mt-3 text-sq-gold">
              <Clock className="w-3 h-3" />
              <span className="font-mono text-xs">
                Deadline: {new Date(activeDungeon.deadline).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleAction("complete", activeDungeon.id)}
              disabled={actionId === activeDungeon.id}
              className="sq-button-gold text-sm flex-1"
            >
              COMPLETE DUNGEON
            </button>
            <button
              onClick={() => handleAction("abandon", activeDungeon.id)}
              className="px-4 py-2 border border-red-500/30 text-red-400 rounded-md text-sm font-display font-bold hover:bg-red-500/10"
            >
              ABANDON
            </button>
          </div>
        </motion.div>
      )}

      {/* Dungeon List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {dungeons.filter((d) => !d.isActive).map((dungeon) => {
          const objectives = JSON.parse(dungeon.objectives);
          return (
            <motion.div
              key={dungeon.id}
              layout
              className={`sq-panel p-4 space-y-3 ${dungeon.isCompleted ? "opacity-50" : ""} ${dungeon.isFailed ? "border-red-500/30" : ""}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-sq-text">{dungeon.title}</h3>
                {dungeon.isCompleted && <CheckCircle className="w-4 h-4 text-sq-green" />}
              </div>
              <p className="font-mono text-[11px] text-sq-muted">{dungeon.description}</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono text-sq-gold">+{dungeon.bonusXP} XP</span>
                <span className="font-mono text-sq-gold">+{dungeon.bonusGold} G</span>
                <span className="font-mono text-sq-purple">+{dungeon.statAmount} {statIcons[dungeon.statReward] || dungeon.statReward}</span>
              </div>
              <div className="space-y-1">
                {objectives.slice(0, 3).map((obj: string, i: number) => (
                  <span key={i} className="font-mono text-[10px] text-sq-muted block">• {obj}</span>
                ))}
              </div>
              {!dungeon.isCompleted && !activeDungeon && (
                <button
                  onClick={() => handleAction("activate", dungeon.id)}
                  disabled={actionId === dungeon.id}
                  className="sq-button-blue w-full text-sm"
                >
                  {actionId === dungeon.id ? "ACTIVATING..." : "ENTER DUNGEON"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowResult(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="sq-panel p-8 max-w-sm mx-4 text-center border-2 border-sq-purple shadow-sq-purple-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <Trophy className="w-12 h-12 text-sq-purple mx-auto mb-4" />
              <h2 className="font-display font-bold text-2xl text-sq-purple mb-2">DUNGEON CLEARED!</h2>
              <p className="font-mono text-sm text-sq-gold">+{showResult.bonusXP} XP | +{showResult.bonusGold} Gold</p>
              <button onClick={() => setShowResult(null)} className="sq-button-gold mt-6 w-full">CLAIM REWARDS</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
