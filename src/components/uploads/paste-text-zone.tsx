"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PasteTextZoneProps {
  courseId: string;
  chapterId?: string;
  onUploaded: () => void;
}

export function PasteTextZone({ courseId, chapterId, onUploaded }: PasteTextZoneProps) {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/uploads/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, text, title: title || undefined, chapterId: chapterId || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save notes");
        return;
      }

      setText("");
      setTitle("");
      onUploaded();
    } catch {
      setError("Failed to save notes");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-2 border-dashed rounded-xl p-6 space-y-4">
      <input
        type="text"
        placeholder={`Title (defaults to "Pasted notes ${new Date().toLocaleDateString()}")`}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <textarea
        placeholder="Paste or type your lecture notes here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Text will be saved directly as lecture notes
        </p>
        <Button onClick={handleSubmit} disabled={submitting || !text.trim()}>
          {submitting ? "Saving..." : "Save Notes"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
