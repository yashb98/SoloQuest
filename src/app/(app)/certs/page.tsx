"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Plus,
  Check,
  Trophy,
  X,
  BookOpen,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
  Undo2,
  Sparkles,
  Pause,
  Play,
  Trash2,
} from "lucide-react";

interface StudyTopic {
  title: string;
  description: string;
  youtubeQuery: string;
  blogUrl: string;
  isCompleted?: boolean;
}

interface StudyWeek {
  week: number;
  title: string;
  topics: StudyTopic[];
}

interface StudyPlanData {
  weeks: StudyWeek[];
}

interface CertRoadmap {
  id: number;
  certName: string;
  provider: string;
  totalWeeks: number;
  currentWeek: number;
  weeklyHours: number;
  goldBonus: number;
  targetExamDate: string | null;
  isPassed: boolean;
  passedAt: string | null;
  studyPlan: string;
  isStarted: boolean;
  startDate: string;
}

const PRESETS = [
  { certName: "AWS Solutions Architect Associate", provider: "Amazon", totalWeeks: 10, weeklyHours: 12, goldBonus: 2000 },
  { certName: "AWS Machine Learning Specialty", provider: "Amazon", totalWeeks: 12, weeklyHours: 15, goldBonus: 2500 },
  { certName: "Google Professional Data Engineer", provider: "Google", totalWeeks: 10, weeklyHours: 12, goldBonus: 2000 },
  { certName: "Azure AI Engineer Associate", provider: "Microsoft", totalWeeks: 9, weeklyHours: 11, goldBonus: 2000 },
  { certName: "Kubernetes (CKA/CKAD)", provider: "CNCF", totalWeeks: 8, weeklyHours: 12, goldBonus: 2000 },
  { certName: "Terraform Associate", provider: "HashiCorp", totalWeeks: 5, weeklyHours: 7, goldBonus: 1200 },
  { certName: "LangChain Certified Developer", provider: "LangChain", totalWeeks: 5, weeklyHours: 8, goldBonus: 1500 },
];

function parseStudyPlan(raw: string): StudyPlanData | null {
  if (!raw || raw === "[]" || raw === "null" || raw === "{}") return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.weeks && Array.isArray(parsed.weeks) && parsed.weeks.length > 0) {
      return parsed as StudyPlanData;
    }
    return null;
  } catch {
    return null;
  }
}

export default function CertsPage() {
  const [certs, setCerts] = useState<CertRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formCert, setFormCert] = useState("");
  const [formProvider, setFormProvider] = useState("");
  const [formWeeks, setFormWeeks] = useState("8");
  const [formDate, setFormDate] = useState("");

  // AI timeline suggestion loading state
  const [aiTimelineLoading, setAiTimelineLoading] = useState(false);

  // Study plan visibility per cert
  const [expandedPlans, setExpandedPlans] = useState<Record<number, boolean>>({});
  // Expanded weeks within a study plan
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  // Study plan generation loading per cert
  const [generatingPlan, setGeneratingPlan] = useState<Record<number, boolean>>({});
  // Add to planner loading per cert
  const [addingTodos, setAddingTodos] = useState<Record<number, boolean>>({});
  // Add to planner success message per cert
  const [todoSuccess, setTodoSuccess] = useState<Record<number, number | null>>({});

  const fetchCerts = useCallback(async () => {
    const res = await fetch("/api/certs");
    setCerts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCerts(); }, [fetchCerts]);

  const handleCreate = async (preset?: typeof PRESETS[0]) => {
    const data = preset || { certName: formCert, provider: formProvider, totalWeeks: parseInt(formWeeks) };
    if (!data.certName) return;
    const res = await fetch("/api/certs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        ...data,
        targetExamDate: formDate || undefined,
      }),
    });
    const newCert = await res.json();
    setFormCert(""); setFormProvider(""); setShowForm(false);
    fetchCerts();

    // Auto-generate study plan in the background
    const certId = newCert?.cert?.id || newCert?.id;
    if (certId) {
      fetch("/api/certs/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", certId }),
      }).then(() => fetchCerts());
    }
  };

  const handleAdvance = async (certId: number) => {
    await fetch("/api/certs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "advance_week", certId }),
    });
    fetchCerts();
  };

  const handleRevertWeek = async (certId: number) => {
    await fetch("/api/certs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revert_week", certId }),
    });
    fetchCerts();
  };

  const handlePass = async (certId: number) => {
    await fetch("/api/certs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pass", certId }),
    });
    fetchCerts();
  };

  const handlePause = async (certId: number) => {
    await fetch("/api/certs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pause", certId }),
    });
    fetchCerts();
  };

  const handleResume = async (certId: number) => {
    await fetch("/api/certs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resume", certId }),
    });
    fetchCerts();
  };

  const handleDelete = async (certId: number) => {
    const confirmed = window.confirm("Permanently delete this certification and its study plan?");
    if (!confirmed) return;
    await fetch("/api/certs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", certId }),
    });
    fetchCerts();
  };

  const handleAiTimeline = async () => {
    if (!formCert) return;
    setAiTimelineLoading(true);
    try {
      const res = await fetch("/api/certs/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest_timeline",
          certName: formCert,
          provider: formProvider,
        }),
      });
      const data = await res.json();
      if (data && data.totalWeeks) {
        setFormWeeks(String(data.totalWeeks));
      }
    } catch {
      // silently fail
    } finally {
      setAiTimelineLoading(false);
    }
  };

  const handleGenerateStudyPlan = async (certId: number) => {
    setGeneratingPlan((prev) => ({ ...prev, [certId]: true }));
    try {
      await fetch("/api/certs/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", certId }),
      });
      await fetchCerts();
    } finally {
      setGeneratingPlan((prev) => ({ ...prev, [certId]: false }));
    }
  };

  const handleAddToPlanner = async (certId: number) => {
    setAddingTodos((prev) => ({ ...prev, [certId]: true }));
    setTodoSuccess((prev) => ({ ...prev, [certId]: null }));
    try {
      const res = await fetch("/api/certs/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_todos", certId }),
      });
      const data = await res.json();
      setTodoSuccess((prev) => ({ ...prev, [certId]: data.todosCreated ?? data.count ?? 0 }));
      setTimeout(() => {
        setTodoSuccess((prev) => ({ ...prev, [certId]: null }));
      }, 3000);
    } finally {
      setAddingTodos((prev) => ({ ...prev, [certId]: false }));
    }
  };

  const togglePlan = (certId: number) => {
    setExpandedPlans((prev) => ({ ...prev, [certId]: !prev[certId] }));
  };

  const toggleWeek = (certId: number, weekNum: number) => {
    const key = `${certId}-${weekNum}`;
    setExpandedWeeks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-hover rounded w-48" />
        {[1, 2].map((i) => <div key={i} className="sq-panel p-6 h-32" />)}
      </div>
    );
  }

  const activeCerts = certs.filter((c) => !c.isPassed && c.isStarted);
  const pausedCerts = certs.filter((c) => !c.isPassed && !c.isStarted);
  const passedCerts = certs.filter((c) => c.isPassed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">Cert Roadmaps</h1>
        <button onClick={() => setShowForm(!showForm)} className="sq-button-gold text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Cert
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sq-panel p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-sq-gold">Start Certification</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-sq-muted" /></button>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <p className="text-xs text-sq-muted">Quick Start:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.certName}
                    onClick={() => handleCreate(preset)}
                    className="text-left p-2 rounded border border-sq-border hover:border-sq-blue/50 transition-all"
                  >
                    <span className="text-xs font-bold text-sq-text block">{preset.certName}</span>
                    <span className="text-[10px] text-sq-muted">{preset.provider} | {preset.totalWeeks}w | {preset.goldBonus}G</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom */}
            <div className="border-t border-sq-border pt-3 space-y-2">
              <p className="text-xs text-sq-muted">Or Custom:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <input value={formCert} onChange={(e) => setFormCert(e.target.value)} placeholder="Cert name" className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono" />
                <input value={formProvider} onChange={(e) => setFormProvider(e.target.value)} placeholder="Provider" className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono" />
                <div className="flex gap-2">
                  <input value={formWeeks} onChange={(e) => setFormWeeks(e.target.value)} type="number" placeholder="Weeks" className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono flex-1" />
                  <button
                    onClick={handleAiTimeline}
                    disabled={aiTimelineLoading || !formCert}
                    className="px-3 py-2 rounded-md border border-sq-blue/50 hover:border-sq-blue text-sq-blue text-xs font-medium flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {aiTimelineLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Ask AI
                  </button>
                </div>
                <input value={formDate} onChange={(e) => setFormDate(e.target.value)} type="date" placeholder="Exam date" className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono" />
              </div>
              <button onClick={() => handleCreate()} className="sq-button-blue w-full text-sm">ADD CUSTOM CERT</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Certs */}
      {activeCerts.map((cert) => {
        const progress = Math.round((cert.currentWeek / cert.totalWeeks) * 100);
        const studyPlan = parseStudyPlan(cert.studyPlan);
        const isPlanExpanded = expandedPlans[cert.id] || false;
        const isGenerating = generatingPlan[cert.id] || false;
        const isAddingTodos = addingTodos[cert.id] || false;
        const successCount = todoSuccess[cert.id] ?? null;

        return (
          <motion.div key={cert.id} layout className="sq-panel p-4 space-y-3 border border-sq-blue/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[15px] text-sq-text">{cert.certName}</h3>
                <span className="text-[13px] text-sq-muted">{cert.provider}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-sq-blue font-medium">Week {cert.currentWeek}/{cert.totalWeeks}</span>
                <button
                  onClick={() => handlePause(cert.id)}
                  className="p-1 rounded hover:bg-sq-hover transition-colors group"
                  title="Pause cert (study plan will be preserved)"
                >
                  <Pause className="w-3.5 h-3.5 text-sq-muted group-hover:text-amber-500 transition-colors" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-sq-bg rounded-full overflow-hidden">
              <div className="h-full bg-sq-blue rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div className="flex items-center gap-3 text-[13px]">
              <span className="text-sq-muted">{cert.weeklyHours}h/week</span>
              <span className="text-sq-gold">{cert.goldBonus}G on pass</span>
              {cert.targetExamDate && (
                <span className="text-sq-muted">
                  Exam: {new Date(cert.targetExamDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button onClick={() => handleAdvance(cert.id)} className="sq-button-blue text-sm flex-1">
                <Check className="w-3 h-3 inline mr-1" /> Complete Week {cert.currentWeek}
              </button>
              {cert.currentWeek > 1 && (
                <button
                  onClick={() => handleRevertWeek(cert.id)}
                  className="px-3 py-1.5 rounded-md border border-sq-border hover:border-sq-muted text-sq-muted hover:text-sq-text text-sm transition-all flex items-center gap-1"
                  title="Undo last week"
                >
                  <Undo2 className="w-3 h-3" /> Undo
                </button>
              )}
              {cert.currentWeek >= cert.totalWeeks && (
                <button onClick={() => handlePass(cert.id)} className="sq-button-gold text-sm flex-1">
                  <Trophy className="w-3 h-3 inline mr-1" /> PASSED EXAM
                </button>
              )}
            </div>

            {/* Study Plan Toggle */}
            <button
              onClick={() => togglePlan(cert.id)}
              className="flex items-center gap-1.5 text-xs text-sq-muted hover:text-sq-text transition-colors w-full pt-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {isPlanExpanded ? "Hide Study Plan" : "View Study Plan"}
              {isPlanExpanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
            </button>

            {/* Study Plan Content */}
            <AnimatePresence>
              {isPlanExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-sq-border pt-3 space-y-3">
                    {isGenerating ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-sq-hover rounded w-40" />
                        <div className="h-3 bg-sq-hover rounded w-full" />
                        <div className="h-3 bg-sq-hover rounded w-3/4" />
                        <div className="h-3 bg-sq-hover rounded w-5/6" />
                        <div className="h-4 bg-sq-hover rounded w-36 mt-3" />
                        <div className="h-3 bg-sq-hover rounded w-full" />
                        <div className="h-3 bg-sq-hover rounded w-2/3" />
                      </div>
                    ) : !studyPlan ? (
                      <div className="text-center py-4">
                        <p className="text-xs text-sq-muted mb-3">No study plan yet</p>
                        <button
                          onClick={() => handleGenerateStudyPlan(cert.id)}
                          className="sq-button-blue text-xs flex items-center gap-1.5 mx-auto"
                        >
                          <Sparkles className="w-3 h-3" /> Generate Study Plan
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {studyPlan.weeks.map((week) => {
                          const weekKey = `${cert.id}-${week.week}`;
                          const isWeekExpanded = expandedWeeks[weekKey] || false;
                          const isCurrentWeek = week.week === cert.currentWeek;

                          return (
                            <div key={week.week} className={`rounded-md border ${isCurrentWeek ? "border-sq-blue/40 bg-sq-blue/5" : "border-sq-border"}`}>
                              <button
                                onClick={() => toggleWeek(cert.id, week.week)}
                                className="w-full flex items-center justify-between px-3 py-2 text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold ${isCurrentWeek ? "text-sq-blue" : "text-sq-muted"}`}>
                                    W{week.week}
                                  </span>
                                  <span className="text-xs text-sq-text font-medium">{week.title}</span>
                                </div>
                                {isWeekExpanded ? (
                                  <ChevronUp className="w-3 h-3 text-sq-muted" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 text-sq-muted" />
                                )}
                              </button>

                              <AnimatePresence>
                                {isWeekExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-3 pb-3 space-y-2">
                                      {week.topics.map((topic, idx) => (
                                        <div key={idx} className="p-2 rounded bg-sq-bg border border-sq-border space-y-1.5">
                                          <p className="text-xs font-bold text-sq-text">{topic.title}</p>
                                          <p className="text-[11px] text-sq-muted leading-relaxed">{topic.description}</p>
                                          <div className="flex items-center gap-2 pt-1">
                                            <a
                                              href={`https://youtube.com/results?search_query=${encodeURIComponent(topic.youtubeQuery)}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors"
                                            >
                                              <ExternalLink className="w-3 h-3" /> YouTube
                                            </a>
                                            {topic.blogUrl && (
                                              <a
                                                href={topic.blogUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-[10px] text-sq-blue hover:text-sq-blue/80 transition-colors"
                                              >
                                                <ExternalLink className="w-3 h-3" /> Blog
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}

                        {/* Add to Planner */}
                        <div className="pt-2">
                          <button
                            onClick={() => handleAddToPlanner(cert.id)}
                            disabled={isAddingTodos}
                            className="sq-button-gold text-xs w-full flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {isAddingTodos ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" /> Adding to Planner...
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" /> Add to Planner
                              </>
                            )}
                          </button>
                          <AnimatePresence>
                            {successCount !== null && (
                              <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-[11px] text-sq-green text-center mt-1.5"
                              >
                                <Check className="w-3 h-3 inline mr-1" />
                                {successCount} todo{successCount !== 1 ? "s" : ""} created successfully!
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Paused Certs */}
      {pausedCerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-amber-500 flex items-center gap-2">
            <Pause className="w-4 h-4" /> PAUSED
          </h2>
          {pausedCerts.map((cert) => {
            const progress = Math.round((cert.currentWeek / cert.totalWeeks) * 100);
            const studyPlan = parseStudyPlan(cert.studyPlan);
            const isPlanExpanded = expandedPlans[cert.id] || false;

            return (
              <motion.div key={cert.id} layout className="sq-panel p-4 space-y-3 border border-amber-500/20 opacity-75">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[15px] text-sq-text">{cert.certName}</h3>
                    <span className="text-[13px] text-sq-muted">{cert.provider}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 uppercase tracking-wider">
                      Paused
                    </span>
                    <span className="text-[13px] text-sq-muted">Week {cert.currentWeek}/{cert.totalWeeks}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-sq-bg rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500/50 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResume(cert.id)}
                    className="sq-button-blue text-sm flex-1 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3 h-3" /> Resume
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="px-3 py-1.5 rounded-md border border-sq-border hover:border-red-400 text-sq-muted hover:text-red-500 text-sm transition-all flex items-center gap-1"
                    title="Permanently delete cert"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>

                {/* Study plan preserved indicator + expandable view */}
                {studyPlan && (
                  <>
                    <button
                      onClick={() => togglePlan(cert.id)}
                      className="flex items-center gap-1.5 text-xs text-sq-muted hover:text-sq-text transition-colors w-full pt-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {isPlanExpanded ? "Hide Study Plan" : "View Saved Study Plan"}
                      <span className="text-[10px] text-amber-500 ml-1">(preserved)</span>
                      {isPlanExpanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                    </button>

                    <AnimatePresence>
                      {isPlanExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-sq-border pt-3 space-y-2">
                            {studyPlan.weeks.map((week) => {
                              const weekKey = `${cert.id}-${week.week}`;
                              const isWeekExpanded = expandedWeeks[weekKey] || false;

                              return (
                                <div key={week.week} className="rounded-md border border-sq-border">
                                  <button
                                    onClick={() => toggleWeek(cert.id, week.week)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-sq-muted">W{week.week}</span>
                                      <span className="text-xs text-sq-text font-medium">{week.title}</span>
                                    </div>
                                    {isWeekExpanded ? <ChevronUp className="w-3 h-3 text-sq-muted" /> : <ChevronDown className="w-3 h-3 text-sq-muted" />}
                                  </button>

                                  <AnimatePresence>
                                    {isWeekExpanded && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="px-3 pb-3 space-y-2">
                                          {week.topics.map((topic, idx) => (
                                            <div key={idx} className="p-2 rounded bg-sq-bg border border-sq-border space-y-1.5">
                                              <p className="text-xs font-bold text-sq-text">{topic.title}</p>
                                              <p className="text-[11px] text-sq-muted leading-relaxed">{topic.description}</p>
                                              <div className="flex items-center gap-2 pt-1">
                                                <a
                                                  href={`https://youtube.com/results?search_query=${encodeURIComponent(topic.youtubeQuery)}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                  <ExternalLink className="w-3 h-3" /> YouTube
                                                </a>
                                                {topic.blogUrl && (
                                                  <a href={topic.blogUrl} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-[10px] text-sq-blue hover:text-sq-blue/80 transition-colors">
                                                    <ExternalLink className="w-3 h-3" /> Blog
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Passed Certs */}
      {passedCerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-sq-green flex items-center gap-2">
            <Trophy className="w-4 h-4" /> CERTIFIED
          </h2>
          {passedCerts.map((cert) => (
            <div key={cert.id} className="sq-panel p-3 border border-sq-green/30 opacity-80">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-sq-green" />
                <span className="text-sm text-sq-text">{cert.certName}</span>
                <span className="text-[10px] text-sq-green">+{cert.goldBonus}G earned</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeCerts.length === 0 && pausedCerts.length === 0 && passedCerts.length === 0 && (
        <div className="sq-panel p-8 text-center">
          <GraduationCap className="w-8 h-8 text-sq-muted mx-auto mb-2" />
          <p className="text-sm text-sq-muted">No certification roadmaps. Start one to earn massive Gold bonuses.</p>
        </div>
      )}
    </div>
  );
}
