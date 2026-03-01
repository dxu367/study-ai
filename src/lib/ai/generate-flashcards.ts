import { anthropic } from "./client";
import { FLASHCARD_PROMPT } from "./prompts";

interface GeneratedFlashcard {
  front: string;
  back: string;
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

    // Find a good break point (paragraph or sentence boundary)
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
  count: number
): Promise<GeneratedFlashcard[]> {
  const prompt = FLASHCARD_PROMPT.replace("{count}", String(count)).replace(
    "{text}",
    text
  );

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
      return parsed.flashcards as GeneratedFlashcard[];
    } catch (e) {
      if (attempt === 1) throw e;
    }
  }

  return [];
}

export async function generateFlashcards(
  text: string,
  totalCount: number
): Promise<GeneratedFlashcard[]> {
  const chunks = chunkText(text);
  const cardsPerChunk = Math.ceil(totalCount / chunks.length);

  const allCards: GeneratedFlashcard[] = [];

  for (const chunk of chunks) {
    const cards = await generateFromChunk(chunk, cardsPerChunk);
    allCards.push(...cards);
  }

  // Deduplicate by checking for similar fronts
  const seen = new Set<string>();
  const unique = allCards.filter((card) => {
    const key = card.front.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, totalCount);
}
