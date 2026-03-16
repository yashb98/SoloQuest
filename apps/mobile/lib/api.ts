/**
 * API client for SoloQuest — talks to Next.js web API + Python agent backend.
 */

const WEB_API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const AGENT_API_URL = process.env.EXPO_PUBLIC_AGENT_URL || "http://localhost:8000";
const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN || "";

async function request<T>(base: string, path: string, options: RequestInit = {}): Promise<T> {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${path} — ${text}`);
  }

  return res.json();
}

function web<T>(path: string, options?: RequestInit) {
  return request<T>(WEB_API_URL, path, options);
}

function agent<T>(path: string, options?: RequestInit) {
  return request<T>(AGENT_API_URL, path, options);
}

// --- Web API (source of truth for DB) ---
export const api = {
  // Hunter
  getHunter: () => web<any>("/api/hunter"),
  updateHunter: (data: any) => web<any>("/api/hunter", { method: "PUT", body: JSON.stringify(data) }),

  // Quests
  getQuests: () => web<any[]>("/api/quests"),
  completeQuest: (id: number) => web<any>(`/api/quests/${id}/complete`, { method: "POST" }),
  failQuest: (id: number) => web<any>(`/api/quests/${id}/fail`, { method: "POST" }),

  // Todos
  getTodos: (date: string) => web<any>(`/api/todos?date=${date}`),
  createTodo: (data: any) => web<any>("/api/todos", { method: "POST", body: JSON.stringify(data) }),
  completeTodo: (id: number) => web<any>(`/api/todos/${id}/complete`, { method: "POST" }),
  deleteTodo: (id: number) => web<any>(`/api/todos/${id}`, { method: "DELETE" }),

  // Quest/Todo progress
  updateQuestProgress: (questId: number, progressCurrent: number, progressTarget?: number, progressUnit?: string) =>
    web<any>("/api/quests/progress", {
      method: "POST",
      body: JSON.stringify({ questId, progressCurrent, progressTarget, progressUnit }),
    }),
  updateTodoProgress: (todoId: number, progressCurrent: number, progressTarget?: number, progressUnit?: string) =>
    web<any>("/api/todos/progress", {
      method: "POST",
      body: JSON.stringify({ todoId, progressCurrent, progressTarget, progressUnit }),
    }),

  // Goals
  getGoals: () => web<any[]>("/api/goals"),

  // Savings
  getSavings: () => web<any>("/api/savings"),

  // Agent configs
  getAgentConfigs: () => web<any[]>("/api/agent-configs"),
  updateAgentConfig: (name: string, data: any) =>
    web<any>(`/api/agent-configs/${name}`, { method: "PUT", body: JSON.stringify(data) }),

  // Agent runs
  getAgentRuns: (limit = 50) => web<any[]>(`/api/agent-runs?limit=${limit}`),
};

// --- Agent API (Python backend) ---
export const agents = {
  status: () => agent<any>("/agents/status"),

  // Device data pushes
  healthSync: (steps: number, sleepHours = 0, date?: string) =>
    agent<any>("/agents/health-sync", {
      method: "POST",
      body: JSON.stringify({ steps, sleepHours, date }),
    }),

  screenTimeUpdate: (totalMinutes: number, appBreakdown: Record<string, number>, date?: string) =>
    agent<any>("/agents/screen-time-update", {
      method: "POST",
      body: JSON.stringify({ totalMinutes, appBreakdown, date }),
    }),

  expenseNotification: (rawText: string, appName: string) =>
    agent<any>("/agents/expense-notification", {
      method: "POST",
      body: JSON.stringify({ rawText, appName, timestamp: new Date().toISOString() }),
    }),

  calendarSync: (events: any[], date?: string) =>
    agent<any>("/agents/calendar-sync", {
      method: "POST",
      body: JSON.stringify({ events, date }),
    }),

  // Scheduled triggers
  morningPlan: () => agent<any>("/agents/morning-plan", { method: "POST" }),
  checkProgress: () => agent<any>("/agents/check-progress", { method: "POST" }),
  eveningWrap: () => agent<any>("/agents/evening-wrap", { method: "POST" }),
  weeklyStrategy: () => agent<any>("/agents/weekly-strategy", { method: "POST" }),
  questOptimization: () => agent<any>("/agents/quest-optimization", { method: "POST" }),
  learningCheck: () => agent<any>("/agents/learning-check", { method: "POST" }),
  streakCheck: () => agent<any>("/agents/streak-check", { method: "POST" }),
  socialCheck: () => agent<any>("/agents/social-check", { method: "POST" }),
  notionSync: () => agent<any>("/agents/notion-sync", { method: "POST" }),

  // Interactive
  dailyFocus: (focus?: string) =>
    agent<any>("/agents/daily-focus", {
      method: "POST",
      body: JSON.stringify({ focus: focus || "" }),
    }),

  // Undo
  undoAction: (runId: number, actionIndex = 0) =>
    agent<any>("/agents/actions/undo", {
      method: "POST",
      body: JSON.stringify({ runId, actionIndex }),
    }),
};
