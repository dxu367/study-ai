import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { chapterSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const chapters = await prisma.chapter.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(chapters);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);

  try {
    const body = await req.json();
    const data = chapterSchema.parse(body);

    const course = await prisma.course.findFirst({ where: { id: data.courseId, userId } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const maxOrder = await prisma.chapter.aggregate({
      where: { courseId: data.courseId },
      _max: { order: true },
    });

    const chapter = await prisma.chapter.create({
      data: {
        name: data.name,
        courseId: data.courseId,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
