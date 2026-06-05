import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { SiteSettingsSchema } from "@/lib/validations";

// PUT: Update site settings (server-side only, protected by middleware)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate with Zod
        const result = SiteSettingsSchema.safeParse(body);
        if (!result.success) {
            const msg = result.error.issues
                .map((e: { message: string }) => e.message)
                .join(", ");
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { error } = await supabase
            .from("site_settings")
            .upsert({ id: 1, ...result.data });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
