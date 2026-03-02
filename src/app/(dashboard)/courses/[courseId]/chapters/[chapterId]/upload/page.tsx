"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { clsx } from "clsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/uploads/file-upload-zone";
import { PasteTextZone } from "@/components/uploads/paste-text-zone";
import { UploadList } from "@/components/uploads/upload-list";

export default function ChapterUploadPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const chapterId = params.chapterId as string;
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [uploads, setUploads] = useState<Array<{
    id: string;
    fileName: string;
    fileType: string;
    contentType: string;
    processingStatus: string;
    createdAt: string;
  }>>([]);

  const fetchUploads = useCallback(async () => {
    const res = await fetch(`/api/uploads?courseId=${courseId}&chapterId=${chapterId}`);
    if (res.ok) {
      const data = await res.json();
      setUploads(data);
    }
  }, [courseId, chapterId]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Upload Notes</h1>
        <Button
          variant="secondary"
          onClick={() => router.push(`/courses/${courseId}/chapters/${chapterId}`)}
        >
          Back to Chapter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Add Lecture Notes</h2>
          <p className="text-sm text-gray-500">
            Upload a file or paste text for this chapter
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {[
              { key: "upload" as const, label: "Upload File" },
              { key: "paste" as const, label: "Paste Text" },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setInputMode(option.key)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                  inputMode === option.key
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {inputMode === "paste" ? (
            <PasteTextZone courseId={courseId} chapterId={chapterId} onUploaded={fetchUploads} />
          ) : (
            <FileUploadZone
              courseId={courseId}
              contentType="LECTURE_NOTES"
              chapterId={chapterId}
              onUploaded={fetchUploads}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Uploaded Files</h2>
        </CardHeader>
        <CardContent>
          <UploadList uploads={uploads} />
        </CardContent>
      </Card>
    </div>
  );
}
