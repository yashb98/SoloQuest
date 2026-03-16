"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, Target, Zap, ChevronRight, RefreshCw, X, Check, Loader2,
  Upload, FileText, FileImage, ChevronDown, ChevronUp, ExternalLink,
  Plus, CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { useHunter } from "@/contexts/HunterContext";

// ─── Types ───

interface Milestone {
  id: number;
  weekNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

interface ProgressData {
  quests: { completed: number; total: number };
  dungeons: { completed: number; total: number };
  certs: { passed: number; total: number };
  goals: { completed: number; total: number };
  chains: { completed: number; total: number };
  habits: { total: number };
}

interface Roadmap {
  id: number;
  targetRole: string;
  experienceLevel: string;
  skills: string;
  timeline: string;
  summary: string;
  isActive: boolean;
}

interface RoadmapPageData {
  roadmap: Roadmap | null;
  progress: ProgressData | null;
  milestones: Milestone[];
}

interface ExtractedTopic {
  section: string;
  title: string;
  description: string;
  priority: "core" | "recommended" | "optional";
  estimatedHours: number;
  prerequisites?: string[];
  youtubeQuery: string;
  blogUrl: string;
}

interface ExtractedData {
  title: string;
  topics: ExtractedTopic[];
  suggestedWeeks: number;
  suggestedHoursPerWeek: number;
}

// ─── Constants ───

const QUICK_ROLES = [
  "ML Engineer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Data Engineer",
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", icon: "🌱", desc: "Starting out" },
  { value: "intermediate", label: "Intermediate", icon: "⚡", desc: "Some experience" },
  { value: "senior", label: "Senior", icon: "🏆", desc: "Advanced level" },
];

const TIMELINES = [
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
];

const PROGRESS_CARDS = [
  { key: "quests", icon: "⚔️", label: "Quests", type: "fraction" as const },
  { key: "dungeons", icon: "🏰", label: "Dungeons", type: "fraction" as const },
  { key: "certs", icon: "📜", label: "Certs", type: "fraction" as const },
  { key: "goals", icon: "🎯", label: "Goals", type: "fraction" as const },
  { key: "chains", icon: "🔗", label: "Chains", type: "fraction" as const },
  { key: "habits", icon: "🔄", label: "Habits", type: "total" as const },
];

const QUICK_LINKS = [
  { href: "/quests", label: "Quests", color: "text-sq-accent bg-sq-accent/10 border-sq-accent/20" },
  { href: "/dungeons", label: "Dungeons", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  { href: "/certs", label: "Certs", color: "text-sq-blue bg-sq-blue/10 border-sq-blue/20" },
  { href: "/goals", label: "Goals", color: "text-sq-green bg-sq-green/10 border-sq-green/20" },
  { href: "/chains", label: "Chains", color: "text-sq-purple bg-sq-purple/10 border-sq-purple/20" },
  { href: "/planner", label: "Planner", color: "text-sq-gold bg-sq-gold/10 border-sq-gold/20" },
];

const PRIORITY_COLORS = {
  core: "bg-red-500/10 text-red-400 border-red-500/20",
  recommended: "bg-sq-blue/10 text-sq-blue border-sq-blue/20",
  optional: "bg-sq-muted/10 text-sq-muted border-sq-muted/20",
};

// ─── Main Component ───

export default function RoadmapPage() {
  const { addToast } = useHunter();
  const [pageData, setPageData] = useState<RoadmapPageData>({
    roadmap: null,
    progress: null,
    milestones: [],
  });
  const [loading, setLoading] = useState(true);

  // Setup mode: "scratch" (existing form) or "upload" (new upload)
  const [setupMode, setSetupMode] = useState<"scratch" | "upload">("scratch");

  // Scratch form state
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [timeline, setTimeline] = useState("6m");
  const [generating, setGenerating] = useState(false);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadHint, setUploadHint] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<Set<number>>(new Set());
  const [editedTitle, setEditedTitle] = useState("");
  const [uploadWeeks, setUploadWeeks] = useState(12);
  const [uploadHours, setUploadHours] = useState(10);
  const [creatingFromUpload, setCreatingFromUpload] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dashboard action states
  const [regenerating, setRegenerating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const fetchRoadmapData = useCallback(async () => {
    try {
      const res = await fetch("/api/roadmap/progress");
      if (res.ok) {
        const data = await res.json();
        setPageData({
          roadmap: data.roadmap || null,
          progress: data.progress || null,
          milestones: data.milestones || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch roadmap data:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRoadmapData();
  }, [fetchRoadmapData]);

  // ─── Scratch Form Handlers ───

  const addSkill = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const handleGenerate = async () => {
    if (!targetRole.trim()) return;
    setGenerating(true);

    try {
      const createRes = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          targetRole: targetRole.trim(),
          experienceLevel,
          skills: JSON.stringify(skills),
          timeline,
        }),
      });
      const createData = await createRes.json();

      if (!createData.roadmap?.id) {
        throw new Error("Failed to create roadmap");
      }

      await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmapId: createData.roadmap.id }),
      });

      await fetchRoadmapData();
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
    }

    setGenerating(false);
  };

  // ─── Upload Handlers ───

  const handleFileSelect = (file: File) => {
    const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setExtractError("Unsupported file type. Use PNG, JPG, WebP, or PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setExtractError("File too large. Maximum size is 10MB.");
      return;
    }

    setUploadFile(file);
    setExtractError(null);
    setExtractedData(null);

    // Generate preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleExtract = async () => {
    if (!uploadFile) return;
    setExtracting(true);
    setExtractError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      if (uploadHint) formData.append("hint", uploadHint);

      const res = await fetch("/api/roadmap/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Extraction failed");
      }

      setExtractedData(data.data);
      setEditedTitle(data.data.title || "Uploaded Roadmap");
      setUploadWeeks(data.data.suggestedWeeks || 12);
      setUploadHours(data.data.suggestedHoursPerWeek || 10);

      // Select all topics by default
      const allIndices = new Set<number>();
      data.data.topics.forEach((_: ExtractedTopic, i: number) => allIndices.add(i));
      setSelectedTopics(allIndices);

      // Expand all sections
      const sections = new Set<string>();
      data.data.topics.forEach((t: ExtractedTopic) => sections.add(t.section));
      setExpandedSections(sections);
    } catch (err) {
      setExtractError((err as Error).message);
    }

    setExtracting(false);
  };

  const toggleTopic = (idx: number) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const getSelectedTopics = (): ExtractedTopic[] => {
    if (!extractedData) return [];
    return extractedData.topics.filter((_, i) => selectedTopics.has(i));
  };

  const handleCreateTodosOnly = async () => {
    const topics = getSelectedTopics();
    if (topics.length === 0) return;
    setCreatingFromUpload(true);

    try {
      const res = await fetch("/api/roadmap/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_todos",
          topics,
          timeline: uploadWeeks,
          hoursPerWeek: uploadHours,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExtractedData(null);
        setUploadFile(null);
        setUploadPreview(null);
        addToast({ type: "info", title: "Topics Added", description: `${data.todosCreated} topics added to your planner!` });
      }
    } catch (err) {
      console.error("Failed to create todos:", err);
    }

    setCreatingFromUpload(false);
  };

  const handleCreateFullRoadmap = async () => {
    const topics = getSelectedTopics();
    if (topics.length === 0) return;
    setCreatingFromUpload(true);

    try {
      const res = await fetch("/api/roadmap/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_roadmap_and_todos",
          title: editedTitle,
          topics,
          timeline: uploadWeeks,
          hoursPerWeek: uploadHours,
          experienceLevel: "beginner",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExtractedData(null);
        setUploadFile(null);
        setUploadPreview(null);
        await fetchRoadmapData();
      }
    } catch (err) {
      console.error("Failed to create roadmap:", err);
    }

    setCreatingFromUpload(false);
  };

  // ─── Dashboard Handlers ───

  const handleRegenerate = async () => {
    if (!pageData.roadmap) return;
    setRegenerating(true);

    try {
      await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmapId: pageData.roadmap.id, regenerate: true }),
      });
      await fetchRoadmapData();
    } catch (err) {
      console.error("Failed to regenerate roadmap:", err);
    }

    setRegenerating(false);
  };

  const handleDeactivate = async () => {
    if (!pageData.roadmap) return;
    setDeactivating(true);

    try {
      await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deactivate", roadmapId: pageData.roadmap.id }),
      });
      setPageData({ roadmap: null, progress: null, milestones: [] });
    } catch (err) {
      console.error("Failed to deactivate roadmap:", err);
    }

    setDeactivating(false);
  };

  // ─── Loading State ───

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-hover rounded-xl w-48" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="sq-panel p-6 h-32" />
        ))}
      </div>
    );
  }

  // ─── STATE 2: Active Roadmap Dashboard ───

  if (pageData.roadmap) {
    const roadmap = pageData.roadmap;
    const progress = pageData.progress;
    const milestones = pageData.milestones;

    const totalItems =
      (progress?.quests.total ?? 0) +
      (progress?.dungeons.total ?? 0) +
      (progress?.certs.total ?? 0) +
      (progress?.goals.total ?? 0) +
      (progress?.chains.total ?? 0);
    const completedItems =
      (progress?.quests.completed ?? 0) +
      (progress?.dungeons.completed ?? 0) +
      (progress?.certs.passed ?? 0) +
      (progress?.goals.completed ?? 0) +
      (progress?.chains.completed ?? 0);
    const overallPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const timelineLabel = TIMELINES.find((t) => t.value === roadmap.timeline)?.label ?? roadmap.timeline;

    return (
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sq-panel p-6"
        >
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Map className="w-5 h-5 text-sq-accent flex-shrink-0" />
                <h1 className="text-[28px] font-bold text-sq-text tracking-[-0.03em] truncate">
                  {roadmap.targetRole}
                </h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sq-accent/10 text-sq-accent uppercase tracking-wider">
                  {roadmap.experienceLevel}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sq-blue/10 text-sq-blue uppercase tracking-wider">
                  {timelineLabel}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[32px] font-bold text-sq-accent">{overallPct}%</span>
              <p className="text-[12px] text-sq-muted font-medium">Overall Progress</p>
            </div>
          </div>

          <div className="h-2 bg-sq-hover rounded-full overflow-hidden mt-4">
            <motion.div
              className="h-full bg-gradient-to-r from-sq-accent to-sq-accent-light rounded-full"
              initial={false}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Summary */}
        {roadmap.summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="sq-panel p-5"
          >
            <p className="text-[14px] text-sq-text leading-relaxed">{roadmap.summary}</p>
          </motion.div>
        )}

        {/* Milestones Timeline */}
        {milestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="sq-panel p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-sq-accent" />
              <span className="text-[14px] font-bold text-sq-text">Milestones</span>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-sq-border" />

              <div className="space-y-5">
                {milestones.map((milestone, idx) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className="relative"
                  >
                    <div
                      className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
                        milestone.isCompleted
                          ? "bg-sq-green text-white"
                          : "bg-sq-panel border-2 border-sq-border"
                      }`}
                    >
                      {milestone.isCompleted ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-[10px] font-bold text-sq-muted">
                          {milestone.weekNumber}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-sq-muted uppercase tracking-wider">
                          Week {milestone.weekNumber}
                        </span>
                        {milestone.isCompleted && (
                          <span className="text-[10px] bg-sq-green/20 text-sq-green px-1.5 py-0.5 rounded-full font-bold">
                            DONE
                          </span>
                        )}
                      </div>
                      <h4
                        className={`text-[15px] font-semibold ${
                          milestone.isCompleted ? "text-sq-muted line-through" : "text-sq-text"
                        }`}
                      >
                        {milestone.title}
                      </h4>
                      {milestone.description && (
                        <p className="text-[13px] text-sq-muted mt-0.5 leading-relaxed">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Grid */}
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-sq-accent" />
              <span className="text-[14px] font-bold text-sq-text">Progress Breakdown</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROGRESS_CARDS.map((card) => {
                const data =
                  card.key === "quests"
                    ? progress.quests
                    : card.key === "dungeons"
                    ? progress.dungeons
                    : card.key === "certs"
                    ? progress.certs
                    : card.key === "goals"
                    ? progress.goals
                    : card.key === "chains"
                    ? progress.chains
                    : null;

                const habitsTotal = progress.habits?.total ?? 0;

                return (
                  <div key={card.key} className="sq-panel p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[18px]">{card.icon}</span>
                      <span className="text-[12px] font-semibold text-sq-muted uppercase tracking-wider">
                        {card.label}
                      </span>
                    </div>
                    {card.type === "fraction" && data ? (
                      <span className="text-[22px] font-bold text-sq-text">
                        {card.key === "certs"
                          ? (data as { passed: number; total: number }).passed
                          : (data as { completed: number; total: number }).completed}
                        <span className="text-[14px] text-sq-muted font-medium">
                          /{data.total}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[22px] font-bold text-sq-text">{habitsTotal}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ChevronRight className="w-4 h-4 text-sq-accent" />
            <span className="text-[14px] font-bold text-sq-text">Quick Links</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors flex-shrink-0 hover:opacity-80 ${link.color}`}
              >
                {link.label}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-3 flex-wrap"
        >
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="sq-button-blue flex items-center gap-2 text-[14px] disabled:opacity-50"
          >
            {regenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {regenerating ? "Regenerating..." : "Regenerate"}
          </button>

          <button
            onClick={handleDeactivate}
            disabled={deactivating}
            className="sq-button-outline flex items-center gap-2 text-[14px] disabled:opacity-50 hover:border-red-400 hover:text-red-500"
          >
            {deactivating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            {deactivating ? "Deactivating..." : "Deactivate"}
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── STATE 1: No Active Roadmap → Setup Form ───

  // Group extracted topics by section for display
  const topicsBySection: Record<string, { topic: ExtractedTopic; idx: number }[]> = {};
  if (extractedData) {
    extractedData.topics.forEach((topic, idx) => {
      const section = topic.section || "General";
      if (!topicsBySection[section]) topicsBySection[section] = [];
      topicsBySection[section].push({ topic, idx });
    });
  }

  const totalSelectedHours = getSelectedTopics().reduce((sum, t) => sum + t.estimatedHours, 0);

  return (
    <div className="space-y-6">
      {/* Generating / Extracting overlay */}
      <AnimatePresence>
        {(generating || extracting) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="sq-panel p-8 text-center max-w-sm mx-4"
            >
              <Loader2 className="w-10 h-10 text-sq-accent animate-spin mx-auto mb-4" />
              <h3 className="text-[18px] font-bold text-sq-text mb-2">
                {extracting ? "Reading Your Roadmap" : "Building Your Roadmap"}
              </h3>
              <p className="text-[14px] text-sq-muted">
                {extracting
                  ? "AI is analyzing your roadmap and extracting topics..."
                  : "Generating your personalized roadmap..."}
              </p>
              <div className="mt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-3 bg-sq-hover rounded-full animate-pulse" />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Map className="w-7 h-7 text-sq-accent" />
        <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">Career Roadmap</h1>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="flex gap-1 p-1 bg-sq-bg rounded-xl border border-sq-border"
      >
        <button
          onClick={() => setSetupMode("scratch")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
            setupMode === "scratch"
              ? "bg-sq-accent/10 text-sq-accent"
              : "text-sq-muted hover:text-sq-text"
          }`}
        >
          <Zap className="w-4 h-4" />
          Build from Scratch
        </button>
        <button
          onClick={() => setSetupMode("upload")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
            setupMode === "upload"
              ? "bg-sq-accent/10 text-sq-accent"
              : "text-sq-muted hover:text-sq-text"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Roadmap
        </button>
      </motion.div>

      {/* ─── SCRATCH MODE ─── */}
      {setupMode === "scratch" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="sq-panel p-6 space-y-6"
        >
          {/* Target Role */}
          <div>
            <label className="text-[13px] font-semibold text-sq-text block mb-1.5">
              Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. ML Engineer"
              className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono w-full focus:outline-none focus:border-sq-accent transition-colors"
            />

            <div className="flex flex-wrap gap-2 mt-3">
              {QUICK_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setTargetRole(role)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                    targetRole === role
                      ? "bg-sq-accent text-white"
                      : "bg-sq-hover text-sq-subtle hover:text-sq-text hover:border-sq-accent/40 border border-sq-border"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="text-[13px] font-semibold text-sq-text block mb-2">
              Experience Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setExperienceLevel(level.value)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    experienceLevel === level.value
                      ? "border-sq-accent bg-sq-accent/5"
                      : "border-sq-border bg-sq-panel hover:border-sq-accent/40"
                  }`}
                >
                  <span className="text-[24px] block mb-1">{level.icon}</span>
                  <span
                    className={`text-[13px] font-bold block ${
                      experienceLevel === level.value ? "text-sq-accent" : "text-sq-text"
                    }`}
                  >
                    {level.label}
                  </span>
                  <span className="text-[11px] text-sq-muted">{level.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="text-[13px] font-semibold text-sq-text block mb-1.5">
              Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter..."
                className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono flex-1 focus:outline-none focus:border-sq-accent transition-colors"
              />
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                <AnimatePresence>
                  {skills.map((skill) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sq-accent/10 text-sq-accent text-[12px] font-semibold"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-0.5 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <label className="text-[13px] font-semibold text-sq-text block mb-2">
              Timeline
            </label>
            <div className="flex gap-3">
              {TIMELINES.map((t) => (
                <label
                  key={t.value}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    timeline === t.value
                      ? "border-sq-accent bg-sq-accent/5 text-sq-accent"
                      : "border-sq-border bg-sq-panel text-sq-subtle hover:border-sq-accent/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="timeline"
                    value={t.value}
                    checked={timeline === t.value}
                    onChange={() => setTimeline(t.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      timeline === t.value ? "border-sq-accent" : "border-sq-border"
                    }`}
                  >
                    {timeline === t.value && (
                      <div className="w-2 h-2 rounded-full bg-sq-accent" />
                    )}
                  </div>
                  <span className="text-[13px] font-semibold">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!targetRole.trim() || generating}
            className="sq-button-gold w-full text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {generating ? "Generating..." : "Generate Roadmap"}
          </button>
        </motion.div>
      )}

      {/* ─── UPLOAD MODE ─── */}
      {setupMode === "upload" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          {/* Upload Panel */}
          <div className="sq-panel p-6 space-y-5">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-sq-accent bg-sq-accent/5"
                  : uploadFile
                  ? "border-sq-blue/40 bg-sq-blue/5"
                  : "border-sq-border hover:border-sq-accent/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />

              {uploadFile ? (
                <div className="space-y-3">
                  {uploadPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={uploadPreview}
                      alt="Roadmap preview"
                      className="max-h-40 mx-auto rounded-lg border border-sq-border"
                    />
                  ) : (
                    <FileText className="w-12 h-12 text-sq-blue mx-auto" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-sq-text">{uploadFile.name}</p>
                    <p className="text-[11px] text-sq-muted">
                      {(uploadFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadFile(null);
                      setUploadPreview(null);
                      setExtractedData(null);
                      setExtractError(null);
                    }}
                    className="text-[11px] text-sq-muted hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3 inline mr-1" /> Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-full bg-sq-hover flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-sq-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-sq-text">
                      Drag & drop a roadmap image or PDF
                    </p>
                    <p className="text-[11px] text-sq-muted mt-1">
                      PNG, JPG, WebP, or PDF — Max 10MB
                    </p>
                  </div>
                  <div className="flex items-center gap-3 justify-center text-[11px] text-sq-muted">
                    <span className="flex items-center gap-1">
                      <FileImage className="w-3 h-3" /> Images
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> PDFs
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Context Hint */}
            <div>
              <label className="text-[13px] font-semibold text-sq-text block mb-1.5">
                What role is this roadmap for? <span className="text-sq-muted font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={uploadHint}
                onChange={(e) => setUploadHint(e.target.value)}
                placeholder="e.g. Frontend Developer, Data Science..."
                className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono w-full focus:outline-none focus:border-sq-accent transition-colors"
              />
            </div>

            {/* Error */}
            {extractError && (
              <div className="px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">{extractError}</p>
              </div>
            )}

            {/* Extract Button */}
            {!extractedData && (
              <button
                onClick={handleExtract}
                disabled={!uploadFile || extracting}
                className="sq-button-blue w-full text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {extracting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {extracting ? "Extracting..." : "Extract Topics"}
              </button>
            )}
          </div>

          {/* ─── Extracted Topics Review ─── */}
          {extractedData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Editable Title */}
              <div className="sq-panel p-4">
                <label className="text-[13px] font-semibold text-sq-text block mb-1.5">
                  Roadmap Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono w-full focus:outline-none focus:border-sq-accent transition-colors"
                />
              </div>

              {/* Summary Bar */}
              <div className="sq-panel p-4">
                <div className="flex items-center gap-4 flex-wrap text-[13px]">
                  <span className="text-sq-text font-semibold">
                    {selectedTopics.size} <span className="text-sq-muted font-normal">topics selected</span>
                  </span>
                  <span className="text-sq-text font-semibold">
                    ~{totalSelectedHours} <span className="text-sq-muted font-normal">hours</span>
                  </span>
                  <span className="text-sq-text font-semibold">
                    ~{uploadWeeks} <span className="text-sq-muted font-normal">weeks</span>
                  </span>
                </div>

                {/* Timeline Overrides */}
                <div className="flex gap-3 mt-3">
                  <div className="flex-1">
                    <label className="text-[11px] text-sq-muted block mb-1">
                      <CalendarDays className="w-3 h-3 inline mr-1" /> Weeks
                    </label>
                    <input
                      type="number"
                      value={uploadWeeks}
                      onChange={(e) => setUploadWeeks(parseInt(e.target.value) || 1)}
                      min={1}
                      max={104}
                      className="bg-sq-bg border border-sq-border rounded-md px-3 py-1.5 text-sm text-sq-text font-mono w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] text-sq-muted block mb-1">
                      ⏱️ Hours/week
                    </label>
                    <input
                      type="number"
                      value={uploadHours}
                      onChange={(e) => setUploadHours(parseInt(e.target.value) || 1)}
                      min={1}
                      max={80}
                      className="bg-sq-bg border border-sq-border rounded-md px-3 py-1.5 text-sm text-sq-text font-mono w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Topics by Section */}
              <div className="space-y-3">
                {Object.entries(topicsBySection).map(([section, items]) => {
                  const isExpanded = expandedSections.has(section);
                  const selectedInSection = items.filter((i) => selectedTopics.has(i.idx)).length;

                  return (
                    <div key={section} className="sq-panel overflow-hidden">
                      <button
                        onClick={() => toggleSection(section)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-sq-hover/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-sq-text">{section}</span>
                          <span className="text-[11px] text-sq-muted">
                            {selectedInSection}/{items.length} selected
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-sq-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-sq-muted" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-3 space-y-2">
                              {items.map(({ topic, idx }) => {
                                const isSelected = selectedTopics.has(idx);

                                return (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-lg border transition-all ${
                                      isSelected
                                        ? "border-sq-blue/30 bg-sq-bg"
                                        : "border-sq-border bg-sq-bg/50 opacity-60"
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      {/* Checkbox */}
                                      <button
                                        onClick={() => toggleTopic(idx)}
                                        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                          isSelected
                                            ? "border-sq-blue bg-sq-blue text-white"
                                            : "border-sq-border hover:border-sq-blue/50"
                                        }`}
                                      >
                                        {isSelected && <Check className="w-3 h-3" />}
                                      </button>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                          <span className="text-[13px] font-bold text-sq-text">{topic.title}</span>
                                          <span
                                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${
                                              PRIORITY_COLORS[topic.priority]
                                            }`}
                                          >
                                            {topic.priority}
                                          </span>
                                          <span className="text-[10px] text-sq-muted">
                                            ~{topic.estimatedHours}h
                                          </span>
                                        </div>

                                        <p className="text-[12px] text-sq-muted leading-relaxed">
                                          {topic.description}
                                        </p>

                                        {/* Resource Links */}
                                        <div className="flex items-center gap-3 mt-2">
                                          <a
                                            href={`https://youtube.com/results?search_query=${encodeURIComponent(topic.youtubeQuery || topic.title)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <ExternalLink className="w-3 h-3" /> YouTube
                                          </a>
                                          {topic.blogUrl && topic.blogUrl.startsWith("http") && (
                                            <a
                                              href={topic.blogUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-1 text-[10px] text-sq-blue hover:text-sq-blue/80 transition-colors"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <ExternalLink className="w-3 h-3" /> Blog
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCreateTodosOnly}
                  disabled={selectedTopics.size === 0 || creatingFromUpload}
                  className="sq-button-blue flex-1 text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingFromUpload ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add to Planner
                </button>

                <button
                  onClick={handleCreateFullRoadmap}
                  disabled={selectedTopics.size === 0 || creatingFromUpload}
                  className="sq-button-gold flex-1 text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingFromUpload ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Map className="w-4 h-4" />
                  )}
                  Create Full Roadmap
                </button>
              </div>

              {/* Re-extract */}
              <button
                onClick={() => {
                  setExtractedData(null);
                  setExtractError(null);
                }}
                className="text-[12px] text-sq-muted hover:text-sq-text transition-colors text-center w-full"
              >
                <RefreshCw className="w-3 h-3 inline mr-1" /> Re-extract topics
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
