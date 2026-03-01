"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Plus, Check, Trophy, X } from "lucide-react";

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

export default function CertsPage() {
  const [certs, setCerts] = useState<CertRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formCert, setFormCert] = useState("");
  const [formProvider, setFormProvider] = useState("");
  const [formWeeks, setFormWeeks] = useState("8");
  const [formDate, setFormDate] = useState("");

  const fetchCerts = useCallback(async () => {
    const res = await fetch("/api/certs");
    setCerts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCerts(); }, [fetchCerts]);

  const handleCreate = async (preset?: typeof PRESETS[0]) => {
    const data = preset || { certName: formCert, provider: formProvider, totalWeeks: parseInt(formWeeks) };
    if (!data.certName) return;
    await fetch("/api/certs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        ...data,
        targetExamDate: formDate || undefined,
      }),
    });
    setFormCert(""); setFormProvider(""); setShowForm(false);
    fetchCerts();
  };

  const handleAdvance = async (certId: number) => {
    await fetch("/api/certs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "advance_week", certId }),
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

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-hover rounded w-48" />
        {[1, 2].map((i) => <div key={i} className="sq-panel p-6 h-32" />)}
      </div>
    );
  }

  const activeCerts = certs.filter((c) => !c.isPassed);
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
                <input value={formWeeks} onChange={(e) => setFormWeeks(e.target.value)} type="number" placeholder="Weeks" className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono" />
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
        return (
          <motion.div key={cert.id} layout className="sq-panel p-4 space-y-3 border border-sq-blue/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[15px] text-sq-text">{cert.certName}</h3>
                <span className="text-[13px] text-sq-muted">{cert.provider}</span>
              </div>
              <span className="text-[14px] text-sq-blue font-medium">Week {cert.currentWeek}/{cert.totalWeeks}</span>
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

            <div className="flex gap-2">
              <button onClick={() => handleAdvance(cert.id)} className="sq-button-blue text-sm flex-1">
                <Check className="w-3 h-3 inline mr-1" /> Complete Week {cert.currentWeek}
              </button>
              {cert.currentWeek >= cert.totalWeeks && (
                <button onClick={() => handlePass(cert.id)} className="sq-button-gold text-sm flex-1">
                  <Trophy className="w-3 h-3 inline mr-1" /> PASSED EXAM
                </button>
              )}
            </div>
          </motion.div>
        );
      })}

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

      {activeCerts.length === 0 && passedCerts.length === 0 && (
        <div className="sq-panel p-8 text-center">
          <GraduationCap className="w-8 h-8 text-sq-muted mx-auto mb-2" />
          <p className="text-sm text-sq-muted">No certification roadmaps. Start one to earn massive Gold bonuses.</p>
        </div>
      )}
    </div>
  );
}
