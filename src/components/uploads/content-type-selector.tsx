"use client";

import { clsx } from "clsx";

interface ContentTypeSelectorProps {
  value: "LECTURE_NOTES" | "PREVIOUS_EXAM";
  onChange: (value: "LECTURE_NOTES" | "PREVIOUS_EXAM") => void;
}

export function ContentTypeSelector({ value, onChange }: ContentTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      {[
        { key: "LECTURE_NOTES" as const, label: "Lecture Notes" },
        { key: "PREVIOUS_EXAM" as const, label: "Previous Exam" },
      ].map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={clsx(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
            value === option.key
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
