// lib/quest-details.ts — Rich detail metadata for quests and dungeons
// Provides step-by-step breakdowns, tips, estimated time, and strategy

export interface QuestDetail {
  steps: string[];
  tips: string[];
  estimatedTime: string;
  whyItMatters: string;
  difficulty: { label: string; color: string; stars: number };
  tools?: string[];
}

export interface DungeonDetail {
  strategy: string[];
  dailyBreakdown: { day: string; tasks: string[] }[];
  tips: string[];
  estimatedHoursPerDay: string;
  prerequisiteSkills: string[];
  failConditions: string[];
  successCriteria: string;
}

// --- QUEST DETAILS ---
const questDetails: Record<string, QuestDetail> = {
  // ===== HEALTH & VITALITY =====
  "Morning Workout (30+ min)": {
    steps: [
      "Choose your workout type: strength, cardio, or hybrid",
      "Warm up for 5 minutes (dynamic stretches, jumping jacks)",
      "Complete your main workout (20-25 min at moderate-high intensity)",
      "Cool down with static stretches (5 min)",
      "Log your workout in a fitness app or journal",
    ],
    tips: [
      "Follow a program like PPL, 5/3/1, or Couch to 5K for structure",
      "Morning workouts boost cortisol and set energy for the day",
      "If low motivation, commit to just 10 min — you'll usually keep going",
    ],
    estimatedTime: "30-45 min",
    whyItMatters: "Physical fitness directly impacts mental clarity, energy levels, and discipline — the foundation of every other stat.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
    tools: ["Fitness app", "Timer", "Gym or home equipment"],
  },
  "Walk 8,000+ Steps": {
    steps: [
      "Check your current step count on your phone/watch",
      "Plan walking opportunities: morning walk, lunch break, evening stroll",
      "Take calls while walking when possible",
      "Use stairs instead of elevators",
      "Track progress throughout the day",
    ],
    tips: [
      "A 30-min walk ≈ 3,500 steps. Two walks gets you there",
      "Walking meetings or phone calls double your productivity",
      "Listen to podcasts or audiobooks to make walks feel shorter",
    ],
    estimatedTime: "60-90 min (spread across the day)",
    whyItMatters: "Low-impact cardio that reduces stress, improves cardiovascular health, and gives you thinking time away from screens.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
    tools: ["Step counter", "Comfortable shoes"],
  },
  "Drink 8 Glasses of Water": {
    steps: [
      "Fill a large water bottle (750ml-1L) in the morning",
      "Drink 1 glass immediately after waking up",
      "Set hourly reminders if needed",
      "Drink before meals, not during",
      "Refill your bottle at least twice during the day",
      "Track your intake (tally marks on a sticky note works)",
    ],
    tips: [
      "Keep a water bottle at your desk — visibility = habit trigger",
      "If plain water is boring, add lemon, cucumber, or mint",
      "You need more water if you exercise or drink coffee",
    ],
    estimatedTime: "2 min per glass (all day)",
    whyItMatters: "Even mild dehydration reduces cognitive performance by 15-25%. Hydration is the cheapest performance enhancer.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 1 },
    tools: ["Water bottle", "Reminder app (optional)"],
  },
  "Sleep Before 11:30 PM": {
    steps: [
      "Set a 10:30 PM wind-down alarm on your phone",
      "Stop all screens by 10:30 PM (blue light blocks melatonin)",
      "Dim lights, read a physical book, or do light stretching",
      "Prepare tomorrow's clothes and bag",
      "Be in bed with eyes closed by 11:15 PM",
      "Use a sleep tracking app to verify",
    ],
    tips: [
      "The #1 productivity hack is consistent sleep — protect it aggressively",
      "Avoid caffeine after 2 PM and heavy meals after 8 PM",
      "Keep your room cool (18-20°C) and dark for optimal sleep quality",
    ],
    estimatedTime: "60 min wind-down routine",
    whyItMatters: "Sleep deprivation destroys willpower, memory consolidation, and immune function. Everything else falls apart without this.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
  },
  "Cook a Healthy Meal": {
    steps: [
      "Plan your meal: protein + vegetable + complex carb",
      "Check ingredients — meal prep or quick shop if needed",
      "Cook the meal (aim for under 30 min with practice)",
      "Plate it properly (portion control matters)",
      "Clean up kitchen immediately after eating",
    ],
    tips: [
      "Batch-cook proteins (chicken, rice, beans) on Sundays for the week",
      "Start with 5 go-to recipes you can make from memory",
      "Each home-cooked meal saves ₹200-500 vs ordering out",
    ],
    estimatedTime: "30-60 min",
    whyItMatters: "Cooking teaches patience, saves money (wealth stat), and gives you control over nutrition (vitality stat). Triple benefit.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
    tools: ["Basic cookware", "Grocery list", "Recipe app"],
  },
  "No Junk Food Today": {
    steps: [
      "Plan all 3 meals + 2 snacks for the day in advance",
      "Remove junk food from visible places (out of sight, out of mind)",
      "Prepare healthy snacks: nuts, fruits, yogurt, boiled eggs",
      "If craving hits, drink water and wait 15 minutes",
      "Track everything you eat today for accountability",
    ],
    tips: [
      "You can't eat what you don't buy — control happens at the grocery store",
      "Cravings last 15-20 minutes. Ride them out with water or a walk",
      "Don't go grocery shopping when hungry",
    ],
    estimatedTime: "All day (vigilance)",
    whyItMatters: "Discipline with food transfers to discipline everywhere. If you can say no to junk food, you can say no to distractions.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
  },
  "Stretch / Yoga (15 min)": {
    steps: [
      "Find a quiet space with a mat or soft surface",
      "Start with neck and shoulder rolls (2 min)",
      "Do full-body stretches: hamstrings, hip flexors, back, chest",
      "Hold each stretch 20-30 seconds, breathe deeply",
      "End with child's pose or savasana (1 min)",
    ],
    tips: [
      "YouTube has great 15-min yoga routines — follow along videos are easier",
      "Do this right after waking up or before bed for best results",
      "Focus on hip flexors and shoulders — they tighten from desk work",
    ],
    estimatedTime: "15 min",
    whyItMatters: "Flexibility and mobility prevent injuries, reduce back pain from sitting, and improve posture for confidence.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 1 },
    tools: ["Yoga mat", "YouTube (follow-along video)"],
  },
  "Meditate (10 min)": {
    steps: [
      "Sit comfortably — chair or floor, spine straight",
      "Close your eyes and take 3 deep breaths",
      "Focus attention on your breath (nose or belly)",
      "When mind wanders (it will), gently return to breath",
      "Continue for 10 minutes without judgment",
      "End with 3 deep breaths and open your eyes",
    ],
    tips: [
      "Use apps like Headspace or Insight Timer for guided sessions",
      "Don't aim for 'empty mind' — the goal is noticing thoughts, not stopping them",
      "Consistency beats duration. 10 min daily > 60 min once a week",
    ],
    estimatedTime: "10 min",
    whyItMatters: "Meditation builds the Focus stat directly — it's literally attention training. 8 weeks of daily practice measurably changes brain structure.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 1 },
    tools: ["Timer", "Quiet space", "Meditation app (optional)"],
  },

  // ===== JOB SEARCH & HUSTLE =====
  "Apply to 3 Jobs": {
    steps: [
      "Open your job tracker spreadsheet / app",
      "Search on LinkedIn, Indeed, company career pages for matching roles",
      "For each role: read the full JD, identify 3-4 keyword matches to your resume",
      "Tailor your resume's bullet points for each application",
      "Submit application with tailored resume + cover letter",
      "Log each application: company, role, date, link, status",
    ],
    tips: [
      "Quality over quantity — 3 tailored apps > 10 spray-and-pray",
      "Apply to roles where you meet 60-70% of requirements, not 100%",
      "Set up job alerts for 'Data Scientist', 'ML Engineer', 'AI Engineer'",
      "Track referral contacts at each company",
    ],
    estimatedTime: "90-120 min",
    whyItMatters: "Job search is a numbers game, but a strategic one. Consistent daily applications compound — 3/day = 90/month = real momentum.",
    difficulty: { label: "Hard", color: "text-orange-600", stars: 3 },
    tools: ["Job tracker (Notion/Sheets)", "Resume (multiple versions)", "LinkedIn"],
  },
  "Tailor Resume for a Role": {
    steps: [
      "Read the job description 3 times — highlight key skills and requirements",
      "Map your experience to their requirements (make a 2-column comparison)",
      "Rewrite 3-5 bullet points using their exact keywords",
      "Adjust your summary/objective to match the role title",
      "Proofread for typos and format consistency",
      "Save as PDF with naming convention: YourName_Role_Company.pdf",
    ],
    tips: [
      "Use the STAR format: Situation → Task → Action → Result",
      "Include metrics wherever possible: 'Improved X by Y%'",
      "ATS scanners match keywords — use words from the JD verbatim",
    ],
    estimatedTime: "30-45 min",
    whyItMatters: "A tailored resume gets 3x more callbacks than a generic one. This is the highest-ROI job search activity.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
    tools: ["Resume template", "Job description", "Word/Docs"],
  },
  "Write a Cover Letter": {
    steps: [
      "Research the company: mission, recent news, culture",
      "Open with a hook — why THIS company specifically",
      "Paragraph 2: Your most relevant achievement (with metrics)",
      "Paragraph 3: How your skills solve their specific problems",
      "Close with enthusiasm and a call to action",
      "Keep it under 300 words — brevity shows respect for their time",
    ],
    tips: [
      "Never use 'To Whom It May Concern' — find the hiring manager's name",
      "Address a specific problem the company has and show how you'd solve it",
      "A great cover letter feels like a conversation, not a formal letter",
    ],
    estimatedTime: "30-45 min",
    whyItMatters: "Cover letters show effort and communication skills. They differentiate you from the 90% who skip them.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
  },
  "Network: Send 3 LinkedIn Messages": {
    steps: [
      "Identify 3 people: recruiters, hiring managers, or team members at target companies",
      "Personalize each message: mention their work, a shared connection, or a specific post they made",
      "Keep it concise (3-4 sentences max)",
      "Ask a specific question or request, not a generic 'coffee chat'",
      "Follow up if no reply after 5-7 days (1 polite follow-up only)",
    ],
    tips: [
      "Comment on their posts for 1-2 weeks before messaging — warm leads convert better",
      "Template: 'Hi [Name], I noticed [specific thing]. I'm working on [relevant project]. Would love to ask about [specific question].'",
      "Focus on giving value, not just asking for help",
    ],
    estimatedTime: "20-30 min",
    whyItMatters: "80% of jobs are filled through networking. Every message is a seed that might grow into an opportunity months later.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
    tools: ["LinkedIn", "Company research"],
  },
  "Practice STAR Interview Answer": {
    steps: [
      "Pick a common behavioral question (e.g., 'Tell me about a time you failed')",
      "Write your STAR answer: Situation (2 sentences), Task (1 sentence), Action (3-4 sentences), Result (1-2 sentences with metrics)",
      "Practice saying it out loud 3 times (record yourself)",
      "Time it — aim for 90-120 seconds",
      "Get feedback from a friend or AI mentor",
    ],
    tips: [
      "Top 5 questions to prepare: failure, conflict, leadership, tight deadline, disagreement",
      "Always end with quantified results: saved $X, improved Y%, reduced Z time",
      "Your stories should highlight the skills in the job description",
    ],
    estimatedTime: "20-30 min",
    whyItMatters: "Interview skills are like muscles — they atrophy without practice. One polished STAR answer can win you the offer.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
  },
  "Research 2 Target Companies": {
    steps: [
      "Pick 2 companies from your application list",
      "Read their 'About' page, mission, and recent news/blog posts",
      "Check Glassdoor for interview questions and culture reviews",
      "Find the team you'd join on LinkedIn — note their tech stack",
      "Write 3 talking points per company (for interviews)",
      "Save notes in your job tracker",
    ],
    tips: [
      "Follow the companies on LinkedIn to see their content in your feed",
      "Check if they recently raised funding, launched products, or hired leadership",
      "Knowing their challenges helps you pitch yourself as the solution",
    ],
    estimatedTime: "30-40 min",
    whyItMatters: "Researched candidates get 2x more second-round interviews. Interviewers can tell when you've done homework.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
  },
  "Update LinkedIn Profile Section": {
    steps: [
      "Choose one section to improve: headline, about, experience, or skills",
      "Headline: Use format 'Role | Specialty | What You Do' (120 chars max)",
      "About: Tell your story in 3 paragraphs — past, present, future direction",
      "Experience: Add quantified bullet points using action verbs",
      "Add or reorder skills — top 3 skills get endorsement requests",
    ],
    tips: [
      "Include industry keywords so recruiters find you in search",
      "A professional headshot gets 14x more profile views",
      "Post or engage with content 2-3x/week to boost visibility",
    ],
    estimatedTime: "20-30 min",
    whyItMatters: "Your LinkedIn profile is your 24/7 recruiter. 95% of recruiters use LinkedIn to source candidates.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 1 },
  },
  "Follow Up on Application": {
    steps: [
      "Check your application tracker for apps submitted 5-7 days ago",
      "Find the recruiter or hiring manager's email/LinkedIn",
      "Send a brief follow-up: reference the role, express continued interest, add one new detail",
      "Keep it to 3-4 sentences maximum",
      "Mark the follow-up date in your tracker",
    ],
    tips: [
      "Template: 'Hi [Name], I applied for [Role] on [date]. Since then, I've [new relevant thing]. Still very interested — happy to discuss.'",
      "Only follow up once. Multiple follow-ups look desperate",
      "Following up can move your application from the 'maybe' to 'interview' pile",
    ],
    estimatedTime: "10-15 min",
    whyItMatters: "Recruiters review hundreds of applications. A polite follow-up puts your name back on top of the pile.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 1 },
  },

  // ===== STUDY & INTELLIGENCE =====
  "Solve 1 LeetCode Problem": {
    steps: [
      "Pick a problem matching your current level (Easy → Medium → Hard)",
      "Read the problem twice — understand inputs, outputs, and constraints",
      "Think for 10-15 min before writing code (plan your approach on paper)",
      "Code the solution — focus on correctness first, optimization second",
      "Test with edge cases (empty input, single element, large input)",
      "If stuck after 25 min, read the solution and implement it from memory",
      "Write a 2-line note on the pattern/technique used",
    ],
    tips: [
      "Follow the Blind 75 or NeetCode 150 list for structured practice",
      "Focus on patterns: Two Pointers, Sliding Window, DFS/BFS, DP",
      "Redo problems you struggled with after 3-7 days (spaced repetition)",
    ],
    estimatedTime: "30-60 min",
    whyItMatters: "DSA skills are the gatekeeper for technical interviews. Consistent daily practice builds pattern recognition that pure cramming can't match.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
    tools: ["LeetCode", "NeetCode.io", "Paper for diagrams"],
  },
  "Study Cert Material (1 hr)": {
    steps: [
      "Open your certification study plan — find today's module/chapter",
      "Set a timer for 25-min Pomodoro blocks",
      "Read/watch the material actively — take notes, don't just highlight",
      "After each section, write 3 key takeaways from memory (active recall)",
      "Do practice questions for the section if available",
      "Update your progress tracker",
    ],
    tips: [
      "Active recall + spaced repetition = the two most effective study techniques",
      "Use Anki flashcards for key concepts and revisit them daily",
      "Schedule study at the same time daily — build a habit loop",
    ],
    estimatedTime: "60 min",
    whyItMatters: "Certifications signal commitment and verified knowledge to employers. They're one of the few things that objectively prove your skills.",
    difficulty: { label: "Hard", color: "text-orange-600", stars: 3 },
    tools: ["Study materials", "Anki", "Practice tests", "Timer"],
  },
  "Complete 1 SQL Challenge": {
    steps: [
      "Pick a challenge from HackerRank SQL, LeetCode Database, or Mode Analytics",
      "Read the problem — understand the schema and expected output",
      "Write your query step by step: start with FROM, then WHERE, then SELECT",
      "Test with the provided test cases",
      "Optimize: check execution plan, add proper JOINs, avoid subqueries when possible",
      "Note the SQL pattern used (window function, CTE, self-join, etc.)",
    ],
    tips: [
      "Master these in order: JOINs → GROUP BY → Window Functions → CTEs → Subqueries",
      "Real interview SQL focuses on: aggregation, ranking, date manipulation, self-joins",
      "Write each query on paper first before typing — it builds understanding",
    ],
    estimatedTime: "20-30 min",
    whyItMatters: "SQL is used in 90% of data roles. Strong SQL skills are often the difference between passing and failing technical screens.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
    tools: ["HackerRank", "LeetCode", "Mode Analytics"],
  },
  "Read 30 Pages (Tech Book)": {
    steps: [
      "Choose your current tech book (DDIA, Clean Code, Hands-On ML, etc.)",
      "Find a quiet, distraction-free space",
      "Set a 30-45 min timer",
      "Read actively: underline, annotate, question what you read",
      "After every 10 pages, pause and summarize what you learned",
      "Add key concepts to your notes or flashcards",
    ],
    tips: [
      "Read with a pen — passive reading has near-zero retention",
      "Best tech books: DDIA (systems), Clean Code (eng), ISLR (ML), Cracking the Coding Interview",
      "Read in the morning when your brain is freshest",
    ],
    estimatedTime: "30-45 min",
    whyItMatters: "Deep technical reading builds mental models that tutorials and courses can't. Books give you the 'why' behind the 'how'.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
  },
  "Watch Tech Tutorial (45 min)": {
    steps: [
      "Choose a tutorial on a topic you're actively learning",
      "Code along — don't just watch passively",
      "Pause after each concept and explain it to yourself (Feynman technique)",
      "Take notes on new patterns or syntax you learn",
      "After the video, build something small using the new concept",
    ],
    tips: [
      "1.5x speed for familiar topics, 1x for brand new concepts",
      "YouTube > paid courses for most topics (except structured bootcamps)",
      "Best channels: Fireship, 3Blue1Brown, Andrej Karpathy, StatQuest",
    ],
    estimatedTime: "45-60 min",
    whyItMatters: "Video tutorials are great for visual learners and seeing real workflows. Pairing them with hands-on coding makes knowledge stick.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 1 },
  },
  "Write Technical Notes / Blog": {
    steps: [
      "Pick a concept you learned today or this week",
      "Write the explanation as if teaching someone 1 level below you",
      "Include: what it is, why it matters, a code example, and a gotcha/pitfall",
      "Use diagrams or pseudocode to clarify complex ideas",
      "Publish on your blog, GitHub, or Notion (even private notes count)",
    ],
    tips: [
      "Writing is the best test of understanding — if you can't explain it, you don't know it",
      "Technical blogs on your GitHub profile impress interviewers",
      "Keep a running 'Today I Learned' (TIL) document — low friction, high value",
    ],
    estimatedTime: "30-45 min",
    whyItMatters: "Teaching is the most effective form of learning (90% retention vs 10% for reading). Plus, it builds your public portfolio.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
    tools: ["Notion / Obsidian", "GitHub", "Blog platform"],
  },
  "Practice System Design (30 min)": {
    steps: [
      "Pick a system design problem (URL shortener, chat system, news feed, etc.)",
      "Spend 5 min clarifying requirements and estimating scale",
      "Draw the high-level architecture (load balancer, services, databases, caches)",
      "Deep-dive into one component (database schema, API design, or scaling strategy)",
      "Identify bottlenecks and propose solutions",
      "Compare your design with a reference solution online",
    ],
    tips: [
      "Start with Alex Xu's 'System Design Interview' book for frameworks",
      "Always discuss trade-offs: consistency vs availability, latency vs throughput",
      "Practice talking through your design out loud — interviews are verbal",
    ],
    estimatedTime: "30-45 min",
    whyItMatters: "System design is the most heavily weighted interview round for senior roles. It tests breadth of knowledge and architectural thinking.",
    difficulty: { label: "Hard", color: "text-orange-600", stars: 3 },
    tools: ["Whiteboard / Excalidraw", "System Design Interview book"],
  },
  "ML / AI Concept Deep Dive": {
    steps: [
      "Choose a concept: transformers, gradient boosting, RAG, embeddings, etc.",
      "Read the original paper or a high-quality tutorial (Papers With Code, Jay Alammar)",
      "Implement a minimal version from scratch (even just pseudocode)",
      "Write a summary explaining: intuition, math, use cases, limitations",
      "Find a Kaggle notebook or GitHub project that uses this concept",
    ],
    tips: [
      "Understanding > memorization. Focus on 'why does this work' not just 'how to use it'",
      "Best resources: Jay Alammar (visual), 3Blue1Brown (math), Papers With Code (research)",
      "Connect concepts to interview questions you might be asked",
    ],
    estimatedTime: "45-60 min",
    whyItMatters: "Deep understanding of ML/AI concepts separates engineers who can solve novel problems from those who only run existing code.",
    difficulty: { label: "Hard", color: "text-orange-600", stars: 3 },
    tools: ["Papers With Code", "Jupyter Notebook", "arXiv"],
  },

  // ===== FINANCIAL DISCIPLINE & WEALTH =====
  "Log Every Expense Today": {
    steps: [
      "Open your expense tracker (app, spreadsheet, or notebook)",
      "Log every purchase immediately after it happens — don't batch at night",
      "Categorize each expense: food, transport, subscriptions, entertainment, essentials",
      "Note if each expense was 'need' or 'want'",
      "At day's end, review total spending and compare to your daily budget",
    ],
    tips: [
      "Use a simple app — Splitwise, Money Manager, or a Google Sheet",
      "The act of logging reduces spending by 15-20% (awareness effect)",
      "Review weekly to spot patterns: where's the money leaking?",
    ],
    estimatedTime: "5 min (spread through day)",
    whyItMatters: "You can't manage what you don't measure. Expense tracking is step zero of financial discipline.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 1 },
    tools: ["Expense tracker app", "Spreadsheet"],
  },
  "No Unnecessary Spending": {
    steps: [
      "Define 'unnecessary' for today: no food delivery, no impulse purchases, no subscriptions you don't use",
      "Before any purchase, apply the 24-hour rule (wait 24h for anything over ₹500)",
      "Carry only the cash you need — leave cards at home if possible",
      "Cook meals instead of ordering out",
      "Track every temptation you resisted — celebrate the wins",
    ],
    tips: [
      "Unsubscribe from marketing emails — they create false 'needs'",
      "Remove saved credit cards from online shopping sites",
      "Ask: 'Would I still want this if it weren't on sale?'",
    ],
    estimatedTime: "All day (discipline)",
    whyItMatters: "Small daily savings compound massively. ₹300/day saved = ₹9,000/month = ₹1,08,000/year. That's real money.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
  },
  "Transfer to Savings": {
    steps: [
      "Open your banking app",
      "Transfer a fixed amount to your savings/investment account",
      "Log the transfer in your savings tracker",
      "Update your monthly savings total",
    ],
    tips: [
      "Automate this with a standing instruction on pay day",
      "Save at least 20% of income (50/30/20 rule: needs/wants/savings)",
      "Even ₹100 saved today is better than ₹1000 planned for 'someday'",
    ],
    estimatedTime: "5 min",
    whyItMatters: "The habit of paying yourself first is the single most important financial habit. Small, consistent transfers build real wealth over time.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 1 },
  },
  "No Coffee Shop Purchase": {
    steps: [
      "Make your coffee/tea at home before leaving",
      "Carry a thermos or reusable cup",
      "If you need a workspace, go to a library or co-working space instead",
      "Track the money saved today vs what you'd have spent",
    ],
    tips: [
      "A daily ₹300 coffee habit = ₹9,000/month = ₹1,08,000/year",
      "Invest in good coffee beans and a French press — pays for itself in 2 weeks",
      "It's not about never enjoying coffee shops, it's about making it a choice, not a habit",
    ],
    estimatedTime: "5 min (prep at home)",
    whyItMatters: "The 'latte factor' is real. Small daily expenses are invisible wealth killers. This quest builds awareness.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 1 },
  },

  // ===== FOCUS & DISCIPLINE =====
  "Pomodoro Session (4x25 min)": {
    steps: [
      "Choose your ONE most important task for this block",
      "Set a timer for 25 minutes — commit to zero distractions",
      "Work with full focus until the timer rings",
      "Take a 5-minute break (walk, stretch, water — NO phone)",
      "Repeat for 4 cycles",
      "After 4 pomodoros, take a 15-30 min long break",
    ],
    tips: [
      "Put your phone in another room during pomodoros — not just face-down",
      "Use website blockers (Cold Turkey, Freedom) for social media",
      "Track completed pomodoros — it gamifies deep work",
    ],
    estimatedTime: "2 hours (4×25 min + breaks)",
    whyItMatters: "Deep focused work produces 10x the output of distracted work. Four focused pomodoros can accomplish what 8 distracted hours can't.",
    difficulty: { label: "Hard", color: "text-orange-600", stars: 3 },
    tools: ["Pomodoro timer", "Website blocker", "Noise-cancelling headphones"],
  },
  "No Social Media Until 12 PM": {
    steps: [
      "Delete social media apps from your home screen (keep in a folder or use web only)",
      "Enable screen time limits or app timers for social media apps",
      "Replace the morning scroll with: exercise, reading, or quest work",
      "If you catch yourself opening social media, close it immediately — no guilt, just redirect",
      "After 12 PM, allow yourself a controlled 15-min social media break",
    ],
    tips: [
      "The first hour of your day sets the tone — protect it from dopamine traps",
      "Use 'Do Not Disturb' mode until noon",
      "Replace social media with one productive habit in that time slot",
    ],
    estimatedTime: "Discipline from wake to noon",
    whyItMatters: "Morning social media trains your brain for distraction and instant gratification. Delaying it builds the Focus stat directly.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
  },
  "Deep Work Block (2 hrs)": {
    steps: [
      "Choose your single highest-priority task",
      "Clear your desk of distractions — phone in another room",
      "Close all tabs except what you need for this task",
      "Set a 2-hour timer and commit to uninterrupted work",
      "If interrupted by a thought, write it on a 'capture list' and continue",
      "After 2 hours, review what you accomplished and log it",
    ],
    tips: [
      "Schedule deep work at your biological peak (for most people: 9-11 AM)",
      "Tell colleagues/family you're unavailable during this block",
      "Cal Newport's 'Deep Work' book: your ability to focus is your most valuable skill",
    ],
    estimatedTime: "2 hours",
    whyItMatters: "In a world of constant distraction, the ability to do deep, focused work for 2 hours straight is a genuine superpower.",
    difficulty: { label: "Hard", color: "text-orange-600", stars: 3 },
    tools: ["Timer", "Website blocker", "Capture list (notebook)"],
  },
  "Morning Routine Complete": {
    steps: [
      "Wake up at your set time (no snooze)",
      "Make your bed immediately (first win of the day)",
      "Hydrate — drink a full glass of water",
      "Exercise or stretch (even 10 min counts)",
      "Shower, get dressed in real clothes (not pajamas)",
      "Review today's quests and plan your top 3 priorities",
    ],
    tips: [
      "A consistent morning routine removes decision fatigue",
      "Do it in the same order every day until it becomes autopilot",
      "The morning routine is your 'power-up sequence' — it sets every stat for the day",
    ],
    estimatedTime: "45-60 min",
    whyItMatters: "How you start your day determines how you live your day. A strong morning routine is the ultimate compound habit.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
  },
  "Evening Review (15 min)": {
    steps: [
      "Open your quest board — review what you completed today",
      "Write 3 things you're grateful for (rewires brain for positivity)",
      "Write 1 thing you'd do differently tomorrow",
      "Plan tomorrow's top 3 priorities (so you wake up with direction)",
      "Set your alarm and start your wind-down routine",
    ],
    tips: [
      "Journaling at night helps your brain process the day during sleep",
      "Keep it short — this shouldn't feel like homework",
      "Reviewing your quests creates a feedback loop that accelerates growth",
    ],
    estimatedTime: "15 min",
    whyItMatters: "Reflection turns experience into wisdom. Without review, you're just grinding — with review, you're strategically leveling up.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 1 },
  },
  "Phone Screen Time < 3 hrs": {
    steps: [
      "Check your current screen time in Settings → Screen Time",
      "Set app limits for your biggest time sinks (social media, YouTube, games)",
      "Enable grayscale mode to make your phone less addictive",
      "Move social apps off your home screen",
      "Check screen time again before bed — celebrate if under 3 hours",
    ],
    tips: [
      "Average phone usage is 4-7 hours/day. Under 3 puts you in the top 20%",
      "Each hour saved = 365 hours/year = 15 full days reclaimed",
      "Replace phone time with: reading, walking, coding, or conversation",
    ],
    estimatedTime: "All day (awareness)",
    whyItMatters: "Phone addiction is the #1 focus killer. Reclaiming even 1-2 hours daily gives you hundreds of productive hours per year.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
  },
  "Inbox Zero": {
    steps: [
      "Open your email inbox",
      "Process each email top-to-bottom: Reply (< 2 min), Delegate, Schedule, or Archive",
      "Never read an email without acting on it — touch it once",
      "Unsubscribe from 3 newsletters you never read",
      "Set specific email check times (e.g., 9 AM, 1 PM, 5 PM) — not constantly",
    ],
    tips: [
      "Gmail filters and labels automate 80% of inbox management",
      "Use 'Unsubscribe' aggressively — fewer incoming emails = less work",
      "Inbox Zero isn't about having zero emails, it's about zero unprocessed decisions",
    ],
    estimatedTime: "15-20 min",
    whyItMatters: "An overflowing inbox is a constant source of low-grade anxiety. Clearing it frees mental RAM for actual work.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 1 },
    tools: ["Email client", "Unsubscribe tool (Unroll.me)"],
  },
  "Plan Tomorrow Night Before": {
    steps: [
      "Review tomorrow's calendar for meetings and commitments",
      "Write your top 3 priorities (MIT — Most Important Tasks)",
      "Assign time blocks for each priority",
      "Prepare what you'll need: clothes, bag, lunch, materials",
      "Set your alarm based on your planned wake time",
    ],
    tips: [
      "Planning at night lets your subconscious work on problems while you sleep",
      "The 1-3-5 rule: 1 big thing, 3 medium things, 5 small things per day",
      "Review your quest board — which quests will you target tomorrow?",
    ],
    estimatedTime: "10-15 min",
    whyItMatters: "A planned day is 3x more productive than an unplanned one. You wake up with direction instead of decision paralysis.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 1 },
  },

  // ===== AI & TECH =====
  "Build / Improve an AI Agent": {
    steps: [
      "Define your agent's purpose: what problem does it solve?",
      "Choose your framework: LangChain, CrewAI, AutoGen, or raw API calls",
      "Implement the core loop: Observe → Think → Act → Reflect",
      "Add tools: web search, code execution, file I/O, or API calls",
      "Test with 5 diverse prompts — check for edge cases and failures",
      "Document what you built and push to GitHub",
    ],
    tips: [
      "Start simple: a ReAct agent with 1-2 tools is more valuable than a complex multi-agent system",
      "Use LangSmith or Weights & Biases for tracing/debugging",
      "The best agents have clear guardrails and fallback behaviors",
    ],
    estimatedTime: "60-120 min",
    whyItMatters: "AI agents are the next frontier of software engineering. Building them gives you a rare, high-demand skill set.",
    difficulty: { label: "Hard", color: "text-orange-600", stars: 3 },
    tools: ["LangChain / CrewAI", "LangSmith", "GitHub"],
  },
  "Read AI Research Paper": {
    steps: [
      "Pick a paper from Papers With Code or arXiv trending",
      "First pass (10 min): Read abstract, intro, conclusion, and look at figures",
      "Second pass (20 min): Read methodology and results sections",
      "Third pass (if needed): Deep dive into math/proofs",
      "Write a 5-sentence summary: problem, method, key result, limitation, your takeaway",
    ],
    tips: [
      "Don't try to understand everything on first read — 60-70% is great",
      "Follow AI researchers on Twitter/X for curated paper recommendations",
      "Karpathy's 'How to read a paper' guide is excellent for beginners",
    ],
    estimatedTime: "30-45 min",
    whyItMatters: "Reading papers keeps you at the frontier of AI/ML. Interviewers love candidates who can discuss recent research intelligently.",
    difficulty: { label: "Normal", color: "text-green-600", stars: 2 },
    tools: ["arXiv", "Papers With Code", "Semantic Scholar"],
  },

  // ===== WEEKLY QUESTS =====
  "Apply to 10 Jobs This Week": {
    steps: [
      "Monday: Research and shortlist 12-15 target roles",
      "Tue-Thu: Apply to 3-4 jobs per day with tailored resumes",
      "Friday: Follow up on any pending applications from last week",
      "Saturday: Review what worked — which roles got callbacks",
      "Track every application in your job tracker spreadsheet",
    ],
    tips: [
      "Batch similar applications together (same role type = faster tailoring)",
      "Apply early in the week — hiring managers review more on Mon-Wed",
      "Alternate between 'reach' roles and 'safe' roles",
    ],
    estimatedTime: "6-8 hours total (across the week)",
    whyItMatters: "10 quality applications per week = 40/month. At a 5-10% interview rate, that's 2-4 interviews per month — real momentum.",
    difficulty: { label: "Hard", color: "text-orange-600", stars: 3 },
  },
  "7 Workouts This Week": {
    steps: [
      "Plan your workout split for the week (e.g., Push/Pull/Legs/Cardio/Rest)",
      "Schedule each workout in your calendar — treat it like a meeting",
      "Track each workout: exercises, sets, reps, duration",
      "Include at least 2 rest or active recovery days",
      "By Sunday, verify 7 sessions logged",
    ],
    tips: [
      "Morning workouts have the highest completion rate (before life gets in the way)",
      "If you miss a day, double up with a short + regular session",
      "Variety prevents boredom: mix gym, running, yoga, sports",
    ],
    estimatedTime: "4-7 hours total (across the week)",
    whyItMatters: "A full week of training builds the discipline and physical foundation that makes everything else easier.",
    difficulty: { label: "Hard", color: "text-orange-600", stars: 3 },
  },
  "5 LeetCode Problems This Week": {
    steps: [
      "Choose 5 problems from NeetCode 150 or Blind 75 list",
      "Monday: 2 Easy problems to warm up",
      "Wednesday: 2 Medium problems (new patterns)",
      "Friday: 1 Hard problem (stretch goal)",
      "For each: attempt 25 min, then study solution, then re-implement",
      "Log patterns learned and add to your flashcards",
    ],
    tips: [
      "Focus on one pattern per session (e.g., all Sliding Window problems)",
      "Redo problems you failed after 3-5 days — spaced repetition works",
      "Explain your solution out loud as if in an interview",
    ],
    estimatedTime: "4-6 hours total (across the week)",
    whyItMatters: "5 problems/week = 260/year. That's enough to master every common pattern and crush technical interviews.",
    difficulty: { label: "Hard", color: "text-orange-600", stars: 3 },
  },
};

// --- DUNGEON DETAILS ---
const dungeonDetails: Record<string, DungeonDetail> = {
  "The Iron Body": {
    strategy: [
      "Focus on building a sustainable routine, not going all-out and burning out",
      "Prepare meals on Day 1 (Sunday) to avoid ordering food mid-week",
      "Set sleep alarms from Day 1 — this is the hardest habit to maintain",
      "Use rest days for active recovery (walks, stretching) not total rest",
    ],
    dailyBreakdown: [
      { day: "Day 1", tasks: ["Full workout (30+ min)", "Meal prep for 3 days", "8K steps", "Sleep by 11:30"] },
      { day: "Day 2", tasks: ["Morning workout", "Cook healthy meal", "8K steps", "Stretch/yoga"] },
      { day: "Day 3", tasks: ["Active recovery workout", "Cook healthy", "8K steps", "Hydration focus"] },
      { day: "Day 4", tasks: ["Intense workout", "Meal prep for remaining days", "8K steps", "Sleep by 11:30"] },
      { day: "Day 5", tasks: ["Morning workout", "Cook healthy meal", "8K steps", "Meditation"] },
      { day: "Day 6", tasks: ["Active recovery", "Cook healthy", "8K steps", "Evening stretching"] },
      { day: "Day 7", tasks: ["Final workout (make it count)", "Healthy celebration meal", "8K steps", "Early sleep for recovery"] },
    ],
    tips: [
      "Lay out workout clothes the night before — remove friction",
      "Track steps hourly, not just at end of day",
      "If you miss a workout, do a 15-min bodyweight session as a minimum",
      "Drink 3L water daily during this dungeon — your body needs it",
    ],
    estimatedHoursPerDay: "2-3 hours",
    prerequisiteSkills: ["Basic exercise form", "Ability to cook 2-3 simple meals"],
    failConditions: ["Missing more than 1 workout day", "Ordering food more than once", "Sleeping past midnight 3+ times"],
    successCriteria: "Complete all 7 workouts, hit 8K steps daily, cook every meal, and sleep by 11:30 PM all 7 days.",
  },
  "The Algorithm Gauntlet": {
    strategy: [
      "Prioritize understanding over speed — quality reps build pattern recognition",
      "Group problems by pattern: Day 1-2 Arrays/Strings, Day 3-4 Trees/Graphs, Day 5-6 DP, Day 7 mixed",
      "For SQL: practice real-world queries (analytics, reporting, data manipulation)",
      "ML derivations: write out the math by hand — no shortcuts",
    ],
    dailyBreakdown: [
      { day: "Day 1", tasks: ["1 LeetCode (Arrays)", "1 SQL (JOINs)", "Review solutions and note patterns"] },
      { day: "Day 2", tasks: ["1 LeetCode (Strings/Hashing)", "1 SQL (GROUP BY)", "ML: derive gradient descent"] },
      { day: "Day 3", tasks: ["1 LeetCode (Trees)", "1 SQL (Window Functions)", "Review Day 1-2 problems"] },
      { day: "Day 4", tasks: ["1 LeetCode (Graphs/BFS)", "1 SQL (Subqueries)", "ML: derive backpropagation"] },
      { day: "Day 5", tasks: ["1 LeetCode (DP Easy)", "1 SQL (CTEs)", "Review Day 3-4 problems"] },
      { day: "Day 6", tasks: ["1 LeetCode (DP Medium)", "1 SQL (Complex JOINs)", "ML: derive loss function"] },
      { day: "Day 7", tasks: ["1 LeetCode (Hard/Mixed)", "1 SQL (Real-world query)", "Review all patterns learned"] },
    ],
    tips: [
      "If stuck for 20+ min, read the solution → understand it → re-implement from scratch",
      "Use NeetCode.io for video explanations of each pattern",
      "For ML derivations: start from first principles, show every step",
    ],
    estimatedHoursPerDay: "2-3 hours",
    prerequisiteSkills: ["Basic Python/programming", "Understanding of Big O notation", "Elementary linear algebra"],
    failConditions: ["Skipping more than 1 day", "Copy-pasting solutions without understanding", "Skipping ML derivations"],
    successCriteria: "Complete all 7 LeetCode problems, 7 SQL challenges, and 3 ML derivations with documented understanding.",
  },
  "The Application Blitz": {
    strategy: [
      "Day 1: Build your hit list of 25 companies. Day 2-6: Execute 3-4 apps per day",
      "Batch applications by role type for efficient resume tailoring",
      "Write 5 cover letter templates on Day 1 — customize each, don't write from scratch",
      "The LinkedIn post should showcase a project or insight — make it valuable, not self-promotional",
    ],
    dailyBreakdown: [
      { day: "Day 1", tasks: ["Research & shortlist 25 companies", "Prepare 3 resume variants", "Write 5 cover letter templates"] },
      { day: "Day 2", tasks: ["Apply to 4 jobs (tailored)", "Write 1 custom cover letter"] },
      { day: "Day 3", tasks: ["Apply to 4 jobs", "Write 1 custom cover letter", "Follow up on old apps"] },
      { day: "Day 4", tasks: ["Apply to 4 jobs", "Write 1 custom cover letter", "Network: 3 LinkedIn messages"] },
      { day: "Day 5", tasks: ["Apply to 4 jobs", "Write 1 custom cover letter", "Draft LinkedIn post"] },
      { day: "Day 6", tasks: ["Apply to 4 jobs", "Write 1 custom cover letter", "Publish LinkedIn post"] },
      { day: "Day 7", tasks: ["Review all applications", "Follow up on Week's apps", "Update job tracker"] },
    ],
    tips: [
      "Quality beats quantity: 20 tailored apps >> 50 generic ones",
      "Apply Monday-Wednesday for best visibility (hiring managers are most active)",
      "Your LinkedIn post should demonstrate expertise — a tutorial, insight, or project showcase",
    ],
    estimatedHoursPerDay: "2-3 hours",
    prerequisiteSkills: ["Updated resume", "LinkedIn profile complete", "Job tracker set up"],
    failConditions: ["Sending generic/untailored applications", "Less than 15 total applications", "No LinkedIn post published"],
    successCriteria: "Submit 20 tailored applications, write 5 custom cover letters, and publish 1 LinkedIn post with engagement.",
  },
  "The Agent Architect": {
    strategy: [
      "Day 1-2: Design and scaffold the agent architecture",
      "Day 3-5: Build the core ReAct loop with tools",
      "Day 6: Set up observability (LangSmith) and run evaluation",
      "Day 7: Write a comprehensive eval report with metrics",
    ],
    dailyBreakdown: [
      { day: "Day 1", tasks: ["Define agent scope and tools", "Choose framework (LangChain/CrewAI)", "Set up project skeleton"] },
      { day: "Day 2", tasks: ["Implement ReAct loop", "Add first tool (web search or code exec)", "Test basic queries"] },
      { day: "Day 3", tasks: ["Add 2 more tools", "Implement memory/context management", "Handle error cases"] },
      { day: "Day 4", tasks: ["Add guardrails and safety checks", "Optimize prompts", "Test 10 diverse scenarios"] },
      { day: "Day 5", tasks: ["Set up LangSmith tracing", "Run 20 evaluation queries", "Collect metrics"] },
      { day: "Day 6", tasks: ["Analyze traces for failures", "Fix identified issues", "Re-run evaluation"] },
      { day: "Day 7", tasks: ["Write eval report: accuracy, latency, cost, failure modes", "Push to GitHub", "Document README"] },
    ],
    tips: [
      "Start with a simple tool (calculator, search) before complex ones",
      "LangSmith tracing is essential — you can't improve what you can't see",
      "The eval report is as important as the agent itself — it shows engineering rigor",
    ],
    estimatedHoursPerDay: "3-4 hours",
    prerequisiteSkills: ["Python proficiency", "API integration experience", "Understanding of LLMs and prompt engineering"],
    failConditions: ["Agent has no working tools", "No LangSmith tracing set up", "No eval report written"],
    successCriteria: "Working ReAct agent with 3+ tools, LangSmith tracing active, and a written eval report with accuracy metrics.",
  },
  "The Wealth Fortress": {
    strategy: [
      "Set your daily budget on Day 1 and stick to it ruthlessly",
      "Cook all meals — zero food delivery or eating out",
      "Log expenses in real-time (not at end of day) for maximum awareness",
      "Transfer savings amount on Day 1 — pay yourself first",
    ],
    dailyBreakdown: [
      { day: "Day 1", tasks: ["Set weekly budget", "Transfer savings", "Meal plan for week", "Log all expenses"] },
      { day: "Day 2", tasks: ["Cook all meals", "Log expenses", "No unnecessary purchases", "Review Day 1 spending"] },
      { day: "Day 3", tasks: ["Cook all meals", "Log expenses", "Find 1 subscription to cancel"] },
      { day: "Day 4", tasks: ["Cook all meals", "Log expenses", "Mid-week budget review"] },
      { day: "Day 5", tasks: ["Cook all meals", "Log expenses", "No coffee shop visit"] },
      { day: "Day 6", tasks: ["Cook all meals", "Log expenses", "Plan next week's budget"] },
      { day: "Day 7", tasks: ["Cook all meals", "Log expenses", "Week-end financial review", "Calculate total saved"] },
    ],
    tips: [
      "The hardest day is Day 3-4 when willpower dips — plan for it",
      "Replace eating out with cooking challenges — make it fun, not punishment",
      "Track your 'saved' amount as a positive number, not just 'spent less'",
    ],
    estimatedHoursPerDay: "1-2 hours",
    prerequisiteSkills: ["Basic cooking ability", "Expense tracking app/spreadsheet set up"],
    failConditions: ["Eating out more than 0 times", "Failing to log expenses for 2+ days", "Going over budget by >20%"],
    successCriteria: "Log every transaction for 7 days, stay on budget, transfer savings, and eat zero restaurant/delivery meals.",
  },
  "The Cert Sprint": {
    strategy: [
      "Map the entire certification syllabus on Day 1 — break into 7 daily chunks",
      "Use Pomodoro technique for study sessions (25 min focus, 5 min break)",
      "Practice tests on Days 4 and 6 — they reveal gaps better than re-reading",
      "Mock exam on Day 7 should simulate real conditions (timed, no notes)",
    ],
    dailyBreakdown: [
      { day: "Day 1", tasks: ["Map full syllabus", "Study Module 1-2", "Create Anki flashcards"] },
      { day: "Day 2", tasks: ["Study Module 3-4", "Review Day 1 flashcards", "Practice questions"] },
      { day: "Day 3", tasks: ["Study Module 5-6", "Review all flashcards", "Note weak areas"] },
      { day: "Day 4", tasks: ["Practice Test 1 (timed)", "Review wrong answers", "Deep-dive weak topics"] },
      { day: "Day 5", tasks: ["Study remaining modules", "Review all flashcards", "Practice questions"] },
      { day: "Day 6", tasks: ["Practice Test 2 (timed)", "Review wrong answers", "Final weak-area push"] },
      { day: "Day 7", tasks: ["Full mock exam (timed, no notes)", "Score and review", "Plan final study before real exam"] },
    ],
    tips: [
      "Active recall > passive re-reading. Test yourself constantly",
      "Focus study on the highest-weighted exam domains first",
      "If practice test score is below 70%, you need more time — be honest with yourself",
    ],
    estimatedHoursPerDay: "3-4 hours",
    prerequisiteSkills: ["Basic knowledge of the certification domain", "Study materials purchased/downloaded"],
    failConditions: ["Studying less than 2 hours on any day", "Skipping both practice tests", "Not completing the mock exam"],
    successCriteria: "Complete all 7 cert modules, take 2 practice tests, and score 70%+ on the mock exam.",
  },
  "The Focus Forge": {
    strategy: [
      "This dungeon is about building mental endurance — treat it like training",
      "Start each day with a morning ritual before any screen time",
      "The 2-hour deep work blocks should be on your most challenging tasks",
      "No social media before noon is the anchor habit — protect it at all costs",
    ],
    dailyBreakdown: [
      { day: "Day 1", tasks: ["2-hour deep work block", "No social media until noon", "Evening planning session"] },
      { day: "Day 2", tasks: ["2-hour deep work block", "No social media until noon", "Meditate 10 min"] },
      { day: "Day 3", tasks: ["2-hour deep work block", "No social media until noon", "Phone screen time < 3h"] },
      { day: "Day 4", tasks: ["2-hour deep work block", "No social media until noon", "Evening review + plan"] },
      { day: "Day 5", tasks: ["2-hour deep work block", "No social media until noon", "Digital detox evening"] },
      { day: "Day 6", tasks: ["2-hour deep work block", "No social media until noon", "Meditate 10 min"] },
      { day: "Day 7", tasks: ["2-hour deep work block", "No social media until noon", "Reflect on what changed"] },
    ],
    tips: [
      "Use website blockers — willpower alone is unreliable",
      "Tell someone about this challenge — accountability increases success by 65%",
      "When urge to check social media hits, do 10 push-ups instead",
    ],
    estimatedHoursPerDay: "2-3 hours (deep work) + discipline all day",
    prerequisiteSkills: ["Basic time management", "Access to a quiet workspace"],
    failConditions: ["Checking social media before noon 3+ times", "Missing more than 1 deep work session", "No evening review on any day"],
    successCriteria: "Complete all 7 deep work blocks (2h each) and maintain no social media before noon for the full week.",
  },
  "The Portfolio Week": {
    strategy: [
      "Day 1-3: Build and deploy your live demo project",
      "Day 4-5: Polish GitHub READMEs with visuals, architecture diagrams, and demos",
      "Day 6: Create and submit a Kaggle notebook",
      "Day 7: Review and polish everything — first impressions matter",
    ],
    dailyBreakdown: [
      { day: "Day 1", tasks: ["Choose demo project", "Set up repo and CI/CD", "Build core feature"] },
      { day: "Day 2", tasks: ["Complete main functionality", "Add basic UI/styling", "Write initial tests"] },
      { day: "Day 3", tasks: ["Deploy to production (Vercel/Railway)", "Test deployment", "Record demo GIF"] },
      { day: "Day 4", tasks: ["Improve README #1 (add architecture diagram, screenshots)", "Add demo links"] },
      { day: "Day 5", tasks: ["Improve README #2 and #3", "Add setup instructions", "Clean up code"] },
      { day: "Day 6", tasks: ["Create Kaggle notebook", "Clean analysis + visualizations", "Submit and share"] },
      { day: "Day 7", tasks: ["Final polish on all repos", "Test all live links", "Share portfolio on LinkedIn"] },
    ],
    tips: [
      "Your portfolio is your proof of work — make it visually appealing, not just functional",
      "READMEs should have: problem statement, architecture, screenshots/GIF, setup steps, tech stack",
      "Deploy to a live URL — recruiters want to click and see it work, not clone repos",
    ],
    estimatedHoursPerDay: "3-5 hours",
    prerequisiteSkills: ["Web development basics", "Git/GitHub proficiency", "One deployable project idea"],
    failConditions: ["No live deployed demo", "READMEs still generic/empty", "No Kaggle notebook submitted"],
    successCriteria: "1 live deployed demo with working URL, 3 improved GitHub READMEs with visuals, and 1 submitted Kaggle notebook.",
  },
  "The MLOps Forge": {
    strategy: [
      "Day 1-2: Set up Airflow DAG for an existing ML pipeline",
      "Day 3-4: Integrate MLflow for experiment tracking",
      "Day 5-6: Build model monitoring (data drift, prediction quality)",
      "Day 7: Document the entire pipeline end-to-end",
    ],
    dailyBreakdown: [
      { day: "Day 1", tasks: ["Install Airflow locally", "Design DAG for your ML pipeline", "Implement first task"] },
      { day: "Day 2", tasks: ["Complete Airflow DAG", "Test pipeline runs", "Add error handling"] },
      { day: "Day 3", tasks: ["Set up MLflow tracking server", "Log experiments (params, metrics, artifacts)"] },
      { day: "Day 4", tasks: ["Add MLflow model registry", "Version your models", "Compare experiment runs"] },
      { day: "Day 5", tasks: ["Build monitoring dashboard", "Add data drift detection (Evidently/WhyLabs)"] },
      { day: "Day 6", tasks: ["Add prediction quality monitoring", "Set up alerts for drift", "Test with simulated drift"] },
      { day: "Day 7", tasks: ["Write documentation", "Create architecture diagram", "Push to GitHub"] },
    ],
    tips: [
      "Use Docker for Airflow to avoid dependency hell",
      "MLflow's autolog feature saves time — enable it for scikit-learn/PyTorch",
      "Evidently AI is the fastest way to add data drift monitoring",
    ],
    estimatedHoursPerDay: "3-4 hours",
    prerequisiteSkills: ["Python ML pipelines", "Docker basics", "Understanding of ML lifecycle"],
    failConditions: ["Airflow DAG doesn't run end-to-end", "No MLflow experiments logged", "No monitoring set up"],
    successCriteria: "Working Airflow DAG, MLflow experiment tracking with 3+ logged runs, and basic model monitoring dashboard.",
  },
  "The Full Stack Trial": {
    strategy: [
      "Day 1-2: Design and build the database schema + API endpoints",
      "Day 3-4: Build the frontend UI with a framework (Next.js, React)",
      "Day 5: Connect frontend to backend, handle error states",
      "Day 6: Deploy to production (Vercel/Railway + managed DB)",
      "Day 7: Polish, test edge cases, write documentation",
    ],
    dailyBreakdown: [
      { day: "Day 1", tasks: ["Design feature scope (keep it focused)", "Design DB schema", "Set up project repo"] },
      { day: "Day 2", tasks: ["Build REST/GraphQL API endpoints", "Add validation and error handling", "Test with Postman/Thunder"] },
      { day: "Day 3", tasks: ["Build frontend layout and routing", "Create main UI components", "Style with Tailwind/CSS"] },
      { day: "Day 4", tasks: ["Build forms and interactive features", "Connect to API endpoints", "Handle loading/error states"] },
      { day: "Day 5", tasks: ["Integration testing", "Fix bugs and edge cases", "Add authentication if needed"] },
      { day: "Day 6", tasks: ["Deploy backend + DB to cloud", "Deploy frontend to Vercel", "Test production deployment"] },
      { day: "Day 7", tasks: ["Polish UI/UX", "Write README with screenshots", "Record demo video/GIF"] },
    ],
    tips: [
      "Keep scope SMALL — one focused feature done well > half-built ambitious project",
      "Use TypeScript end-to-end for type safety across frontend and backend",
      "Deploy early (Day 3-4) so you catch deployment issues before the final day",
    ],
    estimatedHoursPerDay: "4-6 hours",
    prerequisiteSkills: ["JavaScript/TypeScript", "React or Next.js basics", "SQL/database fundamentals", "Basic deployment knowledge"],
    failConditions: ["No working API endpoints", "Frontend doesn't connect to backend", "Not deployed to production"],
    successCriteria: "Complete full-stack feature with frontend UI, working API, connected database, and deployed to a live production URL.",
  },
};

// --- LOOKUP FUNCTIONS ---
export function getQuestDetail(title: string): QuestDetail | null {
  return questDetails[title] || null;
}

export function getDungeonDetail(title: string): DungeonDetail | null {
  return dungeonDetails[title] || null;
}
