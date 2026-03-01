// api/exam/generate/route.ts — Generate exam via Claude AI
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateExam } from "@/lib/ai";

export const dynamic = "force-dynamic";

const GATE_TOPICS: Record<number, string[]> = {
  5: ["Python basics", "NumPy arrays", "Pandas DataFrames", "basic statistics"],
  10: ["linear regression", "logistic regression", "decision trees", "model evaluation metrics"],
  15: ["neural networks basics", "gradient descent", "CNNs", "NLP fundamentals"],
  20: ["deep learning architectures", "transfer learning", "GANs", "attention mechanisms"],
  25: ["system design for ML", "MLOps", "model deployment", "A/B testing"],
  30: ["advanced NLP", "transformer architecture", "reinforcement learning", "graph neural networks"],
  35: ["distributed training", "model optimization", "ML system reliability", "data pipelines at scale"],
  40: ["research paper analysis", "novel architecture design", "ML leadership", "cross-functional communication"],
  50: ["end-to-end ML system design", "org-level ML strategy", "cutting-edge research", "mentorship scenarios"],
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { gateLevel } = body as { gateLevel: number };

  if (!gateLevel) {
    return NextResponse.json({ error: "gateLevel required" }, { status: 400 });
  }

  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  // Check cooldown
  const lastExam = await prisma.exam.findFirst({
    where: { gateLevel },
    orderBy: { createdAt: "desc" },
  });

  if (lastExam && lastExam.nextAllowed && new Date() < lastExam.nextAllowed) {
    return NextResponse.json({
      error: "Exam cooldown active",
      nextAllowed: lastExam.nextAllowed,
    }, { status: 429 });
  }

  // Get past topics to avoid repetition
  const pastExams = await prisma.exam.findMany({
    where: { gateLevel },
    select: { questionsJson: true },
  });
  const pastTopics = pastExams.map((e) => {
    try {
      const parsed = JSON.parse(e.questionsJson);
      return parsed.title || "";
    } catch {
      return "";
    }
  });

  const topics = GATE_TOPICS[gateLevel] || GATE_TOPICS[5];
  const timeLimit = gateLevel <= 10 ? 30 : gateLevel <= 30 ? 45 : 60;
  const passMark = gateLevel <= 10 ? 60 : gateLevel <= 30 ? 65 : 70;

  try {
    const examJson = await generateExam({
      level: gateLevel,
      type: "gate",
      curriculumTopics: topics,
      timeLimit,
      passMark,
      pastTopics,
    });

    // Store the exam
    const exam = await prisma.exam.create({
      data: {
        gateLevel,
        type: "gate",
        questionsJson: examJson,
        attemptNum: (lastExam?.attemptNum ?? 0) + 1,
      },
    });

    return NextResponse.json({
      examId: exam.id,
      exam: JSON.parse(examJson),
      timeLimit,
      passMark,
    });
  } catch (error) {
    console.error("Exam generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate exam" },
      { status: 500 }
    );
  }
}
