import { anthropic } from "./client";
import { QUESTION_PROMPT, STYLE_GUIDE_SECTION } from "./prompts";

interface GeneratedQuestion {
  questionText: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
}

const CHUNK_SIZE = 6000;

function chunkText(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= CHUNK_SIZE) {
      chunks.push(remaining);
      break;
    }

    let breakPoint = remaining.lastIndexOf("\n\n", CHUNK_SIZE);
    if (breakPoint < CHUNK_SIZE * 0.5) {
      breakPoint = remaining.lastIndexOf(". ", CHUNK_SIZE);
    }
    if (breakPoint < CHUNK_SIZE * 0.5) {
      breakPoint = CHUNK_SIZE;
    }

    chunks.push(remaining.slice(0, breakPoint + 1));
    remaining = remaining.slice(breakPoint + 1);
  }

  return chunks;
}

async function generateFromChunk(
  text: string,
  count: number,
  questionTypes: string[],
  styleGuideText?: string
): Promise<GeneratedQuestion[]> {
  const styleGuide = styleGuideText
    ? STYLE_GUIDE_SECTION.replace("{examText}", styleGuideText)
    : "";

  const prompt = QUESTION_PROMPT.replace("{count}", String(count))
    .replace("{questionTypes}", questionTypes.join(", "))
    .replace("{styleGuide}", styleGuide)
    .replace("{text}", text);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") throw new Error("No text response");

      const parsed = JSON.parse(textBlock.text);
      return parsed.questions as GeneratedQuestion[];
    } catch (e) {
      if (attempt === 1) throw e;
    }
  }

  return [];
}

export async function generateQuestions(
  text: string,
  totalCount: number,
  questionTypes: string[],
  styleGuideText?: string
): Promise<GeneratedQuestion[]> {
  const chunks = chunkText(text);
  const questionsPerChunk = Math.ceil(totalCount / chunks.length);

  const allQuestions: GeneratedQuestion[] = [];

  for (const chunk of chunks) {
    const questions = await generateFromChunk(
      chunk,
      questionsPerChunk,
      questionTypes,
      styleGuideText
    );
    allQuestions.push(...questions);
  }

  return allQuestions.slice(0, totalCount);
}
