import { readFile } from "fs/promises";
import path from "path";
import { anthropic } from "@/lib/ai/client";

export async function extractImageText(filePath: string): Promise<string> {
  const absolutePath = path.join(process.cwd(), "public", filePath);
  const buffer = await readFile(absolutePath);
  const base64 = buffer.toString("base64");

  const ext = path.extname(filePath).toLowerCase();
  const mediaType =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: "text",
            text: "Please transcribe ALL text visible in this image exactly as written. Preserve the structure (headings, bullet points, numbered lists, etc.) as much as possible. If there are diagrams or figures, briefly describe them in brackets. Output only the transcribed text, nothing else.",
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}
