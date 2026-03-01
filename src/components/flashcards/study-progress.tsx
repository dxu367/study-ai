interface StudyProgressProps {
  current: number;
  total: number;
  known: number;
  unknown: number;
}

export function StudyProgress({ current, total, known, unknown }: StudyProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>
          Card {Math.min(current + 1, total)} of {total}
        </span>
        <span>
          <span className="text-green-600">{known} known</span>
          {" / "}
          <span className="text-red-600">{unknown} unknown</span>
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
