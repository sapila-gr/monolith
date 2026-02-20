import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, username: true } },
      _count: { select: { comments: true, likes: true, skulls: true } },
      ...(userId ? {
        likes: { where: { userId }, select: { id: true } },
        skulls: { where: { userId }, select: { id: true } },
      } : {}),
    },
  });

  // Map to include boolean flags and remove the relation arrays
  const mapped = posts.map((post) => {
    const postWithRelations = post as unknown as {
      id: string;
      caption: string | null;
      type: string;
      contentUrl: string | null;
      textContent: string | null;
      createdAt: Date;
      updatedAt: Date;
      authorId: string;
      author: { id: string; username: string | null };
      _count: { comments: number; likes: number; skulls: number };
      likes?: Array<{ id: string }>;
      skulls?: Array<{ id: string }>;
    };
    const { likes, skulls, ...postWithoutRelations } = postWithRelations;
    return {
      ...postWithoutRelations,
      userHasLiked: userId ? (likes?.length ?? 0) > 0 : false,
      userHasSkulled: userId ? (skulls?.length ?? 0) > 0 : false,
    };
  });

  return NextResponse.json(mapped);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { caption, textContent, contentUrl, type } = body;

  if (!type || (type === "text" && !textContent)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (type === "image" && !contentUrl) {
    return NextResponse.json({ error: "Image URL is required for image posts" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      caption,
      textContent,
      contentUrl,
      type,
      authorId: session.user.id,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
