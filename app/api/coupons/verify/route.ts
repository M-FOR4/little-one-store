import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
    try {
        const { code, subtotal } = await request.json();

        if (!code || typeof code !== "string") {
            return NextResponse.json(
                { error: "كود الخصم مطلوب" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data: coupon, error } = await supabase
            .from("coupons")
            .select("*")
            .eq("code", code.toUpperCase())
            .eq("is_active", true)
            .single();

        if (error || !coupon) {
            return NextResponse.json(
                { valid: false, error: "كود الخصم غير صحيح أو منتهي الصلاحية" },
                { status: 200 }
            );
        }

        // Check expiry
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
            return NextResponse.json(
                { valid: false, error: "هذا الكود قد انتهت صلاحيته" },
                { status: 200 }
            );
        }

        // Check min order amount
        const orderSubtotal = typeof subtotal === "number" ? subtotal : 0;
        if (orderSubtotal < (coupon.min_order_amount || 0)) {
            return NextResponse.json(
                {
                    valid: false,
                    error: `يجب أن يكون مجموع الطلب ${coupon.min_order_amount} د.ل أو أكثر لتفعيل هذا الكود`,
                },
                { status: 200 }
            );
        }

        // Return validated coupon info (never expose internal ID to client)
        return NextResponse.json({
            valid: true,
            coupon: {
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
            },
        });
    } catch {
        return NextResponse.json(
            { valid: false, error: "حدث خطأ أثناء التحقق من الكود" },
            { status: 500 }
        );
    }
}
