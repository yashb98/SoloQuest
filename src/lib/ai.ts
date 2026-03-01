// lib/ai.ts — AI client with Anthropic primary + Mistral API fallback
// Priority: Anthropic Claude → Mistral API → graceful empty
// Mistral free tier: ~2 req/min, all models available, great for structured output
import Anthropic from "@anthropic-ai/sdk";
import { Mistral } from "@mistralai/mistralai";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const MISTRAL_KEY = process.env.MISTRAL_API_KEY || "";
const CLAUDE_MODEL = "claude-sonnet-4-6";
// Free tier has access to all models — mistral-small-latest is fast and great at structured tasks
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "mistral-small-latest";

const anthropic = ANTHROPIC_KEY && ANTHROPIC_KEY !== "your_anthropic_api_key_here"
  ? new Anthropic({ apiKey: ANTHROPIC_KEY })
  : null;

const mistral = MISTRAL_KEY && MISTRAL_KEY !== "your_mistral_api_key_here"
  ? new Mistral({ apiKey: MISTRAL_KEY })
  : null;

// --- Generic AI call with Anthropic → Mistral fallback ---
async function aiCall(
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 500,
  jsonMode: boolean = false
): Promise<string> {
  // Try Anthropic first
  if (anthropic) {
    try {
      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages: [{ role: "user", content: prompt }],
      });
      const block = message.content[0];
      if (block.type === "text" && block.text) return block.text;
    } catch (err) {
      console.warn("[AI] Anthropic failed, trying Mistral fallback:", (err as Error).message);
    }
  } else {
    console.info("[AI] No Anthropic API key, trying Mistral fallback");
  }

  // Fallback to Mistral API (free tier: ~2 req/min, all models accessible)
  if (mistral) {
    try {
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const response = await mistral.chat.complete({
        model: MISTRAL_MODEL,
        maxTokens,
        temperature: 0.7,
        messages,
        // Use JSON mode for structured output (exam gen, grading, quest chains)
        ...(jsonMode ? { responseFormat: { type: "json_object" as const } } : {}),
      });

      const content = response.choices?.[0]?.message?.content;
      if (typeof content === "string" && content) return content;
    } catch (err) {
      console.warn("[AI] Mistral also failed:", (err as Error).message);
    }
  } else {
    console.info("[AI] No Mistral API key either, AI features unavailable");
  }

  // If both fail, return empty string (callers handle this gracefully)
  return "";
}

// --- Morning Briefing ---
interface BriefingContext {
  hunterName: string;
  class: string;
  rank: string;
  level: number;
  streak: number;
  weakestStat: string;
  weakestStatValue: number;
  stats: Record<string, number>;
  questTitles: string[];
}

export async function generateBriefing(ctx: BriefingContext): Promise<string> {
  const prompt = `You are the System from Solo Leveling — cold, dramatic, omniscient.
Be concise — under 80 words total. Never generic.
Reference the hunter's actual stats and today's specific quests.

Hunter: ${ctx.hunterName} | Class: ${ctx.class} | Rank: ${ctx.rank}-${ctx.level} | Streak: ${ctx.streak} days
Stats: VIT=${ctx.stats.vitality} INT=${ctx.stats.intel} HUS=${ctx.stats.hustle} WLT=${ctx.stats.wealth} FOC=${ctx.stats.focus} AIQ=${ctx.stats.agentIQ}
Weakest stat: ${ctx.weakestStat} (${ctx.weakestStatValue} points)
Today's top quests: ${ctx.questTitles.join(", ")}

Rules:
- If streak > 3: acknowledge coldly
- If streak = 0: warn about consequences
- End with exactly ONE command sentence starting with an imperative verb`;

  return aiCall(prompt, undefined, 200);
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

  return aiCall(prompt, undefined, 4000, true);
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

  return aiCall(prompt, undefined, 500, true);
}

// --- AI Mentor Chat (Step 10) ---
interface MentorContext {
  hunterName: string;
  class: string;
  rank: string;
  level: number;
  stats: Record<string, number>;
  streak: number;
  activeQuests: string[];
  recentHistory: string[];
  userMessage: string;
}

export async function mentorChat(ctx: MentorContext): Promise<string> {
  const systemPrompt = `You are the AI Mentor in Solo Quest — a personal coach, study buddy, and accountability partner.
You speak in a motivating, game-themed tone. Reference the user's stats, rank, and class.

Hunter Context:
- Name: ${ctx.hunterName} | Class: ${ctx.class} | Rank: ${ctx.rank}-${ctx.level}
- Stats: VIT=${ctx.stats.vitality} INT=${ctx.stats.intel} HUS=${ctx.stats.hustle} WLT=${ctx.stats.wealth} FOC=${ctx.stats.focus} AIQ=${ctx.stats.agentIQ}
- Streak: ${ctx.streak} days
- Active quests: ${ctx.activeQuests.join(", ") || "none"}
- Recent completions: ${ctx.recentHistory.join(", ") || "none"}

Guidelines:
- Be concise (under 150 words)
- Give actionable advice, not vague motivation
- Reference specific stats when relevant
- Suggest specific quests or dungeons when appropriate
- If a stat is lagging, suggest ways to improve it`;

  return aiCall(ctx.userMessage, systemPrompt, 400);
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
  "category": "health|learning|jobs|finance|focus|agentiq|food|mental",
  "difficulty": "normal|hard|legendary",
  "xpBase": number,
  "goldBase": number,
  "statTarget": "vitality|intel|hustle|wealth|focus|agentIQ",
  "dueInDays": number
}

Scale difficulty to level ${ctx.level}. If goal is career-related, bias toward
jobs. Never use vague titles.`;

  return aiCall(prompt, undefined, 2000, true);
}

// --- Task Details Generation (for Planner and Quest Board) ---
export async function generateTaskDetails(
  title: string,
  category: string,
  type: "todo" | "quest" = "todo"
): Promise<string> {
  const contextLabel = type === "quest" ? "quest" : "task";
  const prompt = `You are a productivity coach. Given this ${contextLabel} title, generate a concise actionable breakdown.

${contextLabel.charAt(0).toUpperCase() + contextLabel.slice(1)}: "${title}"
Category: ${category}

Return a short description (1-2 sentences explaining WHY this matters), followed by 3-6 specific, actionable steps.

Format:
[Description sentence]

Steps:
1. [First specific step]
2. [Second specific step]
3. [Third specific step]
...

Tips:
- [One practical tip]
- [One resource or tool suggestion]

Keep it under 150 words total. Be specific, not generic. Use concrete numbers and actions.`;

  return aiCall(prompt, undefined, 400);
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

  return aiCall(prompt, undefined, 300);
}
