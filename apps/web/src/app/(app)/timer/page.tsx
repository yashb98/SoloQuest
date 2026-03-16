"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Check, Clock, Zap, History } from "lucide-react";
import { useHunter } from "@/contexts/HunterContext";

interface Session {
  id: number;
  label: string;
  duration: number;
  elapsed: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt: string | null;
}

const PRESETS = [
  { label: "Pomodoro", minutes: 25 },
  { label: "Short Break", minutes: 5 },
  { label: "Deep Work", minutes: 50 },
  { label: "Long Break", minutes: 15 },
  { label: "Sprint", minutes: 15 },
  { label: "Marathon", minutes: 90 },
];

export default function TimerPage() {
  const { addToast, refreshHunter, checkAchievements } = useHunter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [label, setLabel] = useState("Focus Session");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSessions = useCallback(async () => {
    const res = await fetch("/api/timer");
    const data = await res.json();
    setSessions(data);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            // Auto-complete
            if (activeSession) completeSession(activeSession.id, activeSession.duration * 60);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft > 0]);

  const startTimer = async () => {
    try {
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, duration: selectedMinutes }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveSession(data.session);
        setTimeLeft(selectedMinutes * 60);
        setIsRunning(true);
        addToast({ type: "info", title: "Timer started", description: `${selectedMinutes}m ${label}`, duration: 2000 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completeSession = async (sessionId: number, elapsed: number) => {
    try {
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", sessionId, elapsed }),
      });
      const data = await res.json();
      if (data.success) {
        addToast({
          type: "xp",
          title: `Session Complete! +${data.xpEarned} XP`,
          description: `+${data.goldEarned}G | ${data.minutesFocused}m focused`,
          duration: 4000,
        });
        setActiveSession(null);
        refreshHunter();
        checkAchievements();
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePause = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setActiveSession(null);
    setTimeLeft(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const finishEarly = () => {
    if (activeSession) {
      const elapsed = activeSession.duration * 60 - timeLeft;
      completeSession(activeSession.id, elapsed);
      setIsRunning(false);
      setTimeLeft(0);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = activeSession ? ((activeSession.duration * 60 - timeLeft) / (activeSession.duration * 60)) * 100 : 0;

  const completedToday = sessions.filter((s) => {
    if (!s.isCompleted || !s.completedAt) return false;
    return new Date(s.completedAt).toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
  });
  const todayMinutes = completedToday.reduce((sum, s) => sum + Math.floor(s.elapsed / 60), 0);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">Focus Timer</h1>

      {/* Timer Display */}
      <div className="sq-panel p-8 text-center">
        {activeSession ? (
          <>
            <p className="text-[14px] text-sq-muted font-semibold mb-2">{activeSession.label}</p>
            {/* Circular progress */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="var(--sq-hover)" strokeWidth="8" />
                <motion.circle
                  cx="100" cy="100" r="90" fill="none"
                  stroke="var(--sq-accent)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={565}
                  initial={false}
                  animate={{ strokeDashoffset: 565 - (565 * progress) / 100 }}
                  transition={{ duration: 0.5, ease: "linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[48px] font-bold text-sq-text tabular-nums">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={resetTimer}
                className="w-12 h-12 rounded-full bg-sq-hover flex items-center justify-center hover:bg-sq-border transition-colors"
              >
                <RotateCcw className="w-5 h-5 text-sq-muted" />
              </button>
              <button
                onClick={togglePause}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-sq-accent to-sq-accent-light flex items-center justify-center text-white shadow-sq-accent-glow hover:scale-105 transition-transform"
              >
                {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>
              <button
                onClick={finishEarly}
                className="w-12 h-12 rounded-full bg-sq-green/20 flex items-center justify-center hover:bg-sq-green/30 transition-colors"
              >
                <Check className="w-5 h-5 text-sq-green" />
              </button>
            </div>
          </>
        ) : (
          <>
            <Clock className="w-8 h-8 text-sq-muted mx-auto mb-4" />

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => { setSelectedMinutes(preset.minutes); setLabel(preset.label); }}
                  className={`px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all
                    ${selectedMinutes === preset.minutes
                      ? "bg-sq-accent text-white shadow-sq-accent-glow"
                      : "bg-sq-hover text-sq-text hover:bg-sq-border"
                    }`}
                >
                  {preset.label}
                  <br />
                  <span className="text-[11px] opacity-80">{preset.minutes}m</span>
                </button>
              ))}
            </div>

            {/* Custom label */}
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Session label..."
              className="sq-input mb-4 text-center"
            />

            <button onClick={startTimer} className="sq-button-accent w-full flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> Start {selectedMinutes}m Session
            </button>
          </>
        )}
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="sq-panel p-4 text-center">
          <Zap className="w-5 h-5 text-sq-accent mx-auto mb-1" />
          <span className="text-[24px] font-bold text-sq-text">{completedToday.length}</span>
          <p className="text-[12px] text-sq-muted">Sessions Today</p>
        </div>
        <div className="sq-panel p-4 text-center">
          <Clock className="w-5 h-5 text-sq-purple mx-auto mb-1" />
          <span className="text-[24px] font-bold text-sq-text">{todayMinutes}m</span>
          <p className="text-[12px] text-sq-muted">Focused Today</p>
        </div>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="sq-panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-sq-muted" />
            <span className="text-[14px] font-bold text-sq-text">Recent Sessions</span>
          </div>
          <div className="space-y-2">
            {sessions.slice(0, 10).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-sq-border last:border-0">
                <div>
                  <span className="text-[14px] text-sq-text font-medium">{s.label}</span>
                  <span className="text-[12px] text-sq-muted ml-2">
                    {s.duration}m planned • {Math.floor(s.elapsed / 60)}m actual
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {s.isCompleted ? (
                    <span className="text-[11px] text-sq-green font-semibold">Done</span>
                  ) : (
                    <span className="text-[11px] text-sq-muted">Incomplete</span>
                  )}
                  <span className="text-[11px] text-sq-muted">
                    {new Date(s.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
