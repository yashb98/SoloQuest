"use client";

import { useEffect, useState, useCallback } from "react";
import QuestBoard from "@/components/QuestBoard";

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

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loadingQuestId, setLoadingQuestId] = useState<number | null>(null);

  const fetchQuests = useCallback(async () => {
    const res = await fetch("/api/quests");
    setQuests(await res.json());
  }, []);

  useEffect(() => {
    fetchQuests();
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
        setQuests((prev) =>
          prev.map((q) =>
            q.id === questId ? { ...q, isCompleted: true } : q
          )
        );
      }
    } catch (error) {
      console.error("Failed to complete quest:", error);
    } finally {
      setLoadingQuestId(null);
    }
  };

  return (
    <QuestBoard
      quests={quests}
      onComplete={handleComplete}
      loadingQuestId={loadingQuestId}
    />
  );
}
