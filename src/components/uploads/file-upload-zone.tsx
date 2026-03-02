"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadZoneProps {
  courseId: string;
  contentType: "LECTURE_NOTES" | "PREVIOUS_EXAM";
  chapterId?: string;
  onUploaded: () => void;
}

export function FileUploadZone({ courseId, contentType, chapterId, onUploaded }: FileUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);
    formData.append("contentType", contentType);
    if (chapterId) formData.append("chapterId", chapterId);

    try {
      const res = await fetch("/api/uploads", { method: "POST", body: formData });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed");
        return;
      }

      const upload = await res.json();

      // Auto-process
      await fetch(`/api/uploads/${upload.id}/process`, { method: "POST" });

      onUploaded();
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {uploading ? (
        <div className="space-y-2">
          <div className="animate-spin mx-auto h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500">Uploading and processing...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-600">
            Drag & drop a file here, or
          </p>
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            Browse Files
          </Button>
          <p className="text-xs text-gray-400">PDF, images (PNG/JPG/WebP), or text files up to 10MB</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  );
}
