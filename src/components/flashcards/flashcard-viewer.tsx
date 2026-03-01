"use client";

import { useState } from "react";

interface FlashcardViewerProps {
  front: string;
  back: string;
}

export function FlashcardViewer({ front, back }: FlashcardViewerProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="perspective-1000 cursor-pointer select-none"
      onClick={() => setFlipped(!flipped)}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
          minHeight: "250px",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-white rounded-xl border-2 border-gray-200 shadow-sm p-8 flex items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-3">QUESTION</p>
            <p className="text-lg font-medium">{front}</p>
            <p className="text-xs text-gray-400 mt-4">Click to flip</p>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-blue-50 rounded-xl border-2 border-blue-200 shadow-sm p-8 flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="text-center">
            <p className="text-xs text-blue-400 mb-3">ANSWER</p>
            <p className="text-lg">{back}</p>
            <p className="text-xs text-blue-400 mt-4">Click to flip back</p>
          </div>
        </div>
      </div>
    </div>
  );
}
