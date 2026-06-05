import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { ProductSchema, ImageUrlsSchema } from "@/lib/validations";

// POST: Create a new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productData, imageUrls } = body;

        // ── Validate inputs with Zod (#6) ──
        const productResult = ProductSchema.safeParse(productData);
        if (!productResult.success) {
            const msg = productResult.error.issues.map((e: { message: string }) => e.message).join(", ");
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        const imagesResult = ImageUrlsSchema.safeParse(imageUrls);
        if (!imagesResult.success) {
            const msg = imagesResult.error.issues.map((e: { message: string }) => e.message).join(", ");
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        const validated = productResult.data;
        const validatedImages = imagesResult.data;
        const supabase = createAdminClient();

        // 1. Insert Product
        const { data: product, error: insertError } = await supabase
            .from("products")
            .insert({
                name: validated.name,
                description: validated.description,
                price: validated.price,
                category: validated.category,
                stock_status: validated.stock_status,
                stock_quantity: validated.stock_quantity,
                dimensions: validated.dimensions,
                material: validated.material,
                allow_waitlist: validated.allow_waitlist,
                discount_price: validated.discount_price,
                flash_sale_end: validated.flash_sale_end || null,
                show_countdown: validated.show_countdown,
                is_featured: validated.is_featured,
                image_url: validatedImages[0] || null,
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json(
                { error: insertError.message },
                { status: 400 }
            );
        }

        // 2. Insert product images
        if (validatedImages.length > 0) {
            const imageInserts = validatedImages.map((url: string, index: number) => ({
                product_id: product.id,
                image_url: url,
                display_order: index,
            }));
            const { error: imagesError } = await supabase
                .from("product_images")
                .insert(imageInserts);
            if (imagesError) {
                return NextResponse.json(
                    { error: imagesError.message },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json({ success: true, product });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "حدث خطأ غير معروف" },
            { status: 500 }
        );
    }
}

