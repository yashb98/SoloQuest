/**
 * Zustand store for todos.
 */
import { create } from "zustand";
import { api } from "../api";

interface TodoState {
  todos: any[];
  loading: boolean;
  error: string | null;
  fetch: (date: string) => Promise<void>;
  create: (data: { title: string; date: string; category?: string; priority?: number }) => Promise<void>;
  complete: (id: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,
  error: null,

  fetch: async (date: string) => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res = await api.getTodos(date);
      const todos = res?.todos || res || [];
      set({ todos, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  create: async (data) => {
    try {
      await api.createTodo(data);
      await get().fetch(data.date);
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  complete: async (id: number) => {
    // Optimistic update
    set((s) => ({
      todos: s.todos.map((t) => (t.id === id ? { ...t, isCompleted: true } : t)),
    }));
    try {
      await api.completeTodo(id);
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  remove: async (id: number) => {
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }));
    try {
      await api.deleteTodo(id);
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));
