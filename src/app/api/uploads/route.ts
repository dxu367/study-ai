import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "IMAGE",
  "image/jpeg": "IMAGE",
  "image/webp": "IMAGE",
  "text/plain": "TEXT",
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const chapterId = searchParams.get("chapterId");

  const uploads = await prisma.upload.findMany({
    where: {
      courseId,
      course: { userId },
      ...(chapterId ? { chapterId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(uploads);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const courseId = formData.get("courseId") as string | null;
  const contentType = formData.get("contentType") as string | null;
  const chapterId = formData.get("chapterId") as string | null;

  if (!file || !courseId || !contentType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["LECTURE_NOTES", "PREVIOUS_EXAM"].includes(contentType)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  const fileType = ALLOWED_TYPES[file.type];
  if (!fileType) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
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

  // Save file
  const uploadDir = path.join(process.cwd(), "public", "uploads", courseId);
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
  const fileName = `${Date.now()}${ext}`;
  const filePath = path.join(uploadDir, fileName);
  const relativePath = `/uploads/${courseId}/${fileName}`;

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const upload = await prisma.upload.create({
    data: {
      fileName: file.name,
      filePath: relativePath,
      fileType: fileType as "PDF" | "IMAGE" | "TEXT",
      contentType: contentType as "LECTURE_NOTES" | "PREVIOUS_EXAM",
      courseId,
      chapterId,
    },
  });

  return NextResponse.json(upload, { status: 201 });
}
