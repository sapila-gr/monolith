import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

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
