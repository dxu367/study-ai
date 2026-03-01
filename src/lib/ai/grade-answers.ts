import { anthropic } from "./client";
import { GRADING_PROMPT } from "./prompts";

interface GradeResult {
  isCorrect: boolean;
  feedback: string;
}

export async function gradeShortAnswer(
  question: string,
  correctAnswer: string,
  studentAnswer: string
): Promise<GradeResult> {
  const prompt = GRADING_PROMPT.replace("{question}", question)
    .replace("{correctAnswer}", correctAnswer)
    .replace("{studentAnswer}", studentAnswer);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") throw new Error("No text response");

      return JSON.parse(textBlock.text) as GradeResult;
    } catch (e) {
      if (attempt === 1) throw e;
    }
  }

  return { isCorrect: false, feedback: "Unable to grade this answer." };
}
