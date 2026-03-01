"use client";

import { useState, useCallback } from "react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface StudyState {
  currentIndex: number;
  responses: Record<string, boolean>;
  isComplete: boolean;
}

export function useFlashcardStudy(cards: Flashcard[]) {
  const [state, setState] = useState<StudyState>({
    currentIndex: 0,
    responses: {},
    isComplete: false,
  });

  const currentCard = cards[state.currentIndex] || null;
  const totalCards = cards.length;
  const knownCount = Object.values(state.responses).filter(Boolean).length;
  const unknownCount = Object.values(state.responses).filter((v) => !v).length;

  const respond = useCallback(
    (known: boolean) => {
      setState((prev) => {
        const newResponses = {
          ...prev.responses,
          [cards[prev.currentIndex].id]: known,
        };
        const nextIndex = prev.currentIndex + 1;
        return {
          currentIndex: nextIndex,
          responses: newResponses,
          isComplete: nextIndex >= cards.length,
        };
      });
    },
    [cards]
  );

  const reset = useCallback(() => {
    setState({ currentIndex: 0, responses: {}, isComplete: false });
  }, []);

  return {
    currentCard,
    currentIndex: state.currentIndex,
    totalCards,
    knownCount,
    unknownCount,
    isComplete: state.isComplete,
    responses: state.responses,
    respond,
    reset,
  };
}
