import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);
  const { id } = await params;

  const chapter = await prisma.chapter.findFirst({
    where: { id, course: { userId } },
  });
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.chapter.update({
    where: { id },
    data: {
      ...(typeof body.name === "string" && body.name.trim() ? { name: body.name.trim() } : {}),
      ...(typeof body.order === "number" ? { order: body.order } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = getUserId(session);
  const { id } = await params;

  const chapter = await prisma.chapter.findFirst({
    where: { id, course: { userId } },
  });
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  await prisma.chapter.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
