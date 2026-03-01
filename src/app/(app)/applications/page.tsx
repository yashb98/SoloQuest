"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, ChevronRight, X, ExternalLink } from "lucide-react";

interface Application {
  id: number;
  company: string;
  role: string;
  link: string;
  status: string;
  salaryRange: string | null;
  contactPerson: string | null;
  notes: string | null;
  dateApplied: string;
}

const STAGES = [
  { key: "discovered", label: "Discovered", color: "text-gray-400" },
  { key: "applied", label: "Applied", color: "text-sq-blue" },
  { key: "followed_up", label: "Followed Up", color: "text-cyan-400" },
  { key: "phone_screen", label: "Phone Screen", color: "text-sq-gold" },
  { key: "technical", label: "Technical", color: "text-orange-400" },
  { key: "final", label: "Final Round", color: "text-sq-purple" },
  { key: "offer", label: "Offer", color: "text-sq-green" },
  { key: "accepted", label: "Accepted", color: "text-emerald-400" },
  { key: "rejected", label: "Rejected", color: "text-red-400" },
];

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [link, setLink] = useState("");
  const [salary, setSalary] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchApps = useCallback(async () => {
    const res = await fetch("/api/applications");
    const data = await res.json();
    setApps(data.applications);
    setPipeline(data.pipeline);
    setLoading(false);
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleCreate = async () => {
    if (!company || !role) return;
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", company, role, link, salaryRange: salary || undefined }),
    });
    setCompany(""); setRole(""); setLink(""); setSalary(""); setShowForm(false);
    fetchApps();
  };

  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", applicationId: appId, status: newStatus }),
    });
    fetchApps();
  };

  const getNextStage = (current: string): string | null => {
    const idx = STAGES.findIndex((s) => s.key === current);
    if (idx === -1 || idx >= STAGES.length - 2) return null;
    return STAGES[idx + 1].key;
  };

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-border/30 rounded w-48" />
        {[1, 2, 3].map((i) => <div key={i} className="sq-panel p-6 h-24" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-sq-gold">JOB TRACKER</h1>
        <button onClick={() => setShowForm(!showForm)} className="sq-button-gold text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Pipeline Summary */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilter("all")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-md font-display font-semibold text-xs ${
            filter === "all" ? "bg-sq-gold/20 text-sq-gold border border-sq-gold/40" : "bg-sq-bg text-sq-muted border border-sq-border"
          }`}
        >
          All {apps.length}
        </button>
        {STAGES.map((stage) => {
          const count = pipeline[stage.key] || 0;
          if (count === 0 && filter !== stage.key) return null;
          return (
            <button
              key={stage.key}
              onClick={() => setFilter(stage.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md font-display font-semibold text-xs ${
                filter === stage.key ? "bg-sq-gold/20 text-sq-gold border border-sq-gold/40" : "bg-sq-bg text-sq-muted border border-sq-border"
              }`}
            >
              {stage.label} {count}
            </button>
          );
        })}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sq-panel p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-sq-gold">New Application</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-sq-muted" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono" />
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono" />
              <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link (optional)" className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono" />
              <input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Salary range (optional)" className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono" />
            </div>
            <button onClick={handleCreate} className="sq-button-gold w-full text-sm">ADD APPLICATION</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application List */}
      <div className="space-y-3">
        {filtered.map((app) => {
          const stage = STAGES.find((s) => s.key === app.status);
          const nextStage = getNextStage(app.status);
          return (
            <motion.div key={app.id} layout className="sq-panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-sm text-sq-text">{app.company}</h3>
                    <span className={`font-mono text-[10px] font-bold ${stage?.color || "text-sq-muted"}`}>
                      {stage?.label?.toUpperCase() || app.status}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-sq-muted mt-0.5">{app.role}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {app.salaryRange && <span className="font-mono text-[10px] text-sq-gold">{app.salaryRange}</span>}
                    <span className="font-mono text-[10px] text-sq-muted">
                      {new Date(app.dateApplied).toLocaleDateString()}
                    </span>
                    {app.link && (
                      <a href={app.link} target="_blank" rel="noopener noreferrer" className="text-sq-blue">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {nextStage && app.status !== "rejected" && app.status !== "accepted" && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, nextStage)}
                      className="px-2 py-1 rounded text-[10px] font-display font-bold border border-sq-green/30 text-sq-green hover:bg-sq-green/10 flex items-center gap-1"
                    >
                      <ChevronRight className="w-3 h-3" />
                      {STAGES.find((s) => s.key === nextStage)?.label}
                    </button>
                  )}
                  {app.status !== "rejected" && app.status !== "accepted" && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, "rejected")}
                      className="px-2 py-1 rounded text-[10px] font-display font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="sq-panel p-8 text-center">
            <Briefcase className="w-8 h-8 text-sq-muted mx-auto mb-2" />
            <p className="font-mono text-sm text-sq-muted">No applications yet. Start tracking your job search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
