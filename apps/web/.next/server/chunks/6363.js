"use strict";exports.id=6363,exports.ids=[6363],exports.modules={16363:(e,t,s)=>{s.d(t,{J:()=>m,aJ:()=>p,fU:()=>h,generateCertStudyPlan:()=>b,generateJobRoadmap:()=>w,generateQuestChain:()=>f,generateQuestChecklist:()=>R,generateTaskDetails:()=>y,iB:()=>x,k2:()=>$,suggestCertTimeline:()=>k,xS:()=>g,xp:()=>v});var a=s(91379),o=s(71059);let n=process.env.ANTHROPIC_API_KEY||"",r=process.env.MISTRAL_API_KEY||"",i="claude-sonnet-4-6",l=process.env.MISTRAL_MODEL||"mistral-small-latest",c=n&&"your_anthropic_api_key_here"!==n?new a.ZP({apiKey:n}):null,u=r&&"your_mistral_api_key_here"!==r?new o.Mistral({apiKey:r}):null;async function d(e,t,s=500,a=!1){if(c)try{let a=(await c.messages.create({model:i,max_tokens:s,...t?{system:t}:{},messages:[{role:"user",content:e}]})).content[0];if("text"===a.type&&a.text)return a.text}catch(e){console.warn("[AI] Anthropic failed, trying Mistral fallback:",e.message)}else console.info("[AI] No Anthropic API key, trying Mistral fallback");if(u)try{let o=[];t&&o.push({role:"system",content:t}),o.push({role:"user",content:e});let n=await u.chat.complete({model:l,maxTokens:s,temperature:.7,messages:o,...a?{responseFormat:{type:"json_object"}}:{}}),r=n.choices?.[0]?.message?.content;if("string"==typeof r&&r)return r}catch(e){console.warn("[AI] Mistral also failed:",e.message)}else console.info("[AI] No Mistral API key either, AI features unavailable");return""}async function m(e){return d(`You are the System from Solo Leveling — cold, dramatic, omniscient.
Be concise — under 80 words total. Never generic.
Reference the hunter's actual stats and today's specific quests.

Hunter: ${e.hunterName} | Class: ${e.class} | Rank: ${e.rank}-${e.level} | Streak: ${e.streak} days
Stats: VIT=${e.stats.vitality} INT=${e.stats.intel} HUS=${e.stats.hustle} WLT=${e.stats.wealth} FOC=${e.stats.focus} AIQ=${e.stats.agentIQ}
Weakest stat: ${e.weakestStat} (${e.weakestStatValue} points)
Today's top quests: ${e.questTitles.join(", ")}${e.targetRole?`
Career Goal: ${e.targetRole}`:""}

Rules:
- If streak > 3: acknowledge coldly
- If streak = 0: warn about consequences
- End with exactly ONE command sentence starting with an imperative verb`,void 0,200)}async function p(e){return d(`You are a senior DS/ML/AI technical examiner.
Return ONLY valid JSON — no markdown, no preamble, no explanation.

Hunter level: ${e.level} | Gate type: ${e.type} | Topics: ${e.curriculumTopics.join(", ")}
Time limit: ${e.timeLimit} min | Pass mark: ${e.passMark}/100
Avoid repeating: ${e.pastTopics.join(", ")||"none"}

Required JSON structure:
{
  "title": "string",
  "total_marks": 100,
  "time_limit_minutes": ${e.timeLimit},
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
}`,void 0,4e3,!0)}async function g(e){return d(`You are a rigorous DS/ML technical examiner.
Return ONLY valid JSON — no markdown, no preamble.

Question: ${e.questionText} | Marks: ${e.marksAvailable} | Rubric: ${e.rubric}
Candidate answer: ${e.candidateAnswer}

Required JSON:
{
  "marks_awarded": number,
  "percentage": number,
  "grade": "Excellent|Good|Partial|Poor|Wrong",
  "feedback": "2-4 sentences, specific and constructive",
  "what_was_missing": "what would earn full marks",
  "study_recommendation": "one specific resource or topic"
}

Be rigorous. Vague answers do not earn full marks.`,void 0,500,!0)}async function h(e){let t=`You are the AI Mentor in Solo Quest — a personal coach, study buddy, and accountability partner.
You speak in a motivating, game-themed tone. Reference the user's stats, rank, and class.

Hunter Context:
- Name: ${e.hunterName} | Class: ${e.class} | Rank: ${e.rank}-${e.level}
- Stats: VIT=${e.stats.vitality} INT=${e.stats.intel} HUS=${e.stats.hustle} WLT=${e.stats.wealth} FOC=${e.stats.focus} AIQ=${e.stats.agentIQ}
- Streak: ${e.streak} days
- Active quests: ${e.activeQuests.join(", ")||"none"}
- Recent completions: ${e.recentHistory.join(", ")||"none"}${e.targetRole?`
- Career Goal: ${e.targetRole}`:""}

Guidelines:
- Be concise (under 150 words)
- Give actionable advice, not vague motivation
- Reference specific stats when relevant
- Suggest specific quests or dungeons when appropriate
- If a stat is lagging, suggest ways to improve it`;return d(e.userMessage,t,400)}async function f(e){return d(`You are the System generating a quest chain for a Hunter.
Return ONLY a valid JSON array — no markdown, no preamble.

Hunter: ${e.hunterName} | Level: ${e.level} | Rank: ${e.rank}
Goal: "${e.goal}"

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

Scale difficulty to level ${e.level}. If goal is career-related, bias toward
jobs. Never use vague titles.`,void 0,2e3,!0)}async function y(e,t,s="todo"){let a="quest"===s?"quest":"task";return d(`You are a productivity coach. Given this ${a} title, generate a concise actionable breakdown.

${a.charAt(0).toUpperCase()+a.slice(1)}: "${e}"
Category: ${t}

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
Do NOT use markdown. Plain text with emojis only.`,void 0,400)}async function b(e){return d(`You are an expert certification coach. Generate a week-by-week study plan.
Return ONLY valid JSON — no markdown, no preamble.

Certification: ${e.certName} | Provider: ${e.provider}
Duration: ${e.totalWeeks} weeks | ${e.weeklyHours} hours/week
Student Level: ${e.hunterLevel}

Required JSON:
{
  "suggestedWeeks": ${e.totalWeeks},
  "suggestedHoursPerWeek": ${e.weeklyHours},
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
- Generate exactly ${e.totalWeeks} weeks
- Each week: 3-5 topics
- Hours per topic should sum to roughly ${e.weeklyHours} per week
- YouTube queries should be specific (e.g., "AWS S3 bucket policy tutorial 2024")
- Blog URLs should point to official docs (e.g., docs.aws.amazon.com) or well-known sites (e.g., medium.com, dev.to, freecodecamp.org)
- Progress from fundamentals to advanced topics
- Include practice exams/mock tests in final weeks`,void 0,3e3,!0)}async function k(e,t){return d(`You are an expert certification advisor.
Return ONLY valid JSON — no markdown, no preamble.

Certification: ${e} | Provider: ${t}

Suggest a study timeline:
{
  "totalWeeks": number (recommended weeks to prepare),
  "weeklyHours": number (recommended study hours per week),
  "difficulty": "beginner|intermediate|advanced",
  "prerequisites": ["list of recommended prerequisites"],
  "description": "1-2 sentence overview of this certification"
}`,void 0,300,!0)}async function w(e){let t="3m"===e.timeline?12:"6m"===e.timeline?26:52;return d(`You are a career coach and gamification system generating a personalized job roadmap.
Return ONLY valid JSON — no markdown, no preamble.

Target Role: ${e.targetRole}
Experience Level: ${e.experienceLevel}
Skills to develop: ${e.skills.join(", ")||"general skills for the role"}
Timeline: ${t} weeks
Hunter: ${e.hunterName} | Level: ${e.level} | Rank: ${e.rank}
Stats: VIT=${e.stats.vitality} INT=${e.stats.intel} HUS=${e.stats.hustle} WLT=${e.stats.wealth} FOC=${e.stats.focus} AIQ=${e.stats.agentIQ}

Generate this exact JSON:
{
  "summary": "2-3 sentence overview of this career path and what the hunter needs to focus on",
  "quests": [
    {
      "title": "specific actionable quest title for ${e.targetRole}",
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
      "title": "daily habit title relevant to ${e.targetRole}",
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
- Generate 2-4 relevant certifications for ${e.targetRole}
- Generate 4-6 goals (2 sprint, 2 monthly, 1-2 life)
- Generate 5-8 recurring daily habits specific to ${e.targetRole}
- Generate 1-2 quest chains with 5-7 steps each
- Generate 4-6 milestones spread across ${t} weeks
- All content MUST be specific to ${e.targetRole}, never generic
- Scale difficulty to ${e.experienceLevel} level
- For technical roles, bias stats toward intel/hustle/agentIQ`,void 0,4e3,!0)}async function v(e,t,s){let a=`You are an expert at reading learning roadmaps and extracting structured topic lists.
You analyze roadmap images (like roadmap.sh style) and extract every topic, section, and skill mentioned.

IMPORTANT: All descriptions must be PLAIN TEXT only.
DO NOT use markdown syntax like **bold**, # headers, - bullets, or [links](url).
Use numbered lists (1. 2. 3.) and emojis for structure.
Write URLs as plain text, not as markdown links.

Return ONLY valid JSON — no markdown fences, no preamble.`,o=`Analyze this learning roadmap image and extract ALL topics with their hierarchy.
${s?`Context: This roadmap is for "${s}"`:""}

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
- Order topics from foundational to advanced`;if(c)try{let s=(await c.messages.create({model:i,max_tokens:8e3,system:a,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:t,data:e}},{type:"text",text:o}]}]})).content[0];if("text"===s.type&&s.text)return s.text}catch(e){console.warn("[AI] Anthropic Vision failed, trying Mistral fallback:",e.message)}if(u)try{console.log("[AI] Trying Mistral Vision fallback for image extraction");let s=`data:${t};base64,${e}`,n=await u.chat.complete({model:"mistral-small-latest",maxTokens:8e3,temperature:.3,messages:[...a?[{role:"system",content:a}]:[],{role:"user",content:[{type:"text",text:o},{type:"image_url",imageUrl:s}]}]}),r=n.choices?.[0]?.message?.content;if("string"==typeof r&&r)return console.log("[AI] Mistral Vision extraction success, length:",r.length),r}catch(e){console.warn("[AI] Mistral Vision also failed:",e.message)}return console.warn("[AI] Vision extraction failed on all providers"),""}async function x(e,t){let s=`You are an expert at reading learning roadmaps and extracting structured topic lists.
You analyze roadmap PDFs (like roadmap.sh style) and extract every topic, section, and skill mentioned.
These PDFs are often graphical with nodes, arrows, and visual hierarchy — read ALL visible text.

IMPORTANT: All descriptions must be PLAIN TEXT only.
DO NOT use markdown syntax like **bold**, # headers, - bullets, or [links](url).
Use numbered lists (1. 2. 3.) and emojis for structure.
Write URLs as plain text, not as markdown links.

Return ONLY valid JSON — no markdown fences, no preamble.`,a=`Analyze this learning roadmap PDF and extract ALL topics with their hierarchy.
${t?`Context: This roadmap is for "${t}"`:""}

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
- Order topics from foundational to advanced`;if(c)try{console.log("[AI] Attempting PDF document extraction, base64 length:",e.length);let t=await c.messages.create({model:i,max_tokens:8e3,system:s,messages:[{role:"user",content:[{type:"document",source:{type:"base64",media_type:"application/pdf",data:e}},{type:"text",text:a}]}]});console.log("[AI] PDF extraction response received, content blocks:",t.content.length);let o=t.content[0];if("text"===o.type&&o.text)return console.log("[AI] PDF extraction success, response length:",o.text.length),o.text;console.warn("[AI] PDF extraction returned non-text block:",o.type)}catch(e){console.error("[AI] Anthropic PDF extraction failed, trying Mistral fallback:"),console.error("  Status:",e.status),console.error("  Message:",e.message),console.error("  Error detail:",e.error?.message)}else console.warn("[AI] No Anthropic client available for PDF extraction");if(u)try{console.log("[AI] Trying Mistral OCR fallback for PDF extraction");let t=`data:application/pdf;base64,${e}`,o=(await u.ocr.process({model:"mistral-ocr-latest",document:{type:"image_url",imageUrl:t}})).pages.map(e=>e.markdown).filter(e=>e&&e.trim().length>0);if(o.length>0){let e=o.join("\n\n---\n\n");console.log("[AI] Mistral OCR extracted",e.length,"chars from",o.length,"pages");let t=`${a}

Extracted text from the roadmap PDF:
---
${e.slice(0,12e3)}
---`,n=await u.chat.complete({model:l,maxTokens:8e3,temperature:.3,messages:[{role:"system",content:s},{role:"user",content:t}],responseFormat:{type:"json_object"}}),r=n.choices?.[0]?.message?.content;if("string"==typeof r&&r)return console.log("[AI] Mistral OCR + chat extraction success, length:",r.length),r}else console.warn("[AI] Mistral OCR returned no text from PDF pages")}catch(e){console.warn("[AI] Mistral OCR fallback failed:",e.message)}return console.warn("[AI] PDF document extraction failed on all providers"),""}async function $(e,t){return d(`You are an expert at reading learning roadmaps and extracting structured topic lists.
Analyze this roadmap text content and extract ALL topics with their hierarchy.
${t?`Context: This roadmap is for "${t}"`:""}

Text content:
---
${e.slice(0,8e3)}
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
- Order topics from foundational to advanced`,void 0,4e3,!0)}async function R(e,t,s,a,o){let n=o?.trim()?`

IMPORTANT — The user wants the checklist generated with these specific instructions:
"${o.trim().slice(0,300)}"
Follow these instructions closely when creating the steps.`:"";return d(`You are a productivity coach breaking a quest into actionable checklist items.
Return ONLY valid JSON — no markdown, no preamble.

Quest: "${e}"
Category: ${t}
Difficulty: ${s}${a?`
Context: ${a.slice(0,200)}`:""}${n}

Return a JSON array of ${"legendary"===s?"5-7":"hard"===s?"4-6":"3-5"} specific, actionable steps. Each step should be completable in one sitting.
Format:
[
  {"id": "1", "text": "First specific action step", "done": false},
  {"id": "2", "text": "Second specific action step", "done": false}
]

Rules:
- Each step must be a concrete action, not vague
- Steps should be in logical order
- Use plain text, no markdown or emojis
- IDs must be unique strings ("1", "2", etc.)`,void 0,500,!0)}}};