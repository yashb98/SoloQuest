/**
 * Zustand store for hunter (player) state.
 */
import { create } from "zustand";
import { api } from "../api";

interface HunterState {
  hunter: any | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useHunterStore = create<HunterState>((set, get) => ({
  hunter: null,
  loading: false,
  error: null,

  fetch: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const hunter = await api.getHunter();
      set({ hunter, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  refresh: async () => {
    try {
      const hunter = await api.getHunter();
      set({ hunter });
    } catch {
      // Silent refresh failure
    }
  },
}));
