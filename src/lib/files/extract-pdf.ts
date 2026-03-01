import { readFile } from "fs/promises";
import path from "path";

export async function extractPdfText(filePath: string): Promise<string> {
  const absolutePath = path.join(process.cwd(), "public", filePath);
  const buffer = await readFile(absolutePath);
  // pdf-parse v1 uses require-style default export
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdf = require("pdf-parse");
  const data = await pdf(buffer);
  return data.text.trim();
}
