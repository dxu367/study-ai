"use client";

import { useFlashcardStudy } from "@/hooks/use-flashcard-study";
import { FlashcardViewer } from "./flashcard-viewer";
import { StudyProgress } from "./study-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface StudyDeckProps {
  cards: Flashcard[];
  sessionId: string;
  onComplete: (responses: Record<string, boolean>) => void;
}

export function StudyDeck({ cards, sessionId, onComplete }: StudyDeckProps) {
  const {
    currentCard,
    currentIndex,
    totalCards,
    knownCount,
    unknownCount,
    isComplete,
    responses,
    respond,
    reset,
  } = useFlashcardStudy(cards);

  if (isComplete) {
    const score = totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;

    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <div className="text-5xl font-bold text-blue-600">{score}%</div>
          <h2 className="text-xl font-semibold">Session Complete!</h2>
          <p className="text-gray-500">
            You knew {knownCount} out of {totalCards} cards.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button onClick={() => { onComplete(responses); }}>
              Save & Finish
            </Button>
            <Button variant="secondary" onClick={reset}>
              Study Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="space-y-6">
      <StudyProgress
        current={currentIndex}
        total={totalCards}
        known={knownCount}
        unknown={unknownCount}
      />

      <FlashcardViewer front={currentCard.front} back={currentCard.back} />

      <div className="flex gap-3 justify-center">
        <Button
          variant="danger"
          size="lg"
          onClick={() => respond(false)}
        >
          Don&apos;t Know
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => respond(true)}
        >
          Know It
        </Button>
      </div>
    </div>
  );
}
