import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);
  const { id } = await params;

  const questionSet = await prisma.questionSet.findFirst({
    where: { id, course: { userId } },
  });
  if (!questionSet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.questionSet.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
