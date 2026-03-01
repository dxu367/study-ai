import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { submitTestSchema } from "@/lib/validators";
import { gradeShortAnswer } from "@/lib/ai/grade-answers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);
  const { id } = await params;

  const attempt = await prisma.testAttempt.findFirst({
    where: { id, questionSet: { course: { userId } } },
    include: {
      questionSet: { include: { questions: true } },
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Test attempt not found" }, { status: 404 });
  }

  if (attempt.completedAt) {
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  }

  const body = await req.json();
  const { answers } = submitTestSchema.parse(body);

  const questionsMap = new Map(
    attempt.questionSet.questions.map((q) => [q.id, q])
  );

  let correctCount = 0;
  const testAnswers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    aiFeedback: string | null;
  }[] = [];

  for (const answer of answers) {
    const question = questionsMap.get(answer.questionId);
    if (!question) continue;

    let isCorrect = false;
    let aiFeedback: string | null = null;

    if (question.questionType === "SHORT_ANSWER") {
      // Use Claude to grade short answers
      const result = await gradeShortAnswer(
        question.questionText,
        question.correctAnswer,
        answer.userAnswer
      );
      isCorrect = result.isCorrect;
      aiFeedback = result.feedback;
    } else {
      // Exact match for MC and TF
      isCorrect =
        answer.userAnswer.trim().toLowerCase() ===
        question.correctAnswer.trim().toLowerCase();
    }

    if (isCorrect) correctCount++;

    testAnswers.push({
      questionId: answer.questionId,
      userAnswer: answer.userAnswer,
      isCorrect,
      aiFeedback,
    });
  }

  const score =
    answers.length > 0 ? (correctCount / answers.length) * 100 : 0;

  // Save all answers and update attempt
  await prisma.$transaction([
    ...testAnswers.map((ta) =>
      prisma.testAnswer.create({
        data: {
          testAttemptId: id,
          ...ta,
        },
      })
    ),
    prisma.testAttempt.update({
      where: { id },
      data: { score, completedAt: new Date() },
    }),
  ]);

  // Return results for display
  const results = testAnswers.map((ta) => {
    const question = questionsMap.get(ta.questionId)!;
    return {
      questionText: question.questionText,
      questionType: question.questionType,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      userAnswer: ta.userAnswer,
      isCorrect: ta.isCorrect,
      aiFeedback: ta.aiFeedback,
    };
  });

  return NextResponse.json({ score, results });
}
