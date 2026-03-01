"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GenerateOptionsProps {
  courseId: string;
  uploads: { id: string; fileName: string }[];
  examUploads: { id: string; fileName: string }[];
}

export function GenerateOptions({ courseId, uploads, examUploads }: GenerateOptionsProps) {
  const router = useRouter();
  const [selectedUpload, setSelectedUpload] = useState(uploads[0]?.id || "");
  const [flashcardCount, setFlashcardCount] = useState(20);
  const [questionCount, setQuestionCount] = useState(15);
  const [questionTypes, setQuestionTypes] = useState<string[]>(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]);
  const [styleGuideId, setStyleGuideId] = useState("");
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [error, setError] = useState("");

  const toggleQuestionType = (type: string) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerateFlashcards = async () => {
    setError("");
    setGeneratingFlashcards(true);
    try {
      const res = await fetch("/api/generate/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          uploadId: selectedUpload,
          count: flashcardCount,
        }),
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
      setGeneratingFlashcards(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (questionTypes.length === 0) {
      setError("Select at least one question type");
      return;
    }
    setError("");
    setGeneratingQuestions(true);
    try {
      const res = await fetch("/api/generate/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          uploadId: selectedUpload,
          count: questionCount,
          questionTypes,
          styleGuideUploadId: styleGuideId || undefined,
        }),
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
      setGeneratingQuestions(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">Generate Study Materials</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Source Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source Material
          </label>
          <select
            value={selectedUpload}
            onChange={(e) => setSelectedUpload(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {uploads.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fileName}
              </option>
            ))}
          </select>
        </div>

        {/* Flashcards Section */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-3">Flashcards</h3>
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm text-gray-600">Count:</label>
            <input
              type="range"
              min={5}
              max={50}
              value={flashcardCount}
              onChange={(e) => setFlashcardCount(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium w-8 text-right">{flashcardCount}</span>
          </div>
          <Button
            onClick={handleGenerateFlashcards}
            loading={generatingFlashcards}
            disabled={!selectedUpload}
          >
            {generatingFlashcards ? "Generating Flashcards..." : "Generate Flashcards"}
          </Button>
        </div>

        {/* Questions Section */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-3">Practice Test</h3>

          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm text-gray-600">Count:</label>
            <input
              type="range"
              min={5}
              max={30}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium w-8 text-right">{questionCount}</span>
          </div>

          <div className="mb-3">
            <label className="text-sm text-gray-600 block mb-1">Question Types:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "MULTIPLE_CHOICE", label: "Multiple Choice" },
                { key: "TRUE_FALSE", label: "True/False" },
                { key: "SHORT_ANSWER", label: "Short Answer" },
              ].map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => toggleQuestionType(type.key)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                    questionTypes.includes(type.key)
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-gray-200 text-gray-500"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {examUploads.length > 0 && (
            <div className="mb-3">
              <label className="text-sm text-gray-600 block mb-1">
                Exam Style Guide (optional):
              </label>
              <select
                value={styleGuideId}
                onChange={(e) => setStyleGuideId(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {examUploads.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fileName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={handleGenerateQuestions}
            loading={generatingQuestions}
            disabled={!selectedUpload}
          >
            {generatingQuestions ? "Generating Questions..." : "Generate Practice Test"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
