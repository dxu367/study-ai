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

    const upload = await prisma.upload.findFirst({
      where: {
        id: data.uploadId,
        course: { id: data.courseId, userId },
        processingStatus: "COMPLETED",
      },
    });

    if (!upload || !upload.extractedText) {
      return NextResponse.json({ error: "Upload not found or not processed" }, { status: 404 });
    }

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
      upload.extractedText,
      data.count,
      data.questionTypes,
      styleGuideText
    );

    const questionSet = await prisma.questionSet.create({
      data: {
        name: `Test from ${upload.fileName}`,
        courseId: data.courseId,
        uploadId: data.uploadId,
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
