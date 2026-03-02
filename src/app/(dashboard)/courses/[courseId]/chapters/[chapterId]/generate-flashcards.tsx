"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface GenerateFlashcardsProps {
  courseId: string;
  chapterId: string;
}

export function GenerateFlashcards({ courseId, chapterId }: GenerateFlashcardsProps) {
  const router = useRouter();
  const [count, setCount] = useState(20);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, chapterId, count }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Generation failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Generate Flashcards</h3>
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-600">Count:</label>
        <input
          type="range"
          min={5}
          max={50}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm font-medium w-8 text-right">{count}</span>
      </div>
      <Button onClick={handleGenerate} loading={generating}>
        {generating ? "Generating..." : "Generate Flashcards"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
