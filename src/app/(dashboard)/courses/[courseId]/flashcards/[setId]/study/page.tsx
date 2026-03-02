import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { StudyClient } from "./study-client";

export default async function StudyPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string; setId: string }>;
  searchParams: Promise<{ all?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session!);
  const { courseId, setId } = await params;
  const { all } = await searchParams;
  const showAll = all === "true";

  const flashcardSet = await prisma.flashcardSet.findFirst({
    where: { id: setId, course: { id: courseId, userId } },
    include: {
      cards: true,
      course: true,
    },
  });

  if (!flashcardSet) notFound();

  let knownCardIds: Set<string> = new Set();

  if (!showAll) {
    const lastSession = await prisma.studySession.findFirst({
      where: {
        flashcardSetId: setId,
        completedAt: { not: null },
      },
      orderBy: { completedAt: "desc" },
      include: {
        responses: {
          where: { known: true },
          select: { flashcardId: true },
        },
      },
    });

    if (lastSession) {
      knownCardIds = new Set(lastSession.responses.map((r) => r.flashcardId));
    }
  }

  const allCards = flashcardSet.cards.map((c) => ({
    id: c.id,
    front: c.front,
    back: c.back,
  }));

  const filteredCards = showAll
    ? allCards
    : allCards.filter((c) => !knownCardIds.has(c.id));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{flashcardSet.name}</h1>
        <p className="text-gray-500">{flashcardSet.course.name}</p>
      </div>

      <StudyClient
        cards={filteredCards}
        flashcardSetId={flashcardSet.id}
        courseId={courseId}
        totalCardCount={allCards.length}
        knownCardCount={knownCardIds.size}
      />
    </div>
  );
}
