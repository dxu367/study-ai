import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);

  const { questionSetId } = await req.json();

  const set = await prisma.questionSet.findFirst({
    where: { id: questionSetId, course: { userId } },
  });
  if (!set) {
    return NextResponse.json({ error: "Question set not found" }, { status: 404 });
  }

  const attempt = await prisma.testAttempt.create({
    data: { questionSetId },
  });

  return NextResponse.json(attempt, { status: 201 });
}
