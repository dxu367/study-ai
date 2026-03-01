import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { StudyClient } from "./study-client";

export default async function StudyPage({
  params,
}: {
  params: Promise<{ courseId: string; setId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session!);
  const { courseId, setId } = await params;

  const flashcardSet = await prisma.flashcardSet.findFirst({
    where: { id: setId, course: { id: courseId, userId } },
    include: {
      cards: true,
      course: true,
    },
  });

  if (!flashcardSet) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{flashcardSet.name}</h1>
        <p className="text-gray-500">{flashcardSet.course.name}</p>
      </div>

      <StudyClient
        cards={flashcardSet.cards.map((c) => ({
          id: c.id,
          front: c.front,
          back: c.back,
        }))}
        flashcardSetId={flashcardSet.id}
        courseId={courseId}
      />
    </div>
  );
}
