import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const authorSelect = { id: true, username: true } as const;

// Recursively include replies up to a reasonable depth
function buildReplyInclude(depth: number): Record<string, unknown> {
  if (depth <= 0) {
    return {
      author: { select: authorSelect },
      _count: { select: { replies: true } },
    };
  }
  return {
    author: { select: authorSelect },
    _count: { select: { replies: true } },
    replies: {
      orderBy: { createdAt: "asc" },
      include: buildReplyInclude(depth - 1),
    },
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;

  // Fetch only top-level comments (no parent), with nested replies 4 levels deep
  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: buildReplyInclude(4),
  });

  return NextResponse.json(comments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;
  const body = await request.json();
  const { content, parentId } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Validate parentId if provided
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
    });
    if (!parent || parent.postId !== postId) {
      return NextResponse.json({ error: "Invalid parent comment" }, { status: 400 });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      authorId: session.user.id,
      parentId: parentId ?? null,
    },
    include: {
      author: { select: authorSelect },
      _count: { select: { replies: true } },
      replies: {
        include: {
          author: { select: authorSelect },
          _count: { select: { replies: true } },
        },
      },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
