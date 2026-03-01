import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TestResult {
  questionText: string;
  questionType: string;
  correctAnswer: string;
  explanation: string | null;
  userAnswer: string;
  isCorrect: boolean | null;
  aiFeedback: string | null;
}

interface TestResultsProps {
  score: number;
  results: TestResult[];
}

export function TestResults({ score, results }: TestResultsProps) {
  const correctCount = results.filter((r) => r.isCorrect).length;

  return (
    <div className="space-y-6">
      {/* Score Banner */}
      <Card>
        <CardContent className="py-8 text-center">
          <div
            className={`text-5xl font-bold mb-2 ${
              score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"
            }`}
          >
            {Math.round(score)}%
          </div>
          <p className="text-gray-500">
            {correctCount} correct out of {results.length} questions
          </p>
        </CardContent>
      </Card>

      {/* Question Review */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Question Review</h2>
        {results.map((result, i) => (
          <Card
            key={i}
            className={
              result.isCorrect
                ? "border-green-200 bg-green-50/50"
                : "border-red-200 bg-red-50/50"
            }
          >
            <CardContent className="py-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-sm">
                  <span className="text-gray-400 mr-2">Q{i + 1}.</span>
                  {result.questionText}
                </p>
                <Badge variant={result.isCorrect ? "success" : "error"}>
                  {result.isCorrect ? "Correct" : "Incorrect"}
                </Badge>
              </div>

              <div className="text-sm space-y-1 pl-6">
                <p>
                  <span className="text-gray-500">Your answer:</span>{" "}
                  <span className={result.isCorrect ? "text-green-700" : "text-red-700"}>
                    {result.userAnswer}
                  </span>
                </p>
                {!result.isCorrect && (
                  <p>
                    <span className="text-gray-500">Correct answer:</span>{" "}
                    <span className="text-green-700">{result.correctAnswer}</span>
                  </p>
                )}
                {result.explanation && (
                  <p className="text-gray-600 italic">{result.explanation}</p>
                )}
                {result.aiFeedback && (
                  <p className="text-gray-600 italic">{result.aiFeedback}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
