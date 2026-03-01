import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { extractPdfText } from "@/lib/files/extract-pdf";
import { extractImageText } from "@/lib/files/extract-image";
import { readFile } from "fs/promises";
import path from "path";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);
  const { id } = await params;

  const upload = await prisma.upload.findFirst({
    where: { id, course: { userId } },
  });

  if (!upload) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 });
  }

  if (upload.processingStatus === "COMPLETED") {
    return NextResponse.json({ message: "Already processed", upload });
  }

  await prisma.upload.update({
    where: { id },
    data: { processingStatus: "PROCESSING" },
  });

  try {
    let extractedText = "";

    switch (upload.fileType) {
      case "PDF":
        extractedText = await extractPdfText(upload.filePath);
        break;
      case "IMAGE":
        extractedText = await extractImageText(upload.filePath);
        break;
      case "TEXT": {
        const absolutePath = path.join(process.cwd(), "public", upload.filePath);
        extractedText = await readFile(absolutePath, "utf-8");
        break;
      }
    }

    const updated = await prisma.upload.update({
      where: { id },
      data: {
        extractedText,
        processingStatus: "COMPLETED",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    await prisma.upload.update({
      where: { id },
      data: { processingStatus: "FAILED" },
    });
    console.error("Processing failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
