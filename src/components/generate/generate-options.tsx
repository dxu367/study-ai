"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GenerateOptionsProps {
  courseId: string;
  chapters: { id: string; name: string; hasProcessedUploads: boolean }[];
  examUploads: { id: string; fileName: string }[];
}

export function GenerateOptions({ courseId, chapters, examUploads }: GenerateOptionsProps) {
  const router = useRouter();
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>(
    chapters.filter((c) => c.hasProcessedUploads).map((c) => c.id)
  );
  const [questionCount, setQuestionCount] = useState(15);
  const [questionTypes, setQuestionTypes] = useState<string[]>(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]);
  const [styleGuideId, setStyleGuideId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const toggleChapter = (id: string) => {
    setSelectedChapterIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleQuestionType = (type: string) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const selectableChapters = chapters.filter((c) => c.hasProcessedUploads);

  const handleGenerate = async () => {
    if (selectedChapterIds.length === 0) {
      setError("Select at least one chapter");
      return;
    }
    if (questionTypes.length === 0) {
      setError("Select at least one question type");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          chapterIds: selectedChapterIds,
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
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">Generate Practice Test</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Chapter Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Chapters
          </label>
          <div className="space-y-2">
            {selectableChapters.map((chapter) => (
              <label key={chapter.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedChapterIds.includes(chapter.id)}
                  onChange={() => toggleChapter(chapter.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{chapter.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600">Questions:</label>
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

        {/* Question Types */}
        <div>
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

        {/* Style Guide */}
        {examUploads.length > 0 && (
          <div>
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
          onClick={handleGenerate}
          loading={generating}
          disabled={selectedChapterIds.length === 0}
        >
          {generating ? "Generating..." : "Generate Practice Test"}
        </Button>
      </CardContent>
    </Card>
  );
}
