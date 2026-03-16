"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { GATE_LEVELS, isGateLevel, rankFromLevel, rankLevel } from "@/lib/xp";

interface Question {
  id: string;
  type: string;
  marks: number;
  question: string;
  options?: string[];
  rubric: string;
}

interface ExamData {
  title: string;
  total_marks: number;
  time_limit_minutes: number;
  sections: Array<{
    section_name: string;
    questions: Question[];
  }>;
}

interface GradeResult {
  questionId: string;
  marks_awarded: number;
  grade: string;
  feedback: string;
  what_was_missing?: string;
  study_recommendation?: string;
}

type ExamState = "idle" | "generating" | "active" | "submitting" | "results";

export default function ExamPage() {
  const [hunter, setHunter] = useState<{
    level: number;
    rankLevel: number;
    rank: string;
    xp: number;
    xpToNext: number;
  } | null>(null);
  const [examState, setExamState] = useState<ExamState>("idle");
  const [examId, setExamId] = useState<number | null>(null);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [passMark, setPassMark] = useState(60);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<{
    score: number;
    passed: boolean;
    results: GradeResult[];
  } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHunter = useCallback(async () => {
    const res = await fetch("/api/hunter");
    setHunter(await res.json());
  }, []);

  useEffect(() => {
    fetchHunter();
  }, [fetchHunter]);

  // Countdown timer
  useEffect(() => {
    if (examState !== "active" || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examState]);

  const nextGateLevel = hunter
    ? GATE_LEVELS.find((g) => g > hunter.level) ?? null
    : null;
  // Gate-locked = XP is capped at xpToNext AND the next level is a gate level
  const isAtGate = hunter
    ? hunter.xp >= hunter.xpToNext && isGateLevel(hunter.level + 1)
    : false;

  const handleStartExam = async () => {
    if (!nextGateLevel) return;
    setExamState("generating");

    try {
      const res = await fetch("/api/exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateLevel: nextGateLevel }),
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setExamState("idle");
        return;
      }

      setExamId(data.examId);
      setExamData(data.exam);
      setPassMark(data.passMark);
      setTimeLeft(data.timeLimit * 60);
      setAnswers({});
      setExamState("active");
    } catch {
      alert("Failed to generate exam. Check your AI API key.");
      setExamState("idle");
    }
  };

  const handleSubmit = async () => {
    if (!examData || !examId) return;
    setExamState("submitting");

    const allQuestions = examData.sections.flatMap((s) => s.questions);
    const answerPayload = allQuestions.map((q) => ({
      questionId: q.id,
      questionText: q.question,
      marks: q.marks,
      rubric: q.rubric,
      answer: answers[q.id] || "(no answer provided)",
    }));

    try {
      const res = await fetch("/api/exam/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, answers: answerPayload }),
      });
      const data = await res.json();
      setResults(data);
      setExamState("results");
      fetchHunter();
    } catch {
      alert("Grading failed.");
      setExamState("active");
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // --- IDLE STATE ---
  if (examState === "idle") {
    return (
      <div className="space-y-6">
        <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">
          Gate Exam
        </h1>

        {!isAtGate && nextGateLevel && (
          <div className="sq-panel p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-sq-blue" />
              <span className="font-semibold text-sq-text">
                Next Gate: {rankFromLevel(nextGateLevel)}-{rankLevel(nextGateLevel)}
              </span>
            </div>
            <p className="text-sm text-sq-muted">
              You are currently {hunter?.rank}-{hunter?.rankLevel}. Reach{" "}
              {rankFromLevel(nextGateLevel)}-{rankLevel(nextGateLevel)} to unlock the gate exam.
            </p>
          </div>
        )}

        {isAtGate && nextGateLevel && (
          <div className="sq-panel p-6 space-y-4 border-2 border-sq-gold/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-sq-gold animate-pulse" />
              <span className="font-bold text-sq-gold">
                GATE {nextGateLevel} — EXAM REQUIRED
              </span>
            </div>
            <p className="text-sm text-sq-text">
              You cannot level past {nextGateLevel} without passing this
              examination. The exam covers topics relevant to your current rank.
            </p>
            <button onClick={handleStartExam} className="sq-button-gold w-full">
              BEGIN EXAMINATION
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- GENERATING STATE ---
  if (examState === "generating") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="sq-panel p-8 text-center space-y-4">
          <div className="w-12 h-12 border-2 border-sq-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-sq-gold">
            GENERATING EXAMINATION...
          </p>
          <p className="text-xs text-sq-muted">
            The System is preparing your trial.
          </p>
        </div>
      </div>
    );
  }

  // --- ACTIVE STATE ---
  if (examState === "active" && examData) {
    const allQuestions = examData.sections.flatMap((s) => s.questions);

    return (
      <div className="space-y-6">
        {/* Timer bar */}
        <div className="sq-panel p-3 flex items-center justify-between sticky top-0 z-40">
          <span className="font-bold text-sm text-sq-text">
            {examData.title}
          </span>
          <div className="flex items-center gap-4">
            <span
              className={`text-lg font-bold flex items-center gap-1 ${
                timeLeft < 120 ? "text-red-400 animate-pulse" : "text-sq-gold"
              }`}
            >
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </span>
            <button
              onClick={handleSubmit}
              className="sq-button-gold text-sm px-4 py-1.5"
            >
              SUBMIT
            </button>
          </div>
        </div>

        {/* Questions */}
        {examData.sections.map((section, si) => (
          <div key={si} className="space-y-4">
            <h2 className="font-bold text-lg text-sq-blue">
              {section.section_name}
            </h2>
            {section.questions.map((q) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="sq-panel p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs text-sq-muted">
                    {q.id} ({q.marks} marks)
                  </span>
                  <span className="text-[10px] text-sq-muted uppercase">
                    {q.type}
                  </span>
                </div>
                <p className="text-sm text-sq-text whitespace-pre-wrap">
                  {q.question}
                </p>

                {q.type === "mcq" && q.options ? (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer border transition-all
                          ${
                            answers[q.id] === opt
                              ? "border-sq-gold bg-sq-gold/10"
                              : "border-sq-border hover:border-sq-blue/50"
                          }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                          }
                          className="sr-only"
                        />
                        <span className="text-sm text-sq-text">
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers[q.id] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: e.target.value,
                      }))
                    }
                    placeholder="Type your answer..."
                    rows={4}
                    className="w-full bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text resize-y"
                  />
                )}
              </motion.div>
            ))}
          </div>
        ))}

        {/* Bottom submit */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-sq-muted">
            {Object.keys(answers).length}/{allQuestions.length} answered
          </span>
          <button onClick={handleSubmit} className="sq-button-gold">
            SUBMIT EXAMINATION
          </button>
        </div>
      </div>
    );
  }

  // --- SUBMITTING STATE ---
  if (examState === "submitting") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="sq-panel p-8 text-center space-y-4">
          <div className="w-12 h-12 border-2 border-sq-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-sq-blue">
            GRADING IN PROGRESS...
          </p>
          <p className="text-xs text-sq-muted">
            The System is evaluating your performance.
          </p>
        </div>
      </div>
    );
  }

  // --- RESULTS STATE ---
  if (examState === "results" && results) {
    return (
      <div className="space-y-6">
        <div
          className={`sq-panel p-8 text-center border-2 ${
            results.passed
              ? "border-sq-green shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              : "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          }`}
        >
          {results.passed ? (
            <CheckCircle className="w-16 h-16 text-sq-green mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          )}
          <h2
            className={`font-bold text-3xl mb-2 ${
              results.passed ? "text-sq-green" : "text-red-400"
            }`}
          >
            {results.passed ? "GATE CLEARED" : "GATE FAILED"}
          </h2>
          <p className="text-2xl text-sq-text mb-2">
            Score: {results.score}%
          </p>
          <p className="text-sm text-sq-muted">
            Pass mark: {passMark}%
          </p>
        </div>

        {/* Individual question results */}
        <div className="space-y-3">
          {results.results.map((r) => (
            <div key={r.questionId} className="sq-panel p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-sq-text font-bold">
                  {r.questionId}
                </span>
                <span
                  className={`text-sm font-bold ${
                    r.grade === "Excellent" || r.grade === "Good"
                      ? "text-sq-green"
                      : r.grade === "Partial"
                      ? "text-sq-gold"
                      : "text-red-400"
                  }`}
                >
                  {r.marks_awarded} marks — {r.grade}
                </span>
              </div>
              <p className="text-xs text-sq-muted">{r.feedback}</p>
              {r.study_recommendation && (
                <p className="text-[10px] text-sq-blue">
                  Study: {r.study_recommendation}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setExamState("idle");
            setResults(null);
          }}
          className="sq-button-gold w-full"
        >
          RETURN
        </button>
      </div>
    );
  }

  return null;
}
