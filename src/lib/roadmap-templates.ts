// Hardcoded fallback roadmap templates used when AI generation fails.
// Each template covers a 26-week career roadmap for a specific role.

export interface RoadmapTemplate {
  summary: string;
  quests: Array<{
    title: string;
    category: string;
    difficulty: string;
    tier: string;
    xpBase: number;
    goldBase: number;
    statTarget: string;
    statGain: number;
    isDaily: boolean;
  }>;
  dungeons: Array<{
    title: string;
    description: string;
    objectives: string[];
    bonusXP: number;
    bonusGold: number;
    statReward: string;
    statAmount: number;
  }>;
  certifications: Array<{
    certName: string;
    provider: string;
    totalWeeks: number;
    weeklyHours: number;
    goldBonus: number;
  }>;
  goals: Array<{
    type: string;
    title: string;
    description: string;
    weeksFromNow: number;
    xpReward: number;
    goldReward: number;
  }>;
  recurringHabits: Array<{
    title: string;
    category: string;
    priority: number;
    recurType: string;
  }>;
  questChains: Array<{
    title: string;
    description: string;
    steps: Array<{
      title: string;
      category: string;
      difficulty: string;
      xpBase: number;
      goldBase: number;
      statTarget: string;
    }>;
  }>;
  milestones: Array<{
    title: string;
    description: string;
    weekNumber: number;
  }>;
}

// ---------------------------------------------------------------------------
// ML Engineer
// ---------------------------------------------------------------------------
const mlEngineerTemplate: RoadmapTemplate = {
  summary:
    "A 26-week roadmap to become a production-ready ML Engineer. You will build strong foundations in model training, feature engineering, and deployment while earning certifications and assembling a portfolio of real-world ML projects.",
  quests: [
    {
      title: "Train model on dataset",
      category: "learning",
      difficulty: "hard",
      tier: "silver",
      xpBase: 100,
      goldBase: 25,
      statTarget: "intel",
      statGain: 3,
      isDaily: true,
    },
    {
      title: "Read ML paper abstract",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 50,
      goldBase: 12,
      statTarget: "agentIQ",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Optimize hyperparameters",
      category: "learning",
      difficulty: "hard",
      tier: "silver",
      xpBase: 90,
      goldBase: 22,
      statTarget: "intel",
      statGain: 3,
      isDaily: true,
    },
    {
      title: "Build feature pipeline",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 70,
      goldBase: 18,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Practice ML interview question",
      category: "hustle",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 60,
      goldBase: 15,
      statTarget: "hustle",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Write model evaluation report",
      category: "focus",
      difficulty: "hard",
      tier: "gold",
      xpBase: 250,
      goldBase: 60,
      statTarget: "intel",
      statGain: 4,
      isDaily: false,
    },
    {
      title: "Deploy model to staging",
      category: "focus",
      difficulty: "legendary",
      tier: "gold",
      xpBase: 200,
      goldBase: 50,
      statTarget: "agentIQ",
      statGain: 5,
      isDaily: false,
    },
    {
      title: "Contribute to open-source ML",
      category: "hustle",
      difficulty: "hard",
      tier: "gold",
      xpBase: 300,
      goldBase: 70,
      statTarget: "hustle",
      statGain: 4,
      isDaily: false,
    },
    {
      title: "Solve ML coding problem",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 70,
      goldBase: 18,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Build data pipeline",
      category: "focus",
      difficulty: "hard",
      tier: "silver",
      xpBase: 150,
      goldBase: 35,
      statTarget: "agentIQ",
      statGain: 3,
      isDaily: false,
    },
  ],
  dungeons: [
    {
      title: "The Neural Network Forge",
      description:
        "Forge a neural network from raw math to production API. Build, train, evaluate, and deploy a real model end-to-end.",
      objectives: [
        "Build neural net from scratch",
        "Train on real dataset",
        "Evaluate with cross-validation",
        "Deploy with API endpoint",
      ],
      bonusXP: 1000,
      bonusGold: 250,
      statReward: "agentIQ",
      statAmount: 8,
    },
    {
      title: "The Data Pipeline Marathon",
      description:
        "Design and build a full ETL pipeline from extraction to monitoring. Prove you can move data reliably at scale.",
      objectives: [
        "Design ETL architecture",
        "Build data extraction",
        "Transform and validate",
        "Load to warehouse",
        "Monitor pipeline",
      ],
      bonusXP: 900,
      bonusGold: 220,
      statReward: "intel",
      statAmount: 7,
    },
  ],
  certifications: [
    {
      certName: "AWS Machine Learning Specialty",
      provider: "Amazon",
      totalWeeks: 10,
      weeklyHours: 15,
      goldBonus: 2500,
    },
    {
      certName: "TensorFlow Developer Certificate",
      provider: "Google",
      totalWeeks: 8,
      weeklyHours: 12,
      goldBonus: 2000,
    },
  ],
  goals: [
    {
      type: "sprint",
      title: "Complete 1 Kaggle submission",
      description:
        "Submit a complete notebook to any active Kaggle competition with a valid score.",
      weeksFromNow: 2,
      xpReward: 200,
      goldReward: 100,
    },
    {
      type: "sprint",
      title: "Build end-to-end ML pipeline",
      description:
        "Create a pipeline that ingests data, trains a model, evaluates it, and saves artifacts.",
      weeksFromNow: 4,
      xpReward: 300,
      goldReward: 150,
    },
    {
      type: "monthly",
      title: "Deploy 3 ML models",
      description:
        "Have three distinct models running behind APIs or batch jobs in a staging or production environment.",
      weeksFromNow: 12,
      xpReward: 500,
      goldReward: 300,
    },
    {
      type: "monthly",
      title: "Pass ML certification",
      description:
        "Earn the AWS ML Specialty or TensorFlow Developer certificate.",
      weeksFromNow: 16,
      xpReward: 500,
      goldReward: 300,
    },
    {
      type: "life",
      title: "Land ML Engineer role",
      description:
        "Secure an ML Engineer position at a company of your choice by acing interviews and demonstrating your portfolio.",
      weeksFromNow: 26,
      xpReward: 2000,
      goldReward: 1000,
    },
  ],
  recurringHabits: [
    { title: "Study ML concepts (30 min)", category: "learning", priority: 1, recurType: "daily" },
    { title: "Code ML practice problem", category: "learning", priority: 2, recurType: "weekdays" },
    { title: "Read ML arxiv papers", category: "learning", priority: 3, recurType: "weekdays" },
    { title: "Log ML experiments", category: "focus", priority: 2, recurType: "daily" },
    { title: "Practice SQL queries", category: "learning", priority: 3, recurType: "weekdays" },
    { title: "Review model performance", category: "focus", priority: 2, recurType: "daily" },
  ],
  questChains: [
    {
      title: "Build Production ML Pipeline",
      description:
        "Walk through every stage of a production ML system, from raw data to deployed model.",
      steps: [
        { title: "Data collection & ingestion", category: "learning", difficulty: "normal", xpBase: 80, goldBase: 20, statTarget: "intel" },
        { title: "Exploratory data analysis", category: "learning", difficulty: "normal", xpBase: 80, goldBase: 20, statTarget: "intel" },
        { title: "Feature engineering", category: "learning", difficulty: "hard", xpBase: 120, goldBase: 30, statTarget: "intel" },
        { title: "Model training & tuning", category: "learning", difficulty: "hard", xpBase: 130, goldBase: 32, statTarget: "agentIQ" },
        { title: "Model evaluation & testing", category: "focus", difficulty: "hard", xpBase: 110, goldBase: 28, statTarget: "intel" },
        { title: "Deployment & monitoring", category: "focus", difficulty: "legendary", xpBase: 150, goldBase: 38, statTarget: "agentIQ" },
      ],
    },
  ],
  milestones: [
    { title: "Foundation solid", description: "Core ML concepts mastered, first experiments running.", weekNumber: 2 },
    { title: "First model deployed", description: "A trained model is live behind an API endpoint.", weekNumber: 6 },
    { title: "Portfolio ready", description: "Three polished ML projects on GitHub with READMEs.", weekNumber: 12 },
    { title: "Cert passed", description: "AWS ML Specialty or TensorFlow certificate earned.", weekNumber: 20 },
    { title: "Interview ready", description: "Mock interviews done, resume polished, applications sent.", weekNumber: 26 },
  ],
};

// ---------------------------------------------------------------------------
// Full Stack Developer
// ---------------------------------------------------------------------------
const fullStackTemplate: RoadmapTemplate = {
  summary:
    "A 26-week roadmap to become a job-ready Full Stack Developer. You will sharpen React, Node/API skills, DevOps basics, and system design while building a portfolio of deployed applications.",
  quests: [
    {
      title: "Build a React component",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 70,
      goldBase: 18,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Create REST API endpoint",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 80,
      goldBase: 20,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Deploy feature to production",
      category: "focus",
      difficulty: "hard",
      tier: "silver",
      xpBase: 100,
      goldBase: 25,
      statTarget: "agentIQ",
      statGain: 3,
      isDaily: true,
    },
    {
      title: "Solve LeetCode problem",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 60,
      goldBase: 15,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Write unit & integration tests",
      category: "focus",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 70,
      goldBase: 18,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Improve CSS & UI design",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 50,
      goldBase: 12,
      statTarget: "agentIQ",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Optimize database queries",
      category: "focus",
      difficulty: "hard",
      tier: "gold",
      xpBase: 250,
      goldBase: 60,
      statTarget: "intel",
      statGain: 4,
      isDaily: false,
    },
    {
      title: "Review a pull request",
      category: "hustle",
      difficulty: "normal",
      tier: "gold",
      xpBase: 200,
      goldBase: 50,
      statTarget: "hustle",
      statGain: 3,
      isDaily: false,
    },
    {
      title: "Set up Docker environment",
      category: "focus",
      difficulty: "hard",
      tier: "silver",
      xpBase: 150,
      goldBase: 35,
      statTarget: "agentIQ",
      statGain: 3,
      isDaily: false,
    },
    {
      title: "Practice Git workflow",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 40,
      goldBase: 10,
      statTarget: "hustle",
      statGain: 1,
      isDaily: true,
    },
  ],
  dungeons: [
    {
      title: "The Full Stack Sprint",
      description:
        "Build a complete full-stack application from scratch in a single focused sprint. Frontend, backend, database, and deployment.",
      objectives: [
        "Design database schema",
        "Build REST/GraphQL API",
        "Create React frontend with routing",
        "Add authentication & authorization",
        "Deploy to cloud provider",
      ],
      bonusXP: 1100,
      bonusGold: 280,
      statReward: "agentIQ",
      statAmount: 8,
    },
    {
      title: "The DevOps Forge",
      description:
        "Set up a complete CI/CD pipeline with containerization, automated testing, and production monitoring.",
      objectives: [
        "Containerize app with Docker",
        "Write CI pipeline config",
        "Add automated test suite",
        "Configure staging environment",
        "Set up monitoring & alerts",
      ],
      bonusXP: 900,
      bonusGold: 220,
      statReward: "intel",
      statAmount: 7,
    },
  ],
  certifications: [
    {
      certName: "AWS Solutions Architect Associate",
      provider: "Amazon",
      totalWeeks: 10,
      weeklyHours: 12,
      goldBonus: 2000,
    },
    {
      certName: "Meta Frontend Developer Professional",
      provider: "Meta",
      totalWeeks: 8,
      weeklyHours: 10,
      goldBonus: 1800,
    },
  ],
  goals: [
    {
      type: "sprint",
      title: "Ship personal portfolio site",
      description: "Deploy a polished portfolio site with at least 2 project showcases.",
      weeksFromNow: 2,
      xpReward: 200,
      goldReward: 100,
    },
    {
      type: "sprint",
      title: "Build full-stack CRUD app",
      description: "Complete a full-stack application with auth, CRUD operations, and deployment.",
      weeksFromNow: 4,
      xpReward: 300,
      goldReward: 150,
    },
    {
      type: "monthly",
      title: "Contribute to 3 open-source repos",
      description: "Have 3 merged pull requests in established open-source projects.",
      weeksFromNow: 12,
      xpReward: 500,
      goldReward: 300,
    },
    {
      type: "monthly",
      title: "Pass AWS certification",
      description: "Earn the AWS Solutions Architect Associate certificate.",
      weeksFromNow: 16,
      xpReward: 500,
      goldReward: 300,
    },
    {
      type: "life",
      title: "Land Full Stack Developer role",
      description: "Secure a full-stack developer position with a strong portfolio and interview skills.",
      weeksFromNow: 26,
      xpReward: 2000,
      goldReward: 1000,
    },
  ],
  recurringHabits: [
    { title: "Code for 1 hour", category: "learning", priority: 1, recurType: "daily" },
    { title: "Solve algorithm problem", category: "learning", priority: 2, recurType: "weekdays" },
    { title: "Read tech blog / docs", category: "learning", priority: 3, recurType: "weekdays" },
    { title: "Work on side project", category: "focus", priority: 1, recurType: "daily" },
    { title: "Practice system design", category: "learning", priority: 3, recurType: "weekdays" },
    { title: "Review & refactor code", category: "focus", priority: 2, recurType: "daily" },
  ],
  questChains: [
    {
      title: "Build and Deploy Full Stack App",
      description:
        "Go from zero to a deployed full-stack application, covering every layer of the stack.",
      steps: [
        { title: "Design wireframes & schema", category: "learning", difficulty: "normal", xpBase: 70, goldBase: 18, statTarget: "agentIQ" },
        { title: "Set up project & tooling", category: "learning", difficulty: "normal", xpBase: 60, goldBase: 15, statTarget: "intel" },
        { title: "Build API layer", category: "learning", difficulty: "hard", xpBase: 120, goldBase: 30, statTarget: "intel" },
        { title: "Build frontend UI", category: "learning", difficulty: "hard", xpBase: 120, goldBase: 30, statTarget: "agentIQ" },
        { title: "Add auth & testing", category: "focus", difficulty: "hard", xpBase: 110, goldBase: 28, statTarget: "intel" },
        { title: "Deploy & monitor", category: "focus", difficulty: "legendary", xpBase: 150, goldBase: 38, statTarget: "agentIQ" },
      ],
    },
  ],
  milestones: [
    { title: "Dev environment ready", description: "Local stack running with hot reload, linting, and test runner.", weekNumber: 2 },
    { title: "First app deployed", description: "A full-stack app is live on a public URL.", weekNumber: 6 },
    { title: "Portfolio complete", description: "Three deployed projects with polished READMEs on GitHub.", weekNumber: 12 },
    { title: "Cert earned", description: "AWS Solutions Architect or Meta Frontend certificate obtained.", weekNumber: 20 },
    { title: "Interview ready", description: "System design and coding interviews practiced, resume polished.", weekNumber: 26 },
  ],
};

// ---------------------------------------------------------------------------
// Data Scientist
// ---------------------------------------------------------------------------
const dataScientistTemplate: RoadmapTemplate = {
  summary:
    "A 26-week roadmap to become a capable Data Scientist. You will strengthen statistics, experimentation, visualization, and storytelling skills while building a portfolio of analyses and earning a certification.",
  quests: [
    {
      title: "Perform exploratory data analysis",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 80,
      goldBase: 20,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Build statistical model",
      category: "learning",
      difficulty: "hard",
      tier: "silver",
      xpBase: 100,
      goldBase: 25,
      statTarget: "intel",
      statGain: 3,
      isDaily: true,
    },
    {
      title: "Create data visualization",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 60,
      goldBase: 15,
      statTarget: "agentIQ",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Write complex SQL query",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 70,
      goldBase: 18,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Design A/B test",
      category: "focus",
      difficulty: "hard",
      tier: "silver",
      xpBase: 90,
      goldBase: 22,
      statTarget: "intel",
      statGain: 3,
      isDaily: true,
    },
    {
      title: "Run hypothesis test",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 70,
      goldBase: 18,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Write analysis report",
      category: "focus",
      difficulty: "hard",
      tier: "gold",
      xpBase: 250,
      goldBase: 60,
      statTarget: "agentIQ",
      statGain: 4,
      isDaily: false,
    },
    {
      title: "Practice Python data wrangling",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 60,
      goldBase: 15,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Read domain-specific research",
      category: "learning",
      difficulty: "normal",
      tier: "gold",
      xpBase: 200,
      goldBase: 50,
      statTarget: "agentIQ",
      statGain: 3,
      isDaily: false,
    },
    {
      title: "Present findings to stakeholders",
      category: "hustle",
      difficulty: "hard",
      tier: "gold",
      xpBase: 300,
      goldBase: 70,
      statTarget: "hustle",
      statGain: 4,
      isDaily: false,
    },
  ],
  dungeons: [
    {
      title: "The Analytics Deep Dive",
      description:
        "Take a messy real-world dataset and produce a complete analytical narrative with actionable insights.",
      objectives: [
        "Clean and wrangle raw data",
        "Perform statistical analysis",
        "Build predictive model",
        "Create dashboard with visualizations",
        "Write executive summary",
      ],
      bonusXP: 1000,
      bonusGold: 250,
      statReward: "intel",
      statAmount: 8,
    },
    {
      title: "The Statistical Sprint",
      description:
        "Design, run, and analyze a rigorous A/B test from hypothesis to business recommendation.",
      objectives: [
        "Define hypothesis and metrics",
        "Calculate sample size and duration",
        "Implement experiment tracking",
        "Analyze results with confidence intervals",
        "Present recommendation with caveats",
      ],
      bonusXP: 900,
      bonusGold: 220,
      statReward: "agentIQ",
      statAmount: 7,
    },
  ],
  certifications: [
    {
      certName: "Google Data Analytics Professional",
      provider: "Google",
      totalWeeks: 8,
      weeklyHours: 10,
      goldBonus: 2000,
    },
    {
      certName: "IBM Data Science Professional",
      provider: "IBM",
      totalWeeks: 10,
      weeklyHours: 12,
      goldBonus: 2000,
    },
  ],
  goals: [
    {
      type: "sprint",
      title: "Complete first EDA project",
      description: "Publish a thorough exploratory analysis notebook on a public dataset.",
      weeksFromNow: 2,
      xpReward: 200,
      goldReward: 100,
    },
    {
      type: "sprint",
      title: "Build predictive model",
      description: "Train, evaluate, and document a predictive model with proper cross-validation.",
      weeksFromNow: 4,
      xpReward: 300,
      goldReward: 150,
    },
    {
      type: "monthly",
      title: "Publish 3 analysis projects",
      description: "Have three polished data science projects on GitHub or Kaggle.",
      weeksFromNow: 12,
      xpReward: 500,
      goldReward: 300,
    },
    {
      type: "monthly",
      title: "Earn data analytics certification",
      description: "Complete the Google Data Analytics or IBM Data Science certificate.",
      weeksFromNow: 16,
      xpReward: 500,
      goldReward: 300,
    },
    {
      type: "life",
      title: "Land Data Scientist role",
      description: "Secure a data scientist position with a strong portfolio of analyses and experiments.",
      weeksFromNow: 26,
      xpReward: 2000,
      goldReward: 1000,
    },
  ],
  recurringHabits: [
    { title: "Study statistics (30 min)", category: "learning", priority: 1, recurType: "daily" },
    { title: "Practice SQL queries", category: "learning", priority: 2, recurType: "weekdays" },
    { title: "Read data science blog/paper", category: "learning", priority: 3, recurType: "weekdays" },
    { title: "Work on analysis project", category: "focus", priority: 1, recurType: "daily" },
    { title: "Practice Python / pandas", category: "learning", priority: 2, recurType: "weekdays" },
    { title: "Review experiment results", category: "focus", priority: 2, recurType: "daily" },
  ],
  questChains: [
    {
      title: "End-to-End Data Science Project",
      description:
        "Execute a complete data science workflow from question formulation to stakeholder presentation.",
      steps: [
        { title: "Define business question", category: "learning", difficulty: "normal", xpBase: 60, goldBase: 15, statTarget: "agentIQ" },
        { title: "Collect and clean data", category: "learning", difficulty: "normal", xpBase: 80, goldBase: 20, statTarget: "intel" },
        { title: "Exploratory data analysis", category: "learning", difficulty: "hard", xpBase: 100, goldBase: 25, statTarget: "intel" },
        { title: "Model building & evaluation", category: "learning", difficulty: "hard", xpBase: 130, goldBase: 32, statTarget: "intel" },
        { title: "Create visualizations & dashboard", category: "focus", difficulty: "hard", xpBase: 110, goldBase: 28, statTarget: "agentIQ" },
        { title: "Present findings & recommendations", category: "hustle", difficulty: "legendary", xpBase: 150, goldBase: 38, statTarget: "hustle" },
      ],
    },
  ],
  milestones: [
    { title: "Stats foundations solid", description: "Core statistics and probability concepts mastered.", weekNumber: 2 },
    { title: "First analysis published", description: "A complete EDA project is public on GitHub or Kaggle.", weekNumber: 6 },
    { title: "Portfolio ready", description: "Three data science projects documented and published.", weekNumber: 12 },
    { title: "Cert earned", description: "Google or IBM data science certificate obtained.", weekNumber: 20 },
    { title: "Interview ready", description: "Case studies practiced, resume polished, applications sent.", weekNumber: 26 },
  ],
};

// ---------------------------------------------------------------------------
// DevOps Engineer
// ---------------------------------------------------------------------------
const devOpsTemplate: RoadmapTemplate = {
  summary:
    "A 26-week roadmap to become a proficient DevOps Engineer. You will master infrastructure-as-code, CI/CD, container orchestration, monitoring, and security while earning cloud and Kubernetes certifications.",
  quests: [
    {
      title: "Write Terraform module",
      category: "learning",
      difficulty: "hard",
      tier: "silver",
      xpBase: 100,
      goldBase: 25,
      statTarget: "intel",
      statGain: 3,
      isDaily: true,
    },
    {
      title: "Build CI/CD pipeline",
      category: "learning",
      difficulty: "hard",
      tier: "silver",
      xpBase: 90,
      goldBase: 22,
      statTarget: "agentIQ",
      statGain: 3,
      isDaily: true,
    },
    {
      title: "Set up monitoring & alerts",
      category: "focus",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 70,
      goldBase: 18,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Write Dockerfile",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 60,
      goldBase: 15,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Deploy Kubernetes manifest",
      category: "learning",
      difficulty: "hard",
      tier: "silver",
      xpBase: 100,
      goldBase: 25,
      statTarget: "agentIQ",
      statGain: 3,
      isDaily: true,
    },
    {
      title: "Practice Linux administration",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 50,
      goldBase: 12,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Configure networking & DNS",
      category: "focus",
      difficulty: "hard",
      tier: "gold",
      xpBase: 250,
      goldBase: 60,
      statTarget: "intel",
      statGain: 4,
      isDaily: false,
    },
    {
      title: "Write automation script",
      category: "learning",
      difficulty: "normal",
      tier: "gold",
      xpBase: 200,
      goldBase: 50,
      statTarget: "agentIQ",
      statGain: 3,
      isDaily: false,
    },
    {
      title: "Perform security audit",
      category: "focus",
      difficulty: "hard",
      tier: "gold",
      xpBase: 300,
      goldBase: 70,
      statTarget: "intel",
      statGain: 4,
      isDaily: false,
    },
    {
      title: "Run incident response drill",
      category: "hustle",
      difficulty: "hard",
      tier: "silver",
      xpBase: 150,
      goldBase: 35,
      statTarget: "hustle",
      statGain: 3,
      isDaily: false,
    },
  ],
  dungeons: [
    {
      title: "The Infrastructure Forge",
      description:
        "Provision a complete cloud infrastructure from scratch using IaC, including networking, compute, and storage.",
      objectives: [
        "Design cloud architecture diagram",
        "Write Terraform for networking",
        "Provision compute and storage",
        "Configure IAM and security groups",
        "Validate with automated tests",
      ],
      bonusXP: 1100,
      bonusGold: 280,
      statReward: "intel",
      statAmount: 8,
    },
    {
      title: "The Reliability Sprint",
      description:
        "Build a highly-available system with auto-scaling, health checks, and disaster recovery.",
      objectives: [
        "Configure load balancer and auto-scaling",
        "Set up health checks and readiness probes",
        "Implement centralized logging",
        "Create runbooks for common incidents",
        "Run chaos engineering experiment",
      ],
      bonusXP: 1000,
      bonusGold: 250,
      statReward: "agentIQ",
      statAmount: 7,
    },
  ],
  certifications: [
    {
      certName: "AWS Solutions Architect Associate",
      provider: "Amazon",
      totalWeeks: 10,
      weeklyHours: 12,
      goldBonus: 2000,
    },
    {
      certName: "Certified Kubernetes Administrator (CKA)",
      provider: "CNCF",
      totalWeeks: 8,
      weeklyHours: 12,
      goldBonus: 2000,
    },
  ],
  goals: [
    {
      type: "sprint",
      title: "Automate local dev environment",
      description: "Script a one-command local development setup with Docker Compose.",
      weeksFromNow: 2,
      xpReward: 200,
      goldReward: 100,
    },
    {
      type: "sprint",
      title: "Build CI/CD for a project",
      description: "Create a full CI/CD pipeline with build, test, and deploy stages.",
      weeksFromNow: 4,
      xpReward: 300,
      goldReward: 150,
    },
    {
      type: "monthly",
      title: "Deploy K8s cluster with monitoring",
      description: "Run a Kubernetes cluster with Prometheus, Grafana, and alerting configured.",
      weeksFromNow: 12,
      xpReward: 500,
      goldReward: 300,
    },
    {
      type: "monthly",
      title: "Pass cloud or K8s certification",
      description: "Earn the AWS Solutions Architect or CKA certificate.",
      weeksFromNow: 16,
      xpReward: 500,
      goldReward: 300,
    },
    {
      type: "life",
      title: "Land DevOps Engineer role",
      description: "Secure a DevOps engineer position demonstrating infrastructure and automation expertise.",
      weeksFromNow: 26,
      xpReward: 2000,
      goldReward: 1000,
    },
  ],
  recurringHabits: [
    { title: "Study cloud services (30 min)", category: "learning", priority: 1, recurType: "daily" },
    { title: "Practice Linux / shell scripting", category: "learning", priority: 2, recurType: "weekdays" },
    { title: "Read SRE / DevOps blog", category: "learning", priority: 3, recurType: "weekdays" },
    { title: "Work on IaC project", category: "focus", priority: 1, recurType: "daily" },
    { title: "Practice Kubernetes tasks", category: "learning", priority: 2, recurType: "weekdays" },
    { title: "Review system metrics & logs", category: "focus", priority: 2, recurType: "daily" },
  ],
  questChains: [
    {
      title: "Production Infrastructure from Scratch",
      description:
        "Build production-grade infrastructure step by step, from IaC to observability.",
      steps: [
        { title: "Design architecture & write Terraform", category: "learning", difficulty: "hard", xpBase: 120, goldBase: 30, statTarget: "intel" },
        { title: "Provision networking & compute", category: "learning", difficulty: "hard", xpBase: 120, goldBase: 30, statTarget: "intel" },
        { title: "Containerize applications", category: "learning", difficulty: "normal", xpBase: 80, goldBase: 20, statTarget: "agentIQ" },
        { title: "Deploy to Kubernetes", category: "learning", difficulty: "hard", xpBase: 130, goldBase: 32, statTarget: "agentIQ" },
        { title: "Set up CI/CD pipelines", category: "focus", difficulty: "hard", xpBase: 110, goldBase: 28, statTarget: "intel" },
        { title: "Add monitoring & alerting", category: "focus", difficulty: "legendary", xpBase: 150, goldBase: 38, statTarget: "agentIQ" },
      ],
    },
  ],
  milestones: [
    { title: "Linux & Docker fluent", description: "Comfortable with shell scripting, Dockerfiles, and container basics.", weekNumber: 2 },
    { title: "First infra deployed via IaC", description: "Cloud resources provisioned entirely through Terraform.", weekNumber: 6 },
    { title: "K8s cluster running", description: "A Kubernetes cluster is live with deployed services and monitoring.", weekNumber: 12 },
    { title: "Cert earned", description: "AWS SA or CKA certificate obtained.", weekNumber: 20 },
    { title: "Interview ready", description: "Infrastructure portfolio documented, system design interviews practiced.", weekNumber: 26 },
  ],
};

// ---------------------------------------------------------------------------
// Data Engineer
// ---------------------------------------------------------------------------
const dataEngineerTemplate: RoadmapTemplate = {
  summary:
    "A 26-week roadmap to become a skilled Data Engineer. You will master ETL pipelines, data warehousing, streaming, and orchestration while earning cloud data certifications and building a portfolio of robust data systems.",
  quests: [
    {
      title: "Build ETL pipeline",
      category: "learning",
      difficulty: "hard",
      tier: "silver",
      xpBase: 100,
      goldBase: 25,
      statTarget: "intel",
      statGain: 3,
      isDaily: true,
    },
    {
      title: "Optimize SQL query performance",
      category: "learning",
      difficulty: "hard",
      tier: "silver",
      xpBase: 90,
      goldBase: 22,
      statTarget: "intel",
      statGain: 3,
      isDaily: true,
    },
    {
      title: "Implement data quality checks",
      category: "focus",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 70,
      goldBase: 18,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Write Spark or Airflow job",
      category: "learning",
      difficulty: "hard",
      tier: "silver",
      xpBase: 100,
      goldBase: 25,
      statTarget: "agentIQ",
      statGain: 3,
      isDaily: true,
    },
    {
      title: "Design warehouse schema",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 80,
      goldBase: 20,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Build streaming data pipeline",
      category: "learning",
      difficulty: "hard",
      tier: "gold",
      xpBase: 250,
      goldBase: 60,
      statTarget: "agentIQ",
      statGain: 4,
      isDaily: false,
    },
    {
      title: "Design data model / schema",
      category: "learning",
      difficulty: "normal",
      tier: "bronze",
      xpBase: 70,
      goldBase: 18,
      statTarget: "intel",
      statGain: 2,
      isDaily: true,
    },
    {
      title: "Write pipeline integration tests",
      category: "focus",
      difficulty: "normal",
      tier: "gold",
      xpBase: 200,
      goldBase: 50,
      statTarget: "intel",
      statGain: 3,
      isDaily: false,
    },
    {
      title: "Document data lineage",
      category: "hustle",
      difficulty: "normal",
      tier: "gold",
      xpBase: 200,
      goldBase: 50,
      statTarget: "hustle",
      statGain: 3,
      isDaily: false,
    },
    {
      title: "Set up pipeline monitoring",
      category: "focus",
      difficulty: "hard",
      tier: "silver",
      xpBase: 150,
      goldBase: 35,
      statTarget: "agentIQ",
      statGain: 3,
      isDaily: false,
    },
  ],
  dungeons: [
    {
      title: "The Pipeline Marathon",
      description:
        "Build a production-grade data pipeline from source to warehouse, handling extraction, transformation, loading, and monitoring.",
      objectives: [
        "Design pipeline architecture",
        "Build extraction connectors",
        "Implement transformation logic",
        "Load into data warehouse",
        "Add data quality and monitoring",
      ],
      bonusXP: 1100,
      bonusGold: 280,
      statReward: "intel",
      statAmount: 8,
    },
    {
      title: "The Data Quality Quest",
      description:
        "Audit an existing data system, find and fix quality issues, and implement automated validation.",
      objectives: [
        "Profile data and identify anomalies",
        "Define data quality rules",
        "Implement automated validation",
        "Build alerting for quality failures",
        "Document data contracts",
      ],
      bonusXP: 900,
      bonusGold: 220,
      statReward: "agentIQ",
      statAmount: 7,
    },
  ],
  certifications: [
    {
      certName: "Google Professional Data Engineer",
      provider: "Google",
      totalWeeks: 10,
      weeklyHours: 12,
      goldBonus: 2000,
    },
    {
      certName: "Databricks Data Engineer Associate",
      provider: "Databricks",
      totalWeeks: 8,
      weeklyHours: 12,
      goldBonus: 2000,
    },
  ],
  goals: [
    {
      type: "sprint",
      title: "Build first batch ETL pipeline",
      description: "Create a working batch pipeline that extracts, transforms, and loads data on a schedule.",
      weeksFromNow: 2,
      xpReward: 200,
      goldReward: 100,
    },
    {
      type: "sprint",
      title: "Set up data warehouse",
      description: "Design star-schema tables and load data into a warehouse with proper partitioning.",
      weeksFromNow: 4,
      xpReward: 300,
      goldReward: 150,
    },
    {
      type: "monthly",
      title: "Build 3 production pipelines",
      description: "Have three robust, tested, and monitored data pipelines running.",
      weeksFromNow: 12,
      xpReward: 500,
      goldReward: 300,
    },
    {
      type: "monthly",
      title: "Pass data engineering certification",
      description: "Earn the Google Professional Data Engineer or Databricks certificate.",
      weeksFromNow: 16,
      xpReward: 500,
      goldReward: 300,
    },
    {
      type: "life",
      title: "Land Data Engineer role",
      description: "Secure a data engineer position showcasing pipeline expertise and data modeling skills.",
      weeksFromNow: 26,
      xpReward: 2000,
      goldReward: 1000,
    },
  ],
  recurringHabits: [
    { title: "Study data engineering concepts (30 min)", category: "learning", priority: 1, recurType: "daily" },
    { title: "Practice advanced SQL", category: "learning", priority: 2, recurType: "weekdays" },
    { title: "Read data engineering blog/paper", category: "learning", priority: 3, recurType: "weekdays" },
    { title: "Work on pipeline project", category: "focus", priority: 1, recurType: "daily" },
    { title: "Practice Spark or Airflow", category: "learning", priority: 2, recurType: "weekdays" },
    { title: "Review pipeline health metrics", category: "focus", priority: 2, recurType: "daily" },
  ],
  questChains: [
    {
      title: "Production Data Platform",
      description:
        "Build a complete data platform from ingestion to analytics layer, step by step.",
      steps: [
        { title: "Design data architecture", category: "learning", difficulty: "hard", xpBase: 100, goldBase: 25, statTarget: "intel" },
        { title: "Build ingestion layer", category: "learning", difficulty: "hard", xpBase: 120, goldBase: 30, statTarget: "intel" },
        { title: "Implement transformation layer", category: "learning", difficulty: "hard", xpBase: 120, goldBase: 30, statTarget: "agentIQ" },
        { title: "Set up data warehouse", category: "learning", difficulty: "hard", xpBase: 130, goldBase: 32, statTarget: "intel" },
        { title: "Add data quality & testing", category: "focus", difficulty: "hard", xpBase: 110, goldBase: 28, statTarget: "agentIQ" },
        { title: "Build monitoring & alerting", category: "focus", difficulty: "legendary", xpBase: 150, goldBase: 38, statTarget: "agentIQ" },
      ],
    },
  ],
  milestones: [
    { title: "SQL & Python fluent", description: "Advanced SQL and Python data manipulation skills solid.", weekNumber: 2 },
    { title: "First pipeline running", description: "A batch ETL pipeline is running on a schedule.", weekNumber: 6 },
    { title: "Data platform built", description: "Warehouse, pipelines, and quality checks all operational.", weekNumber: 12 },
    { title: "Cert earned", description: "Google or Databricks data engineering certificate obtained.", weekNumber: 20 },
    { title: "Interview ready", description: "Pipeline portfolio documented, system design interviews practiced.", weekNumber: 26 },
  ],
};

// ---------------------------------------------------------------------------
// Template Registry
// ---------------------------------------------------------------------------
export const ROLE_TEMPLATES: Record<string, RoadmapTemplate> = {
  "ml engineer": mlEngineerTemplate,
  "full stack developer": fullStackTemplate,
  "data scientist": dataScientistTemplate,
  "devops engineer": devOpsTemplate,
  "data engineer": dataEngineerTemplate,
};

/**
 * Look up a roadmap template by role name.
 *
 * Matching is case-insensitive and supports partial matches (e.g. "devops"
 * will match "devops engineer"). Falls back to the ML Engineer template when
 * no match is found.
 */
export function getTemplate(role: string): RoadmapTemplate {
  const needle = role.toLowerCase().trim();

  // Exact match first
  if (ROLE_TEMPLATES[needle]) {
    return ROLE_TEMPLATES[needle];
  }

  // Partial match: check if the needle is contained in a key or vice-versa
  for (const key of Object.keys(ROLE_TEMPLATES)) {
    if (key.includes(needle) || needle.includes(key)) {
      return ROLE_TEMPLATES[key];
    }
  }

  // Fallback
  return mlEngineerTemplate;
}
