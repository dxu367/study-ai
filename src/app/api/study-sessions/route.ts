import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);

  const body = await req.json();
  const { flashcardSetId, responses } = body as {
    flashcardSetId: string;
    responses?: Record<string, boolean>;
  };

  // Verify ownership
  const set = await prisma.flashcardSet.findFirst({
    where: { id: flashcardSetId, course: { userId } },
  });
  if (!set) {
    return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 });
  }

  // Create session and optionally save responses
  const studySession = await prisma.studySession.create({
    data: {
      flashcardSetId,
      completedAt: responses ? new Date() : null,
      responses: responses
        ? {
            create: Object.entries(responses).map(([flashcardId, known]) => ({
              flashcardId,
              known,
            })),
          }
        : undefined,
    },
    include: { _count: { select: { responses: true } } },
  });

  return NextResponse.json(studySession, { status: 201 });
}
