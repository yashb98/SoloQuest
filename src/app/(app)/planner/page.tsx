"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus, Check, Trash2, ChevronLeft, ChevronRight, ArrowRightFromLine,
  X, CalendarDays, Pencil, GripVertical, Sparkles, ChevronDown, Save, Loader2,
} from "lucide-react";

interface TodoItem {
  id: number;
  title: string;
  description: string;
  date: string;
  isCompleted: boolean;
  priority: number;
  sortOrder: number;
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
  { key: 0, label: "Normal", color: "text-sq-muted", border: "border-sq-border" },
  { key: 1, label: "High", color: "text-sq-accent", border: "border-sq-accent" },
  { key: 2, label: "Critical", color: "text-red-500", border: "border-red-400" },
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

  // Add task form state
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [formPriority, setFormPriority] = useState(0);
  const [formDescription, setFormDescription] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState(0);
  const [editCategory, setEditCategory] = useState("general");
  const [editSaving, setEditSaving] = useState(false);
  const [editAiGenerating, setEditAiGenerating] = useState(false);

  // Expanded description state
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Dirty tracking for reorder
  const [reorderDirty, setReorderDirty] = useState(false);
  const [reorderSaving, setReorderSaving] = useState(false);

  const editInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  const fetchTodos = useCallback(async (date?: string) => {
    const url = date ? `/api/todos?date=${date}` : "/api/todos";
    const res = await fetch(url);
    const data = await res.json();
    setTodos(data.todos);
    if (!selectedDate) setSelectedDate(data.tomorrow);
    setToday(data.today);
    setTomorrow(data.tomorrow);
    setLoading(false);
    setReorderDirty(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const refreshForDate = (date: string) => {
    setSelectedDate(date);
    setEditingId(null);
    setExpandedId(null);
    fetchTodos(date);
  };

  const shiftDate = (direction: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + direction);
    const newDate = d.toISOString().split("T")[0];
    refreshForDate(newDate);
  };

  // --- AI Generation ---
  const generateAiDescription = async (title: string, category: string): Promise<string> => {
    try {
      const res = await fetch("/api/ai/generate-task-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, type: "todo" }),
      });
      const data = await res.json();
      return data.description || "";
    } catch {
      return "";
    }
  };

  const handleAiGenerate = async () => {
    if (!formTitle.trim()) return;
    setAiGenerating(true);
    const desc = await generateAiDescription(formTitle, formCategory);
    setFormDescription(desc);
    setAiGenerating(false);
  };

  const handleEditAiGenerate = async () => {
    if (!editTitle.trim()) return;
    setEditAiGenerating(true);
    const desc = await generateAiDescription(editTitle, editCategory);
    setEditDescription(desc);
    setEditAiGenerating(false);
  };

  // --- Create ---
  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formTitle.trim(),
        description: formDescription.trim(),
        date: selectedDate,
        priority: formPriority,
        category: formCategory,
      }),
    });
    setFormTitle("");
    setFormPriority(0);
    setFormCategory("general");
    setFormDescription("");
    setSaving(false);
    setShowForm(false);
    fetchTodos(selectedDate);
  };

  // --- Toggle ---
  const handleToggle = async (todoId: number) => {
    // Optimistic update
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId ? { ...t, isCompleted: !t.isCompleted } : t
      )
    );
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", todoId }),
    });
    fetchTodos(selectedDate);
  };

  // --- Delete ---
  const handleDelete = async (todoId: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", todoId }),
    });
    fetchTodos(selectedDate);
  };

  // --- Edit ---
  const startEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setEditPriority(todo.priority);
    setEditCategory(todo.category);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return;
    setEditSaving(true);
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        todoId: editingId,
        title: editTitle.trim(),
        description: editDescription,
        priority: editPriority,
        category: editCategory,
      }),
    });
    setEditSaving(false);
    setEditingId(null);
    fetchTodos(selectedDate);
  };

  // --- Reorder (drag & drop) ---
  const handleReorder = (newOrder: TodoItem[]) => {
    setTodos(newOrder);
    setReorderDirty(true);
  };

  const saveReorder = async () => {
    setReorderSaving(true);
    const items = todos.map((t, i) => ({ id: t.id, sortOrder: i }));
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", items }),
    });
    setReorderSaving(false);
    setReorderDirty(false);
  };

  // --- Carry Over ---
  const handleCarryOver = async () => {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "carry_over" }),
    });
    fetchTodos(selectedDate);
  };

  const completedCount = todos.filter((t) => t.isCompleted).length;
  const incompleteTodos = todos.filter((t) => !t.isCompleted);
  const completedTodos = todos.filter((t) => t.isCompleted);

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

      {/* Quick date buttons + actions */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-wrap">
        {[today, tomorrow].map((date) => {
          const isActive = selectedDate === date;
          return (
            <button key={date} onClick={() => refreshForDate(date)}
              className={`flex-shrink-0 px-[18px] py-2 rounded-full font-semibold text-[14px] transition-all whitespace-nowrap
                ${isActive ? "border-2 border-sq-accent bg-[#FFF3ED] text-sq-accent" : "border-[1.5px] border-[#DDD6CE] bg-white text-sq-subtle hover:border-sq-accent/40"}`}
            >{formatDateLabel(date, today, tomorrow)}</button>
          );
        })}
        {selectedDate !== today && selectedDate !== tomorrow && (
          <button className="flex-shrink-0 px-[18px] py-2 rounded-full font-semibold text-[14px] border-2 border-sq-accent bg-[#FFF3ED] text-sq-accent whitespace-nowrap">
            {formatDateLabel(selectedDate, today, tomorrow)}
          </button>
        )}
        <button onClick={handleCarryOver}
          className="flex-shrink-0 px-[18px] py-2 rounded-full font-semibold text-[14px] border-[1.5px] border-[#DDD6CE] bg-white text-sq-subtle hover:border-sq-accent/40 transition-all whitespace-nowrap flex items-center gap-1.5"
        >
          <ArrowRightFromLine className="w-3.5 h-3.5" /> Carry Over
        </button>
      </div>

      {/* Save Reorder Button - only when dirty */}
      <AnimatePresence>
        {reorderDirty && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex justify-end"
          >
            <button onClick={saveReorder} disabled={reorderSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-sq-accent text-white text-[14px] font-semibold hover:bg-sq-accent/90 transition-colors shadow-md disabled:opacity-50"
            >
              {reorderSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Order
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incomplete Todos - Draggable */}
      {incompleteTodos.length > 0 && (
        <Reorder.Group axis="y" values={incompleteTodos} onReorder={(newOrder) => {
          // Merge reordered incomplete with completed
          handleReorder([...newOrder, ...completedTodos]);
        }}>
          <div className="flex flex-col gap-2">
            {incompleteTodos.map((todo) => (
              <Reorder.Item key={todo.id} value={todo}>
                <TodoItemRow
                  todo={todo}
                  isEditing={editingId === todo.id}
                  isExpanded={expandedId === todo.id}
                  editInputRef={editInputRef}
                  editTitle={editTitle} setEditTitle={setEditTitle}
                  editDescription={editDescription} setEditDescription={setEditDescription}
                  editPriority={editPriority} setEditPriority={setEditPriority}
                  editCategory={editCategory} setEditCategory={setEditCategory}
                  editSaving={editSaving}
                  editAiGenerating={editAiGenerating}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onStartEdit={startEdit}
                  onCancelEdit={cancelEdit}
                  onSaveEdit={saveEdit}
                  onEditAiGenerate={handleEditAiGenerate}
                  onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                />
              </Reorder.Item>
            ))}
          </div>
        </Reorder.Group>
      )}

      {/* Completed Todos - not draggable */}
      {completedTodos.length > 0 && (
        <div className="space-y-2">
          <p className="text-[13px] text-sq-muted font-semibold uppercase tracking-wide">Completed</p>
          {completedTodos.map((todo) => (
            <TodoItemRow
              key={todo.id}
              todo={todo}
              isEditing={false}
              isExpanded={expandedId === todo.id}
              editInputRef={editInputRef}
              editTitle="" setEditTitle={() => {}}
              editDescription="" setEditDescription={() => {}}
              editPriority={0} setEditPriority={() => {}}
              editCategory="general" setEditCategory={() => {}}
              editSaving={false}
              editAiGenerating={false}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onStartEdit={() => {}}
              onCancelEdit={() => {}}
              onSaveEdit={() => {}}
              onEditAiGenerate={() => {}}
              onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
            />
          ))}
        </div>
      )}

      {todos.length === 0 && (
        <div className="text-center py-[60px] text-sq-muted text-[15px]">
          No tasks planned for this day. Add some tasks to get started!
        </div>
      )}

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
              className="sq-panel p-6 max-w-lg w-full mx-4 space-y-5 max-h-[90vh] overflow-y-auto"
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
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleCreate()}
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
                    {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-sq-text block mb-1.5">Priority</label>
                  <select value={formPriority} onChange={(e) => setFormPriority(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text focus:outline-none focus:border-sq-accent"
                  >
                    {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* AI Generate Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-semibold text-sq-text">Description & Steps</label>
                  <button onClick={handleAiGenerate} disabled={!formTitle.trim() || aiGenerating}
                    className="flex items-center gap-1 text-[12px] font-semibold text-sq-accent hover:text-sq-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {aiGenerating ? "Generating..." : "AI Generate"}
                  </button>
                </div>
                <textarea
                  value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Steps, notes, or click 'AI Generate' to auto-fill..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text placeholder:text-sq-muted/50 focus:outline-none focus:border-sq-accent resize-y"
                />
              </div>

              <p className="text-[13px] text-sq-muted">
                Adding to: <span className="font-semibold text-sq-accent">{formatDateLabel(selectedDate, today, tomorrow)}</span> ({selectedDate})
              </p>

              <button onClick={handleCreate} disabled={!formTitle.trim() || saving}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-sq-accent text-white text-[14px] font-bold hover:bg-sq-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Task"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Todo Item Row Component ---
interface TodoItemRowProps {
  todo: TodoItem;
  isEditing: boolean;
  isExpanded: boolean;
  editInputRef: React.RefObject<HTMLInputElement>;
  editTitle: string; setEditTitle: (v: string) => void;
  editDescription: string; setEditDescription: (v: string) => void;
  editPriority: number; setEditPriority: (v: number) => void;
  editCategory: string; setEditCategory: (v: string) => void;
  editSaving: boolean;
  editAiGenerating: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onStartEdit: (todo: TodoItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditAiGenerate: () => void;
  onToggleExpand: (id: number) => void;
}

function TodoItemRow({
  todo, isEditing, isExpanded, editInputRef,
  editTitle, setEditTitle, editDescription, setEditDescription,
  editPriority, setEditPriority, editCategory, setEditCategory,
  editSaving, editAiGenerating,
  onToggle, onDelete, onStartEdit, onCancelEdit, onSaveEdit, onEditAiGenerate, onToggleExpand,
}: TodoItemRowProps) {
  const catConfig = CATEGORIES.find((c) => c.key === todo.category);
  const prioConfig = PRIORITIES.find((p) => p.key === todo.priority);

  // Edit mode
  if (isEditing) {
    return (
      <motion.div layout className="sq-panel p-4 space-y-3 border-2 border-sq-accent/40">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-sq-accent">Editing Task</span>
          <button onClick={onCancelEdit} className="p-1 rounded text-sq-muted hover:text-sq-text"><X className="w-4 h-4" /></button>
        </div>
        <input ref={editInputRef} type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSaveEdit()}
          className="w-full px-3 py-2 rounded-lg border-[1.5px] border-sq-border bg-white text-[14px] text-sq-text focus:outline-none focus:border-sq-accent"
        />
        <div className="grid grid-cols-2 gap-2">
          <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-sq-border bg-white text-[13px] text-sq-text focus:outline-none focus:border-sq-accent"
          >
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <select value={editPriority} onChange={(e) => setEditPriority(Number(e.target.value))}
            className="px-2 py-1.5 rounded-lg border border-sq-border bg-white text-[13px] text-sq-text focus:outline-none focus:border-sq-accent"
          >
            {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-semibold text-sq-text">Description</span>
            <button onClick={onEditAiGenerate} disabled={!editTitle.trim() || editAiGenerating}
              className="flex items-center gap-1 text-[11px] font-semibold text-sq-accent hover:text-sq-accent/80 disabled:opacity-50"
            >
              {editAiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {editAiGenerating ? "Generating..." : "AI Generate"}
            </button>
          </div>
          <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
            rows={4} placeholder="Add steps, notes..."
            className="w-full px-3 py-2 rounded-lg border border-sq-border bg-white text-[13px] text-sq-text focus:outline-none focus:border-sq-accent resize-y"
          />
        </div>
        <button onClick={onSaveEdit} disabled={editSaving || !editTitle.trim()}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-sq-accent text-white text-[13px] font-bold hover:bg-sq-accent/90 disabled:opacity-50"
        >
          {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {editSaving ? "Saving..." : "Save Changes"}
        </button>
      </motion.div>
    );
  }

  // Normal display
  return (
    <motion.div layout className={`sq-panel p-4 ${todo.isCompleted ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3">
        {/* Drag handle - only for incomplete */}
        {!todo.isCompleted && (
          <div className="cursor-grab active:cursor-grabbing text-sq-muted/40 hover:text-sq-muted mt-0.5 flex-shrink-0">
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* Checkbox */}
        <button onClick={() => onToggle(todo.id)}
          className={`w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all mt-0.5
            ${todo.isCompleted ? "border-sq-green bg-sq-green"
              : todo.priority === 2 ? "border-red-400 hover:bg-red-50"
              : todo.priority === 1 ? "border-sq-accent hover:bg-sq-accent/10"
              : "border-sq-border hover:border-sq-accent/40"}`}
        >
          {todo.isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-[15px] font-medium ${todo.isCompleted ? "line-through text-sq-muted" : "text-sq-text"}`}>
            {todo.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
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
            {/* Show expand chevron if description exists */}
            {todo.description && (
              <button onClick={() => onToggleExpand(todo.id)}
                className="flex items-center gap-0.5 text-[11px] text-sq-accent font-medium hover:text-sq-accent/70 transition-colors"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                {isExpanded ? "Hide" : "Details"}
              </button>
            )}
          </div>

          {/* Expanded description */}
          <AnimatePresence>
            {isExpanded && todo.description && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 rounded-lg bg-sq-hover/50 border border-sq-border/50"
              >
                <pre className="text-[13px] text-sq-text whitespace-pre-wrap font-sans leading-relaxed">
                  {todo.description}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        {!todo.isCompleted && (
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onStartEdit(todo)}
              className="p-1.5 rounded-lg text-sq-muted hover:text-sq-accent hover:bg-sq-accent/10 transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(todo.id)}
              className="p-1.5 rounded-lg text-sq-muted hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        {todo.isCompleted && (
          <button onClick={() => onDelete(todo.id)}
            className="p-1.5 rounded-lg text-sq-muted hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
