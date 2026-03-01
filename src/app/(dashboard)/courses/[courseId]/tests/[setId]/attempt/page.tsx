import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { TestClient } from "./test-client";

export default async function TestAttemptPage({
  params,
}: {
  params: Promise<{ courseId: string; setId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session!);
  const { courseId, setId } = await params;

  const questionSet = await prisma.questionSet.findFirst({
    where: { id: setId, course: { id: courseId, userId } },
    include: {
      questions: true,
      course: true,
    },
  });

  if (!questionSet) notFound();

  const questions = questionSet.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    questionType: q.questionType,
    options: q.options ? (JSON.parse(q.options) as string[]) : null,
  }));

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{questionSet.name}</h1>
        <p className="text-gray-500">
          {questionSet.course.name} &middot; {questions.length} questions
        </p>
      </div>

      <TestClient
        questions={questions}
        questionSetId={questionSet.id}
        courseId={courseId}
      />
    </div>
  );
}
