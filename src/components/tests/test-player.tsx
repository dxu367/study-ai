"use client";

import { useState } from "react";
import { QuestionRenderer } from "./question-renderer";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: string[] | null;
}

interface TestPlayerProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => Promise<void>;
}

export function TestPlayer({ questions, onSubmit }: TestPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const pageQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const answeredCount = Object.values(answers).filter((a) => a.trim()).length;
  const allAnswered = answeredCount === questions.length;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(answers);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {answeredCount} of {questions.length} answered
        </span>
        <span>
          Page {currentPage + 1} of {totalPages}
        </span>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {pageQuestions.map((q, i) => (
          <div key={q.id} className="bg-white rounded-xl border p-6">
            <QuestionRenderer
              questionText={q.questionText}
              questionType={q.questionType}
              options={q.options}
              answer={answers[q.id] || ""}
              onChange={(val) =>
                setAnswers((prev) => ({ ...prev, [q.id]: val }))
              }
              questionNumber={currentPage * questionsPerPage + i + 1}
            />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 0}
        >
          Previous
        </Button>

        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-8 h-8 rounded text-xs font-medium transition ${
                i === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentPage < totalPages - 1 ? (
          <Button
            variant="secondary"
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={!allAnswered}
          >
            Submit Test
          </Button>
        )}
      </div>
    </div>
  );
}
