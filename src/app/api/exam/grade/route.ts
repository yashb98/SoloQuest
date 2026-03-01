// api/exam/grade/route.ts — Grade exam answers via Claude AI
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { gradeAnswer } from "@/lib/ai";
import { xpForLevel } from "@/lib/xp";
import { processXPGain } from "@/lib/leveling";

export const dynamic = "force-dynamic";

interface Answer {
  questionId: string;
  questionText: string;
  marks: number;
  rubric: string;
  answer: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { examId, answers } = body as { examId: number; answers: Answer[] };

  if (!examId || !answers?.length) {
    return NextResponse.json(
      { error: "examId and answers required" },
      { status: 400 }
    );
  }

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  // Grade each answer
  const results = [];
  let totalMarks = 0;
  let totalAvailable = 0;

  for (const ans of answers) {
    try {
      const gradeJson = await gradeAnswer({
        questionText: ans.questionText,
        marksAvailable: ans.marks,
        rubric: ans.rubric,
        candidateAnswer: ans.answer,
      });
      const grade = JSON.parse(gradeJson);
      totalMarks += grade.marks_awarded;
      totalAvailable += ans.marks;
      results.push({ questionId: ans.questionId, ...grade });
    } catch {
      // If grading fails for a question, give 0
      totalAvailable += ans.marks;
      results.push({
        questionId: ans.questionId,
        marks_awarded: 0,
        grade: "Error",
        feedback: "Grading failed for this question.",
      });
    }
  }

  const score = Math.round((totalMarks / totalAvailable) * 100);
  const passMark = exam.gateLevel <= 10 ? 60 : exam.gateLevel <= 30 ? 65 : 70;
  const passed = score >= passMark;

  // Update exam record
  await prisma.exam.update({
    where: { id: examId },
    data: {
      score,
      passed,
      takenAt: new Date(),
      nextAllowed: passed
        ? null
        : new Date(Date.now() + 48 * 60 * 60 * 1000), // 48hr cooldown
    },
  });

  // If passed, award XP and level up past the gate
  if (passed) {
    const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
    if (hunter) {
      const xpAward = xpForLevel(exam.gateLevel) * 0.5; // 50% of level XP as exam reward
      const levelResult = processXPGain(
        hunter.xp,
        hunter.level,
        hunter.xpToNext,
        Math.floor(xpAward)
      );

      // Force level past the gate
      const newLevel = Math.max(levelResult.newLevel, exam.gateLevel);
      const newXPToNext = xpForLevel(newLevel);

      await prisma.hunter.update({
        where: { id: 1 },
        data: {
          level: newLevel,
          rank: levelResult.newRank,
          xp: levelResult.newXP,
          xpToNext: newXPToNext,
          intelligence: { increment: 5 },
        },
      });

      await prisma.exam.update({
        where: { id: examId },
        data: { xpAwarded: Math.floor(xpAward) },
      });
    }
  }

  return NextResponse.json({
    examId,
    score,
    passMark,
    passed,
    results,
    nextAllowed: passed ? null : new Date(Date.now() + 48 * 60 * 60 * 1000),
  });
}
