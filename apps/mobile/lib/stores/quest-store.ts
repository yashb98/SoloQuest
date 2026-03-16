/**
 * Zustand store for quests.
 */
import { create } from "zustand";
import { api } from "../api";

interface QuestState {
  quests: any[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  complete: (id: number) => Promise<void>;
  fail: (id: number) => Promise<void>;
}

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: [],
  loading: false,
  error: null,

  fetch: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const quests = await api.getQuests();
      set({ quests, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  complete: async (id: number) => {
    try {
      await api.completeQuest(id);
      await get().fetch();
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  fail: async (id: number) => {
    try {
      await api.failQuest(id);
      await get().fetch();
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));
