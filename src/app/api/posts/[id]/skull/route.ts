import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;

  const existing = await prisma.skull.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.skull.delete({ where: { id: existing.id } });
    return NextResponse.json({ skulled: false });
  }

  await prisma.skull.create({
    data: { postId, userId: session.user.id },
  });

  return NextResponse.json({ skulled: true });
}
