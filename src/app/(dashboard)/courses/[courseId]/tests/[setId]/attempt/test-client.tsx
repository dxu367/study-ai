"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TestPlayer } from "@/components/tests/test-player";
import { TestResults } from "@/components/tests/test-results";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: string[] | null;
}

interface TestResult {
  questionText: string;
  questionType: string;
  correctAnswer: string;
  explanation: string | null;
  userAnswer: string;
  isCorrect: boolean | null;
  aiFeedback: string | null;
}

interface TestClientProps {
  questions: Question[];
  questionSetId: string;
  courseId: string;
}

export function TestClient({ questions, questionSetId, courseId }: TestClientProps) {
  const router = useRouter();
  const [results, setResults] = useState<{ score: number; results: TestResult[] } | null>(null);

  const handleSubmit = async (answers: Record<string, string>) => {
    // Create attempt
    const attemptRes = await fetch("/api/test-attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionSetId }),
    });

    if (!attemptRes.ok) throw new Error("Failed to create attempt");
    const attempt = await attemptRes.json();

    // Submit answers
    const submitRes = await fetch(`/api/test-attempts/${attempt.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([questionId, userAnswer]) => ({
          questionId,
          userAnswer,
        })),
      }),
    });

    if (!submitRes.ok) throw new Error("Failed to submit test");
    const data = await submitRes.json();
    setResults(data);
  };

  if (results) {
    return (
      <div className="space-y-6">
        <TestResults score={results.score} results={results.results} />
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push(`/courses/${courseId}`)}>
            Back to Course
          </Button>
          <Button variant="secondary" onClick={() => setResults(null)}>
            Retake Test
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        This test has no questions.
      </div>
    );
  }

  return <TestPlayer questions={questions} onSubmit={handleSubmit} />;
}
