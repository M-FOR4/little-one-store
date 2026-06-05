import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(_req: NextRequest) {
  try {
    // Force regeneration of all public-facing pages that use CMS content
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/products");

    return NextResponse.json({ revalidated: true, timestamp: Date.now() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (process.env.NODE_ENV !== "production") console.error("[revalidate] Error:", message);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
