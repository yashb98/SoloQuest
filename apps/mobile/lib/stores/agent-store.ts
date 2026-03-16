/**
 * Zustand store for agent dashboard — configs, runs, undo.
 */
import { create } from "zustand";
import { api, agents } from "../api";

interface AgentState {
  configs: any[];
  runs: any[];
  loading: boolean;
  error: string | null;
  fetchConfigs: () => Promise<void>;
  fetchRuns: (limit?: number) => Promise<void>;
  toggleAgent: (name: string, enabled: boolean) => Promise<void>;
  undoAction: (runId: number, actionIndex?: number) => Promise<void>;
  triggerAgent: (name: string) => Promise<any>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  configs: [],
  runs: [],
  loading: false,
  error: null,

  fetchConfigs: async () => {
    try {
      const configs = await api.getAgentConfigs();
      set({ configs });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  fetchRuns: async (limit = 50) => {
    try {
      const runs = await api.getAgentRuns(limit);
      set({ runs });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  toggleAgent: async (name: string, enabled: boolean) => {
    try {
      await api.updateAgentConfig(name, { enabled });
      await get().fetchConfigs();
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  undoAction: async (runId: number, actionIndex = 0) => {
    try {
      await agents.undoAction(runId, actionIndex);
      await get().fetchRuns();
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  triggerAgent: async (name: string) => {
    const triggers: Record<string, () => Promise<any>> = {
      morning_plan: agents.morningPlan,
      check_progress: agents.checkProgress,
      evening_wrap: agents.eveningWrap,
      weekly_strategy: agents.weeklyStrategy,
      quest_optimization: agents.questOptimization,
      learning_check: agents.learningCheck,
      streak_check: agents.streakCheck,
      social_check: agents.socialCheck,
      notion_sync: agents.notionSync,
    };

    const trigger = triggers[name];
    if (trigger) {
      return await trigger();
    }
    throw new Error(`No trigger for agent: ${name}`);
  },
}));
