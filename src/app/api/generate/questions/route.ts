import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { generateQuestionsSchema } from "@/lib/validators";
import { generateQuestions } from "@/lib/ai/generate-questions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);

  try {
    const body = await req.json();
    const data = generateQuestionsSchema.parse(body);

    // Verify all chapters belong to user's course
    const chapters = await prisma.chapter.findMany({
      where: {
        id: { in: data.chapterIds },
        course: { id: data.courseId, userId },
      },
    });

    if (chapters.length !== data.chapterIds.length) {
      return NextResponse.json({ error: "One or more chapters not found" }, { status: 404 });
    }

    // Fetch all completed lecture notes uploads across those chapters
    const uploads = await prisma.upload.findMany({
      where: {
        chapterId: { in: data.chapterIds },
        contentType: "LECTURE_NOTES",
        processingStatus: "COMPLETED",
        extractedText: { not: null },
      },
    });

    if (uploads.length === 0) {
      return NextResponse.json({ error: "No processed lecture notes found in selected chapters" }, { status: 404 });
    }

    const combinedText = uploads.map((u) => u.extractedText!).join("\n\n---\n\n");

    // Get style guide text if provided
    let styleGuideText: string | undefined;
    if (data.styleGuideUploadId) {
      const styleGuide = await prisma.upload.findFirst({
        where: {
          id: data.styleGuideUploadId,
          course: { id: data.courseId, userId },
          contentType: "PREVIOUS_EXAM",
          processingStatus: "COMPLETED",
        },
      });
      if (styleGuide?.extractedText) {
        styleGuideText = styleGuide.extractedText;
      }
    }

    const questions = await generateQuestions(
      combinedText,
      data.count,
      data.questionTypes,
      styleGuideText
    );

    const chapterNames = chapters.map((c) => c.name).join(", ");
    const questionSet = await prisma.questionSet.create({
      data: {
        name: `Test from ${chapterNames}`,
        courseId: data.courseId,
        styleGuideUploadId: data.styleGuideUploadId || null,
        questions: {
          create: questions.map((q) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null,
          })),
        },
      },
      include: { _count: { select: { questions: true } } },
    });

    return NextResponse.json(questionSet, { status: 201 });
  } catch (error) {
    console.error("Question generation failed:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
