import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);

  const body = await req.json();
  const { courseId, text, title, chapterId } = body as { courseId?: string; text?: string; title?: string; chapterId?: string };

  if (!courseId || !text?.trim()) {
    return NextResponse.json({ error: "courseId and non-empty text are required" }, { status: 400 });
  }

  // Verify course belongs to user
  const course = await prisma.course.findFirst({
    where: { id: courseId, userId },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Validate chapterId belongs to this course if provided
  if (chapterId) {
    const chapter = await prisma.chapter.findFirst({
      where: { id: chapterId, courseId },
    });
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }
  }

  const fileName = title?.trim() || `Pasted notes ${new Date().toLocaleString()}`;

  const upload = await prisma.upload.create({
    data: {
      fileName,
      filePath: "",
      fileType: "TEXT",
      contentType: "LECTURE_NOTES",
      extractedText: text.trim(),
      processingStatus: "COMPLETED",
      courseId,
      chapterId: chapterId || null,
    },
  });

  return NextResponse.json(upload, { status: 201 });
}
