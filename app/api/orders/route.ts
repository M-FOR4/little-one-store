import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { OrderSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // ── Validate with Zod (#11) ──
        const result = OrderSchema.safeParse(body);
        if (!result.success) {
            const msg = result.error.issues
                .map((e: { message: string }) => e.message)
                .join(", ");
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        const { customer_name, phone_number, city_id, address, coupon_code, items } =
            result.data;

        const supabase = createAdminClient();

        // 1. Fetch real product prices from DB (NEVER trust client prices)
        const productIds = items.map((i) => i.product_id);
        const { data: products, error: productsError } = await supabase
            .from("products")
            .select("id, price, discount_price, name")
            .in("id", productIds);

        if (productsError || !products) {
            return NextResponse.json(
                { error: "خطأ في جلب المنتجات" },
                { status: 500 }
            );
        }

        // Verify all products exist
        const productMap = new Map(products.map((p) => [p.id, p]));
        for (const item of items) {
            if (!productMap.has(item.product_id)) {
                return NextResponse.json(
                    { error: `المنتج ${item.product_id} غير موجود` },
                    { status: 400 }
                );
            }
        }

        // 2. Calculate real total from DB prices
        let subtotal = 0;
        const orderItems = items.map((item) => {
            const product = productMap.get(item.product_id)!;
            const unitPrice = product.discount_price ?? product.price;
            subtotal += unitPrice * item.quantity;
            return {
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_time_of_purchase: unitPrice,
            };
        });

        // 3. Fetch shipping fee from DB
        const { data: city } = await supabase
            .from("shipping_cities")
            .select("name, shipping_fee")
            .eq("id", city_id)
            .eq("is_active", true)
            .single();

        if (!city) {
            return NextResponse.json(
                { error: "المدينة المختارة غير متوفرة" },
                { status: 400 }
            );
        }

        const shippingFee = city.shipping_fee || 0;

        // 4. Verify coupon server-side (#14)
        let discountAmount = 0;
        let validatedCouponId: string | null = null;

        if (coupon_code) {
            const { data: coupon } = await supabase
                .from("coupons")
                .select("*")
                .eq("code", coupon_code.toUpperCase())
                .eq("is_active", true)
                .single();

            if (coupon) {
                // Check expiry
                const isExpired =
                    coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
                // Check min order
                const meetsMin = subtotal >= (coupon.min_order_amount || 0);

                if (!isExpired && meetsMin) {
                    if (coupon.discount_type === "percentage") {
                        discountAmount = (subtotal * coupon.discount_value) / 100;
                    } else {
                        discountAmount = coupon.discount_value;
                    }
                    validatedCouponId = coupon.id;
                }
            }
            // If coupon is invalid, silently ignore — don't block the order
        }

        const grandTotal = subtotal + shippingFee - discountAmount;

        // 5. Create order with server-calculated total
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                customer_name,
                phone_number,
                city: city.name,
                address,
                total_amount: grandTotal,
                coupon_code: coupon_code?.toUpperCase() || null,
                discount_amount: discountAmount,
                status: "pending",
            })
            .select()
            .single();

        if (orderError) {
            return NextResponse.json(
                { error: orderError.message },
                { status: 500 }
            );
        }

        // 6. Create order items
        const itemsWithOrderId = orderItems.map((item) => ({
            ...item,
            order_id: order.id,
        }));

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(itemsWithOrderId);

        if (itemsError) {
            // Rollback: delete the order
            await supabase.from("orders").delete().eq("id", order.id);
            return NextResponse.json(
                { error: itemsError.message },
                { status: 500 }
            );
        }

        // 7. Increment coupon usage if used
        if (validatedCouponId) {
            await supabase.rpc("increment_coupon_usage", {
                coupon_id: validatedCouponId,
            });
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            total: grandTotal,
        });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Internal Server Error";
        if (process.env.NODE_ENV !== "production") {
            console.error("[orders]", message);
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
