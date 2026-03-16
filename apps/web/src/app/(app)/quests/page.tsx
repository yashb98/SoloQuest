"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Coins, TrendingUp, PartyPopper, X } from "lucide-react";
import QuestBoard from "@/components/QuestBoard";
import { useHunter } from "@/contexts/HunterContext";

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

interface CompletionReward {
  questTitle: string;
  xpEarned: number;
  goldEarned: number;
  levelUpGoldBonus: number;
  statGain: number;
  statTarget: string;
  didLevelUp: boolean;
  newLevel?: number;
  newRankLevel?: number;
  newRank?: string;
}

const statLabels: Record<string, string> = {
  vitality: "VIT", intel: "INT", hustle: "HUS", wealth: "WLT", focus: "FOC", agentIQ: "AIQ",
};

export default function QuestsPage() {
  const { refreshHunter, addToast, checkAchievements, updateHunterOptimistic, hunter } = useHunter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loadingQuestId, setLoadingQuestId] = useState<number | null>(null);
  const [completionReward, setCompletionReward] = useState<CompletionReward | null>(null);

  const fetchQuests = useCallback(async () => {
    const res = await fetch("/api/quests");
    setQuests(await res.json());
  }, []);

  useEffect(() => {
    fetchQuests();
    // Re-fetch quests when day changes at midnight
    const onDayChange = () => fetchQuests();
    window.addEventListener("sq-day-changed", onDayChange);
    return () => window.removeEventListener("sq-day-changed", onDayChange);
  }, [fetchQuests]);

  const handleComplete = async (questId: number) => {
    setLoadingQuestId(questId);
    try {
      const res = await fetch("/api/quests/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId }),
      });
      const data = await res.json();
      if (data.success) {
        const quest = quests.find((q) => q.id === questId);
        setQuests((prev) =>
          prev.map((q) => (q.id === questId ? { ...q, isCompleted: true } : q))
        );

        // Optimistic XP/gold update
        if (hunter) {
          updateHunterOptimistic({
            xp: data.didLevelUp ? 0 : hunter.xp + data.xpEarned,
            gold: hunter.gold + data.goldEarned + (data.levelUpGoldBonus || 0),
            level: data.newLevel || hunter.level,
            rankLevel: data.newRankLevel || hunter.rankLevel,
            rank: data.newRank || hunter.rank,
          });
        }

        // Show completion popup
        setCompletionReward({
          questTitle: quest?.title || "Quest",
          xpEarned: data.xpEarned,
          goldEarned: data.goldEarned,
          levelUpGoldBonus: data.levelUpGoldBonus || 0,
          statGain: data.statGain,
          statTarget: data.statTarget,
          didLevelUp: data.didLevelUp,
          newLevel: data.newLevel,
          newRankLevel: data.newRankLevel,
          newRank: data.newRank,
        });

        // Auto-dismiss after 3.5 seconds
        setTimeout(() => setCompletionReward(null), 3500);

        // Background refresh + achievement check
        refreshHunter();
        checkAchievements();
      }
    } catch (error) {
      console.error("Failed to complete quest:", error);
      addToast({ type: "error", title: "Failed to complete quest" });
    } finally {
      setLoadingQuestId(null);
    }
  };

  const handleUndo = async (questId: number) => {
    setLoadingQuestId(questId);
    try {
      const res = await fetch("/api/quests/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId, undo: true }),
      });
      const data = await res.json();
      if (data.success && data.undone) {
        setQuests((prev) =>
          prev.map((q) => (q.id === questId ? { ...q, isCompleted: false } : q))
        );
        addToast({ type: "info", title: "Quest undone", description: `-${data.xpReversed} XP`, duration: 2500 });
        refreshHunter();
      }
    } catch (error) {
      console.error("Failed to undo quest:", error);
    } finally {
      setLoadingQuestId(null);
    }
  };

  const handleChecklistUpdate = async (questId: number, checklist: string) => {
    // Optimistic local update
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, checklist } : q))
    );
    // Persist to DB
    try {
      await fetch("/api/quests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: questId, checklist }),
      });
    } catch (err) {
      console.error("Failed to save checklist:", err);
    }
  };

  const handleDelete = async (questId: number) => {
    try {
      const res = await fetch(`/api/quests?id=${questId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setQuests((prev) => prev.filter((q) => q.id !== questId));
        addToast({ type: "info", title: "Quest deleted", description: data.deleted, duration: 2500 });
      }
    } catch (error) {
      console.error("Failed to delete quest:", error);
      addToast({ type: "error", title: "Failed to delete quest" });
    }
  };

  return (
    <>
      <QuestBoard
        quests={quests}
        onComplete={handleComplete}
        onUndo={handleUndo}
        onDelete={handleDelete}
        onQuestCreated={fetchQuests}
        onChecklistUpdate={handleChecklistUpdate}
        loadingQuestId={loadingQuestId}
      />

      {/* Quest Completion Notification Popup */}
      <AnimatePresence>
        {completionReward && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90vw] max-w-sm"
          >
            <div className="bg-white rounded-2xl border-2 border-sq-accent shadow-lg overflow-hidden">
              {/* Top accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-sq-accent via-sq-gold to-sq-green" />

              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sq-accent to-sq-gold flex items-center justify-center">
                      <PartyPopper className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-sq-accent uppercase tracking-wide">Quest Complete!</p>
                      <p className="text-[14px] font-semibold text-sq-text truncate max-w-[200px]">{completionReward.questTitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCompletionReward(null)}
                    className="p-1 rounded-lg text-sq-muted hover:text-sq-text hover:bg-sq-hover transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Rewards row */}
                <div className="flex items-center gap-3 justify-center">
                  <div className="flex items-center gap-1.5 bg-[#FFF3ED] px-3 py-1.5 rounded-full">
                    <Zap className="w-4 h-4 text-sq-accent" />
                    <span className="text-[14px] font-bold text-sq-accent">+{completionReward.xpEarned} XP</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#FFFBEB] px-3 py-1.5 rounded-full">
                    <Coins className="w-4 h-4 text-sq-gold" />
                    <span className="text-[14px] font-bold text-sq-gold">
                      +{completionReward.goldEarned + completionReward.levelUpGoldBonus} G
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F0FDF4] px-3 py-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4 text-sq-green" />
                    <span className="text-[14px] font-bold text-sq-green">
                      +{completionReward.statGain} {statLabels[completionReward.statTarget] || completionReward.statTarget}
                    </span>
                  </div>
                </div>

                {/* Level up banner */}
                {completionReward.didLevelUp && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-center py-2 rounded-xl bg-gradient-to-r from-sq-accent/10 to-sq-gold/10 border border-sq-accent/30"
                  >
                    <p className="text-[14px] font-bold text-sq-accent">
                      🎉 Rank Up! {completionReward.newRank}-{completionReward.newRankLevel} (+{completionReward.levelUpGoldBonus}G Bonus)
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
