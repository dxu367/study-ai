"use client";

import { useRouter } from "next/navigation";
import { StudyDeck } from "@/components/flashcards/study-deck";

interface StudyClientProps {
  cards: { id: string; front: string; back: string }[];
  flashcardSetId: string;
  courseId: string;
}

export function StudyClient({ cards, flashcardSetId, courseId }: StudyClientProps) {
  const router = useRouter();

  const handleComplete = async (responses: Record<string, boolean>) => {
    await fetch("/api/study-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flashcardSetId, responses }),
    });

    router.push(`/courses/${courseId}`);
    router.refresh();
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        This flashcard set is empty.
      </div>
    );
  }

  return (
    <StudyDeck
      cards={cards}
      sessionId=""
      onComplete={handleComplete}
    />
  );
}
