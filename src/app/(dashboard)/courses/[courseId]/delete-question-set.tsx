"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteQuestionSet({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this practice test?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/question-sets/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      {deleting ? "..." : "Delete"}
    </Button>
  );
}
