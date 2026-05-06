import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// POST: Upload image to Supabase Storage
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "لم يتم إرسال ملف" }, { status: 400 });
        }

        const supabase = createAdminClient();

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(fileName, buffer, {
                contentType: file.type,
            });

        if (uploadError) {
            return NextResponse.json(
                { error: uploadError.message },
                { status: 400 }
            );
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "حدث خطأ في رفع الصورة" },
            { status: 500 }
        );
    }
}
