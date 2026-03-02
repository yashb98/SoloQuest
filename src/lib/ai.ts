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
// Mistral Small 3.2 supports vision (images) on free tier
const MISTRAL_VISION_MODEL = "mistral-small-latest";

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
  targetRole?: string; // from active JobRoadmap
}

export async function generateBriefing(ctx: BriefingContext): Promise<string> {
  const prompt = `You are the System from Solo Leveling — cold, dramatic, omniscient.
Be concise — under 80 words total. Never generic.
Reference the hunter's actual stats and today's specific quests.

Hunter: ${ctx.hunterName} | Class: ${ctx.class} | Rank: ${ctx.rank}-${ctx.level} | Streak: ${ctx.streak} days
Stats: VIT=${ctx.stats.vitality} INT=${ctx.stats.intel} HUS=${ctx.stats.hustle} WLT=${ctx.stats.wealth} FOC=${ctx.stats.focus} AIQ=${ctx.stats.agentIQ}
Weakest stat: ${ctx.weakestStat} (${ctx.weakestStatValue} points)
Today's top quests: ${ctx.questTitles.join(", ")}${ctx.targetRole ? `\nCareer Goal: ${ctx.targetRole}` : ""}

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
  targetRole?: string; // from active JobRoadmap
}

export async function mentorChat(ctx: MentorContext): Promise<string> {
  const systemPrompt = `You are the AI Mentor in Solo Quest — a personal coach, study buddy, and accountability partner.
You speak in a motivating, game-themed tone. Reference the user's stats, rank, and class.

Hunter Context:
- Name: ${ctx.hunterName} | Class: ${ctx.class} | Rank: ${ctx.rank}-${ctx.level}
- Stats: VIT=${ctx.stats.vitality} INT=${ctx.stats.intel} HUS=${ctx.stats.hustle} WLT=${ctx.stats.wealth} FOC=${ctx.stats.focus} AIQ=${ctx.stats.agentIQ}
- Streak: ${ctx.streak} days
- Active quests: ${ctx.activeQuests.join(", ") || "none"}
- Recent completions: ${ctx.recentHistory.join(", ") || "none"}${ctx.targetRole ? `\n- Career Goal: ${ctx.targetRole}` : ""}

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

CRITICAL FORMATTING RULES:
  DO NOT use any markdown syntax. No **bold**, no # headers, no [links](url), no - bullet dashes.
  Use PLAIN TEXT only with emojis for visual structure.
  Use numbered steps like "1)" "2)" etc.
  Write URLs as plain text.

Return in this exact plain text format:

🎯 [1-2 sentence description of WHY this matters]

📋 Steps:
1) [First specific step]
2) [Second specific step]
3) [Third specific step]
4) [Fourth step if needed]

💡 Tips:
  [One practical tip with emoji prefix]
  [One resource or tool suggestion with emoji prefix]

🔧 Tools: [comma-separated list of tools/resources]

Keep it under 150 words total. Be specific, not generic. Use concrete numbers and actions.
Do NOT use markdown. Plain text with emojis only.`;

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

// --- Cert Study Plan Generation ---
interface CertStudyPlanContext {
  certName: string;
  provider: string;
  totalWeeks: number;
  weeklyHours: number;
  hunterLevel: number;
}

export async function generateCertStudyPlan(ctx: CertStudyPlanContext): Promise<string> {
  const prompt = `You are an expert certification coach. Generate a week-by-week study plan.
Return ONLY valid JSON — no markdown, no preamble.

Certification: ${ctx.certName} | Provider: ${ctx.provider}
Duration: ${ctx.totalWeeks} weeks | ${ctx.weeklyHours} hours/week
Student Level: ${ctx.hunterLevel}

Required JSON:
{
  "suggestedWeeks": ${ctx.totalWeeks},
  "suggestedHoursPerWeek": ${ctx.weeklyHours},
  "weeks": [
    {
      "week": 1,
      "title": "Week title/theme",
      "topics": [
        {
          "title": "Topic title",
          "description": "1-2 sentence description of what to learn",
          "hours": number,
          "youtubeQuery": "exact YouTube search query for this topic",
          "blogUrl": "URL to official docs or a well-known tutorial site"
        }
      ]
    }
  ]
}

Rules:
- Generate exactly ${ctx.totalWeeks} weeks
- Each week: 3-5 topics
- Hours per topic should sum to roughly ${ctx.weeklyHours} per week
- YouTube queries should be specific (e.g., "AWS S3 bucket policy tutorial 2024")
- Blog URLs should point to official docs (e.g., docs.aws.amazon.com) or well-known sites (e.g., medium.com, dev.to, freecodecamp.org)
- Progress from fundamentals to advanced topics
- Include practice exams/mock tests in final weeks`;

  return aiCall(prompt, undefined, 3000, true);
}

// --- Cert Timeline Suggestion ---
export async function suggestCertTimeline(certName: string, provider: string): Promise<string> {
  const prompt = `You are an expert certification advisor.
Return ONLY valid JSON — no markdown, no preamble.

Certification: ${certName} | Provider: ${provider}

Suggest a study timeline:
{
  "totalWeeks": number (recommended weeks to prepare),
  "weeklyHours": number (recommended study hours per week),
  "difficulty": "beginner|intermediate|advanced",
  "prerequisites": ["list of recommended prerequisites"],
  "description": "1-2 sentence overview of this certification"
}`;

  return aiCall(prompt, undefined, 300, true);
}

// --- Job Roadmap Generation ---
interface RoadmapGenContext {
  hunterName: string;
  level: number;
  rank: string;
  stats: Record<string, number>;
  targetRole: string;
  experienceLevel: string;
  skills: string[];
  timeline: string;
}

export async function generateJobRoadmap(ctx: RoadmapGenContext): Promise<string> {
  const timelineWeeks = ctx.timeline === "3m" ? 12 : ctx.timeline === "6m" ? 26 : 52;

  const prompt = `You are a career coach and gamification system generating a personalized job roadmap.
Return ONLY valid JSON — no markdown, no preamble.

Target Role: ${ctx.targetRole}
Experience Level: ${ctx.experienceLevel}
Skills to develop: ${ctx.skills.join(", ") || "general skills for the role"}
Timeline: ${timelineWeeks} weeks
Hunter: ${ctx.hunterName} | Level: ${ctx.level} | Rank: ${ctx.rank}
Stats: VIT=${ctx.stats.vitality} INT=${ctx.stats.intel} HUS=${ctx.stats.hustle} WLT=${ctx.stats.wealth} FOC=${ctx.stats.focus} AIQ=${ctx.stats.agentIQ}

Generate this exact JSON:
{
  "summary": "2-3 sentence overview of this career path and what the hunter needs to focus on",
  "quests": [
    {
      "title": "specific actionable quest title for ${ctx.targetRole}",
      "category": "health|jobs|learning|food|mental|focus|finance|agentiq",
      "difficulty": "normal|hard|legendary",
      "tier": "daily|weekly|custom",
      "xpBase": number,
      "goldBase": number,
      "statTarget": "vitality|intel|hustle|wealth|focus|agentIQ",
      "statGain": 1,
      "isDaily": boolean
    }
  ],
  "dungeons": [
    {
      "title": "dungeon title (7-day challenge)",
      "description": "1-2 sentences",
      "objectives": ["objective 1", "objective 2", "objective 3", "objective 4"],
      "bonusXP": number,
      "bonusGold": number,
      "statReward": "vitality|intel|hustle|wealth|focus|agentIQ",
      "statAmount": number
    }
  ],
  "certifications": [
    {
      "certName": "exact certification name",
      "provider": "provider name",
      "totalWeeks": number,
      "weeklyHours": number,
      "goldBonus": number
    }
  ],
  "goals": [
    {
      "type": "sprint|monthly|life",
      "title": "goal title",
      "description": "1 sentence",
      "weeksFromNow": number,
      "xpReward": number,
      "goldReward": number
    }
  ],
  "recurringHabits": [
    {
      "title": "daily habit title relevant to ${ctx.targetRole}",
      "category": "health|jobs|learning|focus|agentiq",
      "priority": 0,
      "recurType": "daily|weekdays"
    }
  ],
  "questChains": [
    {
      "title": "chain title — multi-step learning path",
      "description": "1 sentence",
      "steps": [
        {
          "title": "step title",
          "category": "learning|jobs|focus|agentiq",
          "difficulty": "normal|hard",
          "xpBase": number,
          "goldBase": number,
          "statTarget": "intel|hustle|focus|agentIQ"
        }
      ]
    }
  ],
  "milestones": [
    {
      "title": "milestone title",
      "description": "what this means for career progress",
      "weekNumber": number
    }
  ]
}

Rules:
- Generate 8-12 quests (5-6 daily, 2-3 weekly, 1-2 custom). XP: 30-150 daily, 200-500 weekly
- Generate 2-3 dungeons (bonusXP: 700-1300, bonusGold: 180-350)
- Generate 2-4 relevant certifications for ${ctx.targetRole}
- Generate 4-6 goals (2 sprint, 2 monthly, 1-2 life)
- Generate 5-8 recurring daily habits specific to ${ctx.targetRole}
- Generate 1-2 quest chains with 5-7 steps each
- Generate 4-6 milestones spread across ${timelineWeeks} weeks
- All content MUST be specific to ${ctx.targetRole}, never generic
- Scale difficulty to ${ctx.experienceLevel} level
- For technical roles, bias stats toward intel/hustle/agentIQ`;

  return aiCall(prompt, undefined, 4000, true);
}

// --- Roadmap Image Extraction (Vision) ---
export async function extractRoadmapFromImage(
  imageBase64: string,
  mediaType: string,
  userHint?: string
): Promise<string> {
  const systemPrompt = `You are an expert at reading learning roadmaps and extracting structured topic lists.
You analyze roadmap images (like roadmap.sh style) and extract every topic, section, and skill mentioned.

IMPORTANT: All descriptions must be PLAIN TEXT only.
DO NOT use markdown syntax like **bold**, # headers, - bullets, or [links](url).
Use numbered lists (1. 2. 3.) and emojis for structure.
Write URLs as plain text, not as markdown links.

Return ONLY valid JSON — no markdown fences, no preamble.`;

  const prompt = `Analyze this learning roadmap image and extract ALL topics with their hierarchy.
${userHint ? `Context: This roadmap is for "${userHint}"` : ""}

Return this exact JSON structure:
{
  "title": "Detected roadmap title or career role",
  "topics": [
    {
      "section": "Section or Phase name (e.g., Fundamentals, Advanced, etc.)",
      "title": "Topic title",
      "description": "Plain text description of what to learn (1-2 sentences, no markdown)",
      "priority": "core|recommended|optional",
      "estimatedHours": number,
      "prerequisites": ["Topic X"],
      "youtubeQuery": "specific YouTube search query for learning this topic",
      "blogUrl": "URL to official docs or well-known tutorial site"
    }
  ],
  "suggestedWeeks": number,
  "suggestedHoursPerWeek": number
}

Rules:
- Extract EVERY topic visible in the roadmap
- Group topics into logical sections/phases
- Mark core/fundamental topics as "core", nice-to-haves as "recommended", extras as "optional"
- Estimate realistic study hours per topic
- YouTube queries should be specific (e.g., "learn React hooks tutorial 2025")
- Blog URLs should point to official docs or well-known sites (MDN, dev.to, freecodecamp.org, official docs)
- Suggest a realistic total timeline based on content density
- Order topics from foundational to advanced`;

  // Try Anthropic Vision first (Claude supports image content blocks)
  if (anthropic) {
    try {
      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: imageBase64,
              },
            },
            { type: "text", text: prompt },
          ],
        }],
      });
      const block = message.content[0];
      if (block.type === "text" && block.text) return block.text;
    } catch (err) {
      const error = err as Error & { status?: number; error?: { type?: string; message?: string } };
      console.warn("[AI] Anthropic Vision failed, trying Mistral fallback:", error.message);
    }
  }

  // Fallback: Mistral Vision (free tier supports vision via chat.complete)
  if (mistral) {
    try {
      console.log("[AI] Trying Mistral Vision fallback for image extraction");
      const dataUri = `data:${mediaType};base64,${imageBase64}`;
      const response = await mistral.chat.complete({
        model: MISTRAL_VISION_MODEL,
        maxTokens: 8000,
        temperature: 0.3,
        messages: [
          ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
          {
            role: "user" as const,
            content: [
              { type: "text" as const, text: prompt },
              { type: "image_url" as const, imageUrl: dataUri },
            ],
          },
        ],
      });
      const content = response.choices?.[0]?.message?.content;
      if (typeof content === "string" && content) {
        console.log("[AI] Mistral Vision extraction success, length:", content.length);
        return content;
      }
    } catch (err) {
      console.warn("[AI] Mistral Vision also failed:", (err as Error).message);
    }
  }

  console.warn("[AI] Vision extraction failed on all providers");
  return "";
}

// --- Roadmap PDF Extraction (native PDF document support) ---
// Claude API natively supports PDF via document content blocks
// This handles graphical PDFs (like roadmap.sh) where text extraction fails
export async function extractRoadmapFromPdf(
  pdfBase64: string,
  userHint?: string
): Promise<string> {
  const systemPrompt = `You are an expert at reading learning roadmaps and extracting structured topic lists.
You analyze roadmap PDFs (like roadmap.sh style) and extract every topic, section, and skill mentioned.
These PDFs are often graphical with nodes, arrows, and visual hierarchy — read ALL visible text.

IMPORTANT: All descriptions must be PLAIN TEXT only.
DO NOT use markdown syntax like **bold**, # headers, - bullets, or [links](url).
Use numbered lists (1. 2. 3.) and emojis for structure.
Write URLs as plain text, not as markdown links.

Return ONLY valid JSON — no markdown fences, no preamble.`;

  const prompt = `Analyze this learning roadmap PDF and extract ALL topics with their hierarchy.
${userHint ? `Context: This roadmap is for "${userHint}"` : ""}

Return this exact JSON structure:
{
  "title": "Detected roadmap title or career role",
  "topics": [
    {
      "section": "Section or Phase name (e.g., Fundamentals, Advanced, etc.)",
      "title": "Topic title",
      "description": "Plain text description of what to learn (1-2 sentences, no markdown)",
      "priority": "core|recommended|optional",
      "estimatedHours": number,
      "prerequisites": ["Topic X"],
      "youtubeQuery": "specific YouTube search query for learning this topic",
      "blogUrl": "URL to official docs or well-known tutorial site"
    }
  ],
  "suggestedWeeks": number,
  "suggestedHoursPerWeek": number
}

Rules:
- Extract EVERY topic visible in the roadmap, including text in boxes, nodes, and labels
- Group topics into logical sections/phases based on visual hierarchy
- Mark core/fundamental topics as "core", nice-to-haves as "recommended", extras as "optional"
- Estimate realistic study hours per topic
- YouTube queries should be specific (e.g., "learn React hooks tutorial 2025")
- Blog URLs should point to official docs or well-known sites
- Suggest a realistic total timeline based on content density
- Order topics from foundational to advanced`;

  // Send PDF directly to Claude as a document content block (proper SDK types)
  if (anthropic) {
    try {
      console.log("[AI] Attempting PDF document extraction, base64 length:", pdfBase64.length);
      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{
          role: "user" as const,
          content: [
            {
              type: "document" as const,
              source: {
                type: "base64" as const,
                media_type: "application/pdf" as const,
                data: pdfBase64,
              },
            },
            { type: "text" as const, text: prompt },
          ],
        }],
      });
      console.log("[AI] PDF extraction response received, content blocks:", message.content.length);
      const block = message.content[0];
      if (block.type === "text" && block.text) {
        console.log("[AI] PDF extraction success, response length:", block.text.length);
        return block.text;
      }
      console.warn("[AI] PDF extraction returned non-text block:", block.type);
    } catch (err) {
      const error = err as Error & { status?: number; error?: { type?: string; message?: string } };
      console.error("[AI] Anthropic PDF extraction failed, trying Mistral fallback:");
      console.error("  Status:", error.status);
      console.error("  Message:", error.message);
      console.error("  Error detail:", error.error?.message);
    }
  } else {
    console.warn("[AI] No Anthropic client available for PDF extraction");
  }

  // Fallback: Mistral OCR → extract text → then use Mistral chat for structured extraction
  if (mistral) {
    try {
      console.log("[AI] Trying Mistral OCR fallback for PDF extraction");
      const dataUri = `data:application/pdf;base64,${pdfBase64}`;
      const ocrResponse = await mistral.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "image_url",
          imageUrl: dataUri,
        },
      });

      // Collect all page markdown text
      const pageTexts = ocrResponse.pages
        .map((page) => page.markdown)
        .filter((text) => text && text.trim().length > 0);

      if (pageTexts.length > 0) {
        const fullText = pageTexts.join("\n\n---\n\n");
        console.log("[AI] Mistral OCR extracted", fullText.length, "chars from", pageTexts.length, "pages");

        // Now use Mistral chat to analyze the OCR text
        const analysisPrompt = `${prompt}\n\nExtracted text from the roadmap PDF:\n---\n${fullText.slice(0, 12000)}\n---`;
        const response = await mistral.chat.complete({
          model: MISTRAL_MODEL,
          maxTokens: 8000,
          temperature: 0.3,
          messages: [
            { role: "system" as const, content: systemPrompt },
            { role: "user" as const, content: analysisPrompt },
          ],
          responseFormat: { type: "json_object" as const },
        });
        const content = response.choices?.[0]?.message?.content;
        if (typeof content === "string" && content) {
          console.log("[AI] Mistral OCR + chat extraction success, length:", content.length);
          return content;
        }
      } else {
        console.warn("[AI] Mistral OCR returned no text from PDF pages");
      }
    } catch (err) {
      console.warn("[AI] Mistral OCR fallback failed:", (err as Error).message);
    }
  }

  console.warn("[AI] PDF document extraction failed on all providers");
  return "";
}

// --- Roadmap Text Extraction (PDF text → structured topics) ---
export async function extractRoadmapFromText(
  text: string,
  userHint?: string
): Promise<string> {
  const prompt = `You are an expert at reading learning roadmaps and extracting structured topic lists.
Analyze this roadmap text content and extract ALL topics with their hierarchy.
${userHint ? `Context: This roadmap is for "${userHint}"` : ""}

Text content:
---
${text.slice(0, 8000)}
---

Return ONLY valid JSON — no markdown fences, no preamble.

IMPORTANT: All descriptions must be PLAIN TEXT only.
DO NOT use markdown syntax like **bold**, # headers, - bullets, or [links](url).

Required JSON structure:
{
  "title": "Detected roadmap title or career role",
  "topics": [
    {
      "section": "Section or Phase name",
      "title": "Topic title",
      "description": "Plain text description of what to learn (1-2 sentences, no markdown)",
      "priority": "core|recommended|optional",
      "estimatedHours": number,
      "prerequisites": ["Topic X"],
      "youtubeQuery": "specific YouTube search query for learning this topic",
      "blogUrl": "URL to official docs or well-known tutorial site"
    }
  ],
  "suggestedWeeks": number,
  "suggestedHoursPerWeek": number
}

Rules:
- Extract EVERY topic from the text
- Group into logical sections/phases
- Mark fundamentals as "core", nice-to-haves as "recommended", extras as "optional"
- Estimate realistic study hours per topic
- YouTube queries should be specific
- Blog URLs should point to official docs or well-known sites
- Order topics from foundational to advanced`;

  return aiCall(prompt, undefined, 4000, true);
}
