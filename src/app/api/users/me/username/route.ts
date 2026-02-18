import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { username } = body;

  if (!username || typeof username !== "string" || username.trim().length === 0) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  // Validate username format (alphanumeric, underscore, dash, 3-20 chars)
  const cleanUsername = username.trim().toLowerCase();
  if (!/^[a-z0-9_-]{3,20}$/.test(cleanUsername)) {
    return NextResponse.json(
      {
        error: "Username must be 3-20 characters, alphanumeric, underscore or dash only",
      },
      { status: 400 }
    );
  }

  // Check if username is already taken
  const existing = await prisma.user.findUnique({
    where: { username: cleanUsername },
  });

  if (existing && existing.id !== session.user.id) {
    return NextResponse.json(
      { error: "Username already taken" },
      { status: 409 }
    );
  }

  // Update user with username
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { username: cleanUsername },
  });

  return NextResponse.json({
    success: true,
    username: updated.username,
  });
}
