import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkImageSafety } from "@/lib/moderation";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const caption = formData.get("caption") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Upload to Supabase with server secret key (bypasses RLS)
    const buffer = await file.arrayBuffer();
    const filename = `${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;
    const filePath = `images/${filename}`;

    const { error: uploadError } = await supabaseServer.storage
      .from("posts")
      .upload(filePath, new Uint8Array(buffer), {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 400 }
      );
    }

    const { data } = supabaseServer.storage.from("posts").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    console.log("File uploaded, checking with Vision API:", publicUrl);

    // Check image safety with Vision API
    const { safe, detection, error: visionError } =
      await checkImageSafety(publicUrl);
    console.log("Vision API result:", { safe, detection, visionError });

    if (!safe) {
      // TODO: Delete the uploaded file if rejected
      // For now, the file stays - you can clean it up manually

      const reason = detection
        ? `adult: ${detection.adult}, racy: ${detection.racy}`
        : visionError || "unknown reason";

      return NextResponse.json(
        { error: `Image rejected by moderation (${reason})` },
        { status: 400 }
      );
    }

    // Save post to database
    const post = await prisma.post.create({
      data: {
        caption: caption || null,
        type: "image",
        contentUrl: publicUrl,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true, likes: true, skulls: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
