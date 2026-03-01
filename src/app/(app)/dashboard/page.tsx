"use client";

import { useEffect, useState, useCallback } from "react";
import QuestBoard from "@/components/QuestBoard";
import LevelUpModal from "@/components/LevelUpModal";

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

interface LevelUpData {
  newLevel: number;
  newRank: string;
  isGateLocked: boolean;
  gateLevel: number | null;
  levelsGained: number;
  statPointsEarned: number;
  goldBonus: number;
}

export default function DashboardPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loadingQuestId, setLoadingQuestId] = useState<number | null>(null);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuests = useCallback(async () => {
    const res = await fetch("/api/quests");
    const data = await res.json();
    setQuests(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const handleCompleteQuest = async (questId: number) => {
    setLoadingQuestId(questId);

    try {
      const res = await fetch("/api/quests/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId }),
      });

      const data = await res.json();

      if (data.success) {
        setQuests((prev) =>
          prev.map((q) =>
            q.id === questId ? { ...q, isCompleted: true } : q
          )
        );

        if (data.didLevelUp || data.isGateLocked) {
          setLevelUpData({
            newLevel: data.newLevel,
            newRank: data.newRank,
            isGateLocked: data.isGateLocked,
            gateLevel: data.gateLevel,
            levelsGained: data.levelsGained ?? 1,
            statPointsEarned: data.statPointsEarned ?? 0,
            goldBonus: data.levelUpGoldBonus ?? 0,
          });
        }
      }
    } catch (error) {
      console.error("Failed to complete quest:", error);
    } finally {
      setLoadingQuestId(null);
    }
  };

  const handleUndoQuest = async (questId: number) => {
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
          prev.map((q) =>
            q.id === questId ? { ...q, isCompleted: false } : q
          )
        );
      }
    } catch (error) {
      console.error("Failed to undo quest:", error);
    } finally {
      setLoadingQuestId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="sq-panel p-6 animate-pulse">
          <div className="h-6 bg-sq-hover rounded-xl w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-sq-hover rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <QuestBoard
        quests={quests}
        onComplete={handleCompleteQuest}
        onUndo={handleUndoQuest}
        loadingQuestId={loadingQuestId}
      />

      <LevelUpModal
        isOpen={levelUpData !== null}
        onClose={() => setLevelUpData(null)}
        newLevel={levelUpData?.newLevel ?? 1}
        newRank={levelUpData?.newRank ?? "E"}
        isGateLocked={levelUpData?.isGateLocked ?? false}
        gateLevel={levelUpData?.gateLevel ?? null}
        levelsGained={levelUpData?.levelsGained}
        statPointsEarned={levelUpData?.statPointsEarned}
        goldBonus={levelUpData?.goldBonus}
      />
    </div>
  );
}
