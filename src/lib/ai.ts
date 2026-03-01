// lib/ai.ts — Claude AI client and prompt templates
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const MODEL = "claude-sonnet-4-6";

// --- Morning Briefing ---
interface BriefingContext {
  hunterName: string;
  rank: string;
  level: number;
  streak: number;
  weakestStat: string;
  weakestStatValue: number;
  hasShift: boolean;
  questTitles: string[];
}

export async function generateBriefing(ctx: BriefingContext): Promise<string> {
  const prompt = `You are the System from Solo Leveling — cold, dramatic, omniscient.
Be concise — under 80 words total. Never generic.
Reference the hunter's actual stats and today's specific quests.

Hunter: ${ctx.hunterName} | Rank: ${ctx.rank}-${ctx.level} | Streak: ${ctx.streak} days
Weakest stat: ${ctx.weakestStat} (${ctx.weakestStatValue} points)
Work shift today: ${ctx.hasShift ? "Yes" : "No"}
Today's top quests: ${ctx.questTitles.join(", ")}

Rules:
- If streak > 3: acknowledge coldly
- If streak = 0: warn about consequences
- End with exactly ONE command sentence starting with an imperative verb`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

// --- Exam Generation ---
interface ExamContext {
  level: number;
  type: string;
  curriculumTopics: string[];
  timeLimit: number;
  passMark: number;
  pastTopics: string[];
}

export async function generateExam(ctx: ExamContext): Promise<string> {
  const prompt = `You are a senior DS/ML/AI technical examiner.
Return ONLY valid JSON — no markdown, no preamble, no explanation.

Hunter level: ${ctx.level} | Gate type: ${ctx.type} | Topics: ${ctx.curriculumTopics.join(", ")}
Time limit: ${ctx.timeLimit} min | Pass mark: ${ctx.passMark}/100
Avoid repeating: ${ctx.pastTopics.join(", ") || "none"}

Required JSON structure:
{
  "title": "string",
  "total_marks": 100,
  "time_limit_minutes": ${ctx.timeLimit},
  "sections": [{
    "section_name": "string",
    "questions": [{
      "id": "Q1",
      "type": "mcq|short_answer|code|case_study",
      "marks": number,
      "question": "string",
      "options": ["A","B","C","D"],
      "rubric": "string"
    }]
  }]
}`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

// --- Exam Grading ---
interface GradeContext {
  questionText: string;
  marksAvailable: number;
  rubric: string;
  candidateAnswer: string;
}

export async function gradeAnswer(ctx: GradeContext): Promise<string> {
  const prompt = `You are a rigorous DS/ML technical examiner.
Return ONLY valid JSON — no markdown, no preamble.

Question: ${ctx.questionText} | Marks: ${ctx.marksAvailable} | Rubric: ${ctx.rubric}
Candidate answer: ${ctx.candidateAnswer}

Required JSON:
{
  "marks_awarded": number,
  "percentage": number,
  "grade": "Excellent|Good|Partial|Poor|Wrong",
  "feedback": "2-4 sentences, specific and constructive",
  "what_was_missing": "what would earn full marks",
  "study_recommendation": "one specific resource or topic"
}

Be rigorous. Vague answers do not earn full marks.`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

// --- Quest Chain Generation ---
interface QuestGenContext {
  hunterName: string;
  level: number;
  rank: string;
  goal: string;
}

export async function generateQuestChain(
  ctx: QuestGenContext
): Promise<string> {
  const prompt = `You are the System generating a quest chain for a Hunter.
Return ONLY a valid JSON array — no markdown, no preamble.

Hunter: ${ctx.hunterName} | Level: ${ctx.level} | Rank: ${ctx.rank}
Goal: "${ctx.goal}"

Generate 5-7 quests. Each quest:
{
  "title": "specific and actionable — not generic",
  "category": "job_search|interview_prep|health|food|part_time|learning|mental|finance",
  "difficulty": "normal|hard|legendary",
  "xpBase": number,
  "goldBase": number,
  "statTarget": "discipline|vitality|intelligence|hustle|wealth",
  "dueInDays": number
}

Scale difficulty to level ${ctx.level}. If goal is career-related, bias toward
interview_prep and job_search. Never use vague titles.`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

// --- Weekly Report ---
interface WeeklyReportContext {
  hunterName: string;
  weeklyXP: number;
  completed: number;
  total: number;
  completionPct: number;
  bestCategory: string;
  bestPct: number;
  worstCategory: string;
  worstPct: number;
  streak: number;
  weeklyGold: number;
  examsPassed: number;
}

export async function generateWeeklyReport(
  ctx: WeeklyReportContext
): Promise<string> {
  const prompt = `You are the System issuing a weekly assessment.
Be analytical and cold. Under 120 words. Reference specific numbers.
Name failures. Acknowledge wins minimally.

Hunter: ${ctx.hunterName}
XP earned: ${ctx.weeklyXP} | Quests: ${ctx.completed}/${ctx.total} (${ctx.completionPct}%)
Best: ${ctx.bestCategory} (${ctx.bestPct}%) | Worst: ${ctx.worstCategory} (${ctx.worstPct}%)
Streak: ${ctx.streak} | Gold: ${ctx.weeklyGold} | Exams passed: ${ctx.examsPassed}

End with one forward-looking directive for next week.`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}
