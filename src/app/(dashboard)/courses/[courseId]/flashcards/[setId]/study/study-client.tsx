"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { StudyDeck } from "@/components/flashcards/study-deck";

interface StudyClientProps {
  cards: { id: string; front: string; back: string }[];
  flashcardSetId: string;
  courseId: string;
  totalCardCount?: number;
  knownCardCount?: number;
}

export function StudyClient({
  cards,
  flashcardSetId,
  courseId,
  totalCardCount,
  knownCardCount,
}: StudyClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleComplete = async (responses: Record<string, boolean>) => {
    await fetch("/api/study-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flashcardSetId, responses }),
    });

    router.push(`/courses/${courseId}`);
    router.refresh();
  };

  if (cards.length === 0 && knownCardCount && knownCardCount > 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>You already know all {knownCardCount} cards in this set!</p>
        <Link
          href={`${pathname}?all=true`}
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Study All
        </Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        This flashcard set is empty.
      </div>
    );
  }

  return (
    <>
      {knownCardCount !== undefined && knownCardCount > 0 && (
        <div className="mb-4 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg flex items-center justify-between">
          <span>Skipping {knownCardCount} cards you already know.</span>
          <Link
            href={`${pathname}?all=true`}
            className="text-blue-600 hover:underline"
          >
            Study All
          </Link>
        </div>
      )}
      <StudyDeck
        cards={cards}
        sessionId=""
        onComplete={handleComplete}
      />
    </>
  );
}
