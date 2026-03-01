import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { courseSchema } from "@/lib/validators";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);

  const courses = await prisma.course.findMany({
    where: { userId },
    include: {
      _count: { select: { uploads: true, flashcardSets: true, questionSets: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);

  const body = await req.json();
  const data = courseSchema.parse(body);

  const course = await prisma.course.create({
    data: { name: data.name, userId },
  });

  return NextResponse.json(course, { status: 201 });
}
