import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "media";
    const rawPath = formData.get("path") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 413 });
    }

    // Auto-generate path if not provided, sanitize to prevent path traversal (#9)
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).slice(2, 7);
    let basePath: string;
    if (rawPath) {
      // Strip extension, remove .. traversal, strip leading slashes
      const stripped = rawPath.replace(/\.[^.]+$/, "");
      basePath = stripped.replace(/\.\.[\/\\]?/g, "").replace(/^[\/\\]+/, "");
      if (!basePath) basePath = `uploads/${timestamp}-${randomId}`;
    } else {
      basePath = `uploads/${timestamp}-${randomId}`;
    }

    // Always store as .webp after compression
    const finalPath = `${basePath}.webp`;

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // ── Decompression bomb protection (#13): check dimensions before processing ──
    const metadata = await sharp(inputBuffer).metadata();
    if ((metadata.width && metadata.width > 4096) || (metadata.height && metadata.height > 4096)) {
      return NextResponse.json(
        { error: "Image dimensions too large. Maximum 4096×4096 pixels." },
        { status: 400 }
      );
    }

    // ── Compress with sharp (keep original dimensions, convert to WebP 85%) ──
    const compressedBuffer = await sharp(inputBuffer)
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    const supabase = createAdminClient();

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(finalPath, compressedBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      if (process.env.NODE_ENV !== "production") console.error("[upload] Supabase storage error:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(finalPath);

    // Return both fields for full compatibility
    return NextResponse.json({
      publicUrl: urlData.publicUrl,
      url: urlData.publicUrl,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[upload] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
