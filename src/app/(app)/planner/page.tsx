"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Trash2, ChevronLeft, ChevronRight, ArrowRightFromLine, X, CalendarDays } from "lucide-react";

interface TodoItem {
  id: number;
  title: string;
  date: string;
  isCompleted: boolean;
  priority: number;
  category: string;
}

const CATEGORIES = [
  { key: "general", label: "General", color: "bg-gray-100 text-gray-600 border-gray-300" },
  { key: "health", label: "Health", color: "bg-[#DCFCE7] text-[#166534] border-[#22C55E]" },
  { key: "learning", label: "Learning", color: "bg-[#DBEAFE] text-[#1E40AF] border-[#3B82F6]" },
  { key: "jobs", label: "Jobs", color: "bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]" },
  { key: "finance", label: "Finance", color: "bg-[#E0E7FF] text-[#3730A3] border-[#6366F1]" },
  { key: "focus", label: "Focus", color: "bg-[#FCE7F3] text-[#9D174D] border-[#EC4899]" },
  { key: "food", label: "Food", color: "bg-[#FFEDD5] text-[#9A3412] border-[#F97316]" },
  { key: "mental", label: "Mental", color: "bg-[#F3E8FF] text-[#6B21A8] border-[#A855F7]" },
  { key: "agentiq", label: "AI/Tech", color: "bg-[#DBEAFE] text-[#1E40AF] border-[#3B82F6]" },
];

const PRIORITIES = [
  { key: 0, label: "Normal", color: "text-sq-muted" },
  { key: 1, label: "High", color: "text-sq-accent" },
  { key: 2, label: "Critical", color: "text-red-500" },
];

function formatDateLabel(dateStr: string, today: string, tomorrow: string): string {
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export default function PlannerPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [today, setToday] = useState("");
  const [tomorrow, setTomorrow] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [formPriority, setFormPriority] = useState(0);

  const fetchTodos = useCallback(async (date?: string) => {
    const url = date ? `/api/todos?date=${date}` : "/api/todos";
    const res = await fetch(url);
    const data = await res.json();
    setTodos(data.todos);
    if (!selectedDate) setSelectedDate(data.tomorrow);
    setToday(data.today);
    setTomorrow(data.tomorrow);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const refreshForDate = (date: string) => {
    setSelectedDate(date);
    fetchTodos(date);
  };

  const shiftDate = (direction: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + direction);
    const newDate = d.toISOString().split("T")[0];
    refreshForDate(newDate);
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formTitle.trim(),
        date: selectedDate,
        priority: formPriority,
        category: formCategory,
      }),
    });
    setFormTitle("");
    setFormPriority(0);
    setFormCategory("general");
    setShowForm(false);
    fetchTodos(selectedDate);
  };

  const handleToggle = async (todoId: number) => {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", todoId }),
    });
    fetchTodos(selectedDate);
  };

  const handleDelete = async (todoId: number) => {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", todoId }),
    });
    fetchTodos(selectedDate);
  };

  const handleCarryOver = async () => {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "carry_over" }),
    });
    fetchTodos(selectedDate);
  };

  const completedCount = todos.filter((t) => t.isCompleted).length;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-hover rounded-xl w-48" />
        {[1, 2, 3].map((i) => <div key={i} className="sq-panel p-6 h-16" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-baseline gap-4">
          <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">Planner</h1>
          <span className="text-[15px] text-sq-muted font-medium">{completedCount}/{todos.length} done</span>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sq-accent text-white text-[14px] font-semibold hover:bg-sq-accent/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => shiftDate(-1)} className="p-2 rounded-xl hover:bg-sq-hover transition-colors text-sq-muted hover:text-sq-text">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-sq-accent" />
          <span className="text-[18px] font-bold text-sq-text">
            {formatDateLabel(selectedDate, today, tomorrow)}
          </span>
          <span className="text-[14px] text-sq-muted">{selectedDate}</span>
        </div>
        <button onClick={() => shiftDate(1)} className="p-2 rounded-xl hover:bg-sq-hover transition-colors text-sq-muted hover:text-sq-text">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Quick date buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-wrap">
        {[today, tomorrow].map((date) => {
          const isActive = selectedDate === date;
          return (
            <button
              key={date}
              onClick={() => refreshForDate(date)}
              className={`flex-shrink-0 px-[18px] py-2 rounded-full font-semibold text-[14px] transition-all whitespace-nowrap
                ${isActive
                  ? "border-2 border-sq-accent bg-[#FFF3ED] text-sq-accent"
                  : "border-[1.5px] border-[#DDD6CE] bg-white text-sq-subtle hover:border-sq-accent/40"
                }`}
            >
              {formatDateLabel(date, today, tomorrow)}
            </button>
          );
        })}
        {selectedDate !== today && selectedDate !== tomorrow && (
          <button
            className="flex-shrink-0 px-[18px] py-2 rounded-full font-semibold text-[14px] border-2 border-sq-accent bg-[#FFF3ED] text-sq-accent whitespace-nowrap"
          >
            {formatDateLabel(selectedDate, today, tomorrow)}
          </button>
        )}
        <button
          onClick={handleCarryOver}
          className="flex-shrink-0 px-[18px] py-2 rounded-full font-semibold text-[14px] border-[1.5px] border-[#DDD6CE] bg-white text-sq-subtle hover:border-sq-accent/40 transition-all whitespace-nowrap flex items-center gap-1.5"
        >
          <ArrowRightFromLine className="w-3.5 h-3.5" />
          Carry Over
        </button>
      </div>

      {/* Todo List */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {todos.map((todo) => {
            const catConfig = CATEGORIES.find((c) => c.key === todo.category);
            const prioConfig = PRIORITIES.find((p) => p.key === todo.priority);
            return (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className={`sq-panel p-4 flex items-center gap-3 ${todo.isCompleted ? "opacity-50" : ""}`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(todo.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all
                    ${todo.isCompleted
                      ? "border-sq-green bg-sq-green"
                      : todo.priority === 2
                        ? "border-red-400 hover:bg-red-50"
                        : todo.priority === 1
                          ? "border-sq-accent hover:bg-sq-accent/10"
                          : "border-sq-border hover:border-sq-accent/40"
                    }`}
                >
                  {todo.isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[15px] font-medium ${todo.isCompleted ? "line-through text-sq-muted" : "text-sq-text"}`}>
                    {todo.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {catConfig && todo.category !== "general" && (
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${catConfig.color}`}>
                        {catConfig.label}
                      </span>
                    )}
                    {todo.priority > 0 && (
                      <span className={`text-[11px] font-bold ${prioConfig?.color}`}>
                        {prioConfig?.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="p-1.5 rounded-lg text-sq-muted hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {todos.length === 0 && (
          <div className="text-center py-[60px] text-sq-muted text-[15px]">
            No tasks planned for this day. Add some tasks to get started!
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="sq-panel p-6 max-w-md w-full mx-4 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] font-bold text-sq-text">Add Task</h3>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg text-sq-muted hover:text-sq-text hover:bg-sq-hover transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-[13px] font-semibold text-sq-text block mb-1.5">Task Title</label>
                <input
                  type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Review 3 LeetCode problems..."
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="w-full px-4 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text placeholder:text-sq-muted/50 focus:outline-none focus:border-sq-accent"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-semibold text-sq-text block mb-1.5">Category</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text focus:outline-none focus:border-sq-accent"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-sq-text block mb-1.5">Priority</label>
                  <select value={formPriority} onChange={(e) => setFormPriority(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text focus:outline-none focus:border-sq-accent"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-[13px] text-sq-muted">
                Adding to: <span className="font-semibold text-sq-accent">{formatDateLabel(selectedDate, today, tomorrow)}</span> ({selectedDate})
              </p>

              <button onClick={handleCreate} disabled={!formTitle.trim()}
                className="sq-button-gold w-full text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Task
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
