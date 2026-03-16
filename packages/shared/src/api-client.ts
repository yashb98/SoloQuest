// Typed API client for SoloQuest — used by mobile app and agent backend
import type { HunterData, Quest, TodoItem, AgentRun, AgentConfig, CompletionResult } from "./types";

export class SoloQuestAPI {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string = "") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = token;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(options?.headers as Record<string, string> || {}),
    };

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API ${res.status}: ${body}`);
    }
    return res.json();
  }

  // Hunter
  async getHunter(): Promise<HunterData> {
    return this.fetch("/api/hunter");
  }

  async selectClass(hunterClass: string): Promise<{ success: boolean }> {
    return this.fetch("/api/hunter/class", {
      method: "POST",
      body: JSON.stringify({ hunterClass }),
    });
  }

  async allocateStat(stat: string): Promise<{ success: boolean }> {
    return this.fetch("/api/hunter/stats", {
      method: "POST",
      body: JSON.stringify({ stat }),
    });
  }

  // Quests
  async getQuests(): Promise<Quest[]> {
    return this.fetch("/api/quests");
  }

  async completeQuest(questId: number, notes?: string): Promise<CompletionResult> {
    return this.fetch("/api/quests/complete", {
      method: "POST",
      body: JSON.stringify({ questId, notes }),
    });
  }

  async undoQuestCompletion(questId: number): Promise<CompletionResult> {
    return this.fetch("/api/quests/complete", {
      method: "POST",
      body: JSON.stringify({ questId, undo: true }),
    });
  }

  // Todos
  async getTodos(date: string): Promise<{ todos: TodoItem[] }> {
    return this.fetch(`/api/todos?date=${date}`);
  }

  async createTodo(data: { title: string; date: string; category?: string; priority?: number }): Promise<TodoItem> {
    return this.fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify({ action: "create", ...data }),
    });
  }

  async toggleTodo(todoId: number): Promise<{ success: boolean }> {
    return this.fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify({ action: "toggle", todoId }),
    });
  }

  async carryOverTodos(): Promise<{ success: boolean; carried: number }> {
    return this.fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify({ action: "carry_over" }),
    });
  }

  // Savings / Spending
  async logSpend(data: { category: string; amount: number; description: string }): Promise<{ success: boolean }> {
    return this.fetch("/api/savings", {
      method: "POST",
      body: JSON.stringify({ type: "spend", ...data }),
    });
  }

  async getSavings(): Promise<{
    pots: Record<string, number>;
    recentSpending: Array<{ category: string; amount: number; description: string }>;
    monthlyTotal: number;
  }> {
    return this.fetch("/api/savings");
  }

  // Timer
  async startTimer(data: { label: string; duration: number; questId?: number; todoId?: number }): Promise<{ success: boolean }> {
    return this.fetch("/api/timer", {
      method: "POST",
      body: JSON.stringify({ action: "start", ...data }),
    });
  }

  // Goals
  async getGoals(): Promise<Array<{ id: number; type: string; title: string; isCompleted: boolean }>> {
    return this.fetch("/api/goals");
  }

  // AI Briefing
  async getBriefing(): Promise<{ briefing: string; cached: boolean }> {
    return this.fetch("/api/ai/briefing");
  }

  // Mentor
  async sendMentorMessage(message: string): Promise<{ response: string }> {
    return this.fetch("/api/mentor", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  // Device Data (agent integration)
  async pushDeviceData(data: { dataType: string; value: string; date: string }): Promise<{ success: boolean }> {
    return this.fetch("/api/device-data", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Agent Runs
  async getAgentRuns(limit?: number): Promise<AgentRun[]> {
    const query = limit ? `?limit=${limit}` : "";
    return this.fetch(`/api/agent-runs${query}`);
  }

  // Agent Config
  async getAgentConfigs(): Promise<AgentConfig[]> {
    return this.fetch("/api/agent-config");
  }

  async updateAgentConfig(agentName: string, data: { enabled?: boolean; config?: string }): Promise<{ success: boolean }> {
    return this.fetch("/api/agent-config", {
      method: "PUT",
      body: JSON.stringify({ agentName, ...data }),
    });
  }

  // Penalties
  async createPenalty(data: { questTitle: string; goldLost: number; reason: string; description: string }): Promise<{ success: boolean }> {
    return this.fetch("/api/penalties", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getAnalytics(): Promise<{ snapshots: Array<{ date: string; xpEarned: number; questsCompleted: number }> }> {
    return this.fetch("/api/analytics");
  }

  // Achievements
  async checkAchievements(): Promise<{ unlocked: Array<{ name: string; rarity: string }> }> {
    return this.fetch("/api/achievements/check", { method: "POST" });
  }
}
