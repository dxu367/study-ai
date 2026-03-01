import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { generateFlashcardsSchema } from "@/lib/validators";
import { generateFlashcards } from "@/lib/ai/generate-flashcards";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);

  try {
    const body = await req.json();
    const data = generateFlashcardsSchema.parse(body);

    // Verify ownership
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

    const cards = await generateFlashcards(upload.extractedText, data.count);

    const flashcardSet = await prisma.flashcardSet.create({
      data: {
        name: `Flashcards from ${upload.fileName}`,
        courseId: data.courseId,
        uploadId: data.uploadId,
        cards: {
          create: cards.map((card) => ({
            front: card.front,
            back: card.back,
          })),
        },
      },
      include: { _count: { select: { cards: true } } },
    });

    return NextResponse.json(flashcardSet, { status: 201 });
  } catch (error) {
    console.error("Flashcard generation failed:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
