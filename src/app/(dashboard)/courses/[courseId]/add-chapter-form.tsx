"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AddChapterForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setAdding(true);
    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add chapter");
        return;
      }
      setName("");
      setShowForm(false);
      router.refresh();
    } catch {
      setError("Failed to add chapter");
    } finally {
      setAdding(false);
    }
  };

  if (!showForm) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
        + Add Chapter
      </Button>
    );
  }

  return (
    <form onSubmit={handleAdd} className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Chapter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        autoFocus
      />
      <Button type="submit" size="sm" loading={adding} disabled={!name.trim()}>
        Add
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => { setShowForm(false); setName(""); setError(""); }}
      >
        Cancel
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
