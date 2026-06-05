import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { ProductSchema, ImageUrlsSchema } from "@/lib/validations";

// PUT: Update a product
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { productData, allImages } = body;

        // ── Validate inputs with Zod (#6) ──
        const productResult = ProductSchema.safeParse(productData);
        if (!productResult.success) {
            const msg = productResult.error.issues.map((e: { message: string }) => e.message).join(", ");
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        const imagesResult = ImageUrlsSchema.safeParse(allImages);
        if (!imagesResult.success) {
            const msg = imagesResult.error.issues.map((e: { message: string }) => e.message).join(", ");
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        const validated = productResult.data;
        const validatedImages = imagesResult.data;
        const supabase = createAdminClient();

        const mainImageUrl = validatedImages[0] || productData.image_url;

        // 1. Update Product
        const { error: updateError } = await supabase
            .from("products")
            .update({
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
                image_url: mainImageUrl,
            })
            .eq("id", id);

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 400 }
            );
        }

        // 2. Replace product images
        await supabase.from("product_images").delete().eq("product_id", id);

        if (validatedImages.length > 0) {
            const imageInserts = validatedImages.map((url: string, index: number) => ({
                product_id: id,
                image_url: url,
                display_order: index,
            }));
            await supabase.from("product_images").insert(imageInserts);
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "حدث خطأ غير معروف";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

// DELETE: Delete a product
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();

        // Delete images first
        await supabase.from("product_images").delete().eq("product_id", id);

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "حدث خطأ غير معروف" },
            { status: 500 }
        );
    }
}
