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

    // Verify chapter belongs to user's course
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: data.chapterId,
        course: { id: data.courseId, userId },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Fetch all completed lecture notes uploads for this chapter
    const uploads = await prisma.upload.findMany({
      where: {
        chapterId: data.chapterId,
        contentType: "LECTURE_NOTES",
        processingStatus: "COMPLETED",
        extractedText: { not: null },
      },
    });

    if (uploads.length === 0) {
      return NextResponse.json({ error: "No processed lecture notes found in this chapter" }, { status: 404 });
    }

    const combinedText = uploads.map((u) => u.extractedText!).join("\n\n---\n\n");

    const cards = await generateFlashcards(combinedText, data.count);

    const flashcardSet = await prisma.flashcardSet.create({
      data: {
        name: `Flashcards from ${chapter.name}`,
        courseId: data.courseId,
        chapterId: data.chapterId,
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
