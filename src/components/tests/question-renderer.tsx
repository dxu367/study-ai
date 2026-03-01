"use client";

interface QuestionRendererProps {
  questionText: string;
  questionType: string;
  options: string[] | null;
  answer: string;
  onChange: (answer: string) => void;
  questionNumber: number;
}

export function QuestionRenderer({
  questionText,
  questionType,
  options,
  answer,
  onChange,
  questionNumber,
}: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">
        <span className="text-gray-400 mr-2">Q{questionNumber}.</span>
        {questionText}
      </p>

      {questionType === "MULTIPLE_CHOICE" && options && (
        <div className="space-y-2 pl-6">
          {options.map((option, i) => (
            <label
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition"
            >
              <input
                type="radio"
                name={`q-${questionNumber}`}
                checked={answer === option}
                onChange={() => onChange(option)}
                className="mt-0.5"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      )}

      {questionType === "TRUE_FALSE" && (
        <div className="flex gap-3 pl-6">
          {["True", "False"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-6 py-2 rounded-lg border text-sm font-medium transition ${
                answer === opt
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {questionType === "SHORT_ANSWER" && (
        <textarea
          value={answer}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )}
    </div>
  );
}
