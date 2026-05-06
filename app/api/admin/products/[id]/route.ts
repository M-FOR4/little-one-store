import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// PUT: Update a product
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { productData, allImages } = body;

        const supabase = createAdminClient();

        const mainImageUrl = allImages[0] || productData.image_url;

        // 1. Update Product
        const { error: updateError } = await supabase
            .from("products")
            .update({
                name: productData.name,
                description: productData.description,
                price: parseFloat(productData.price),
                category: productData.category,
                stock_status: productData.stock_status,
                stock_quantity: productData.stock_quantity,
                dimensions: productData.dimensions,
                material: productData.material,
                allow_waitlist: productData.allow_waitlist,
                discount_price: productData.discount_price
                    ? parseFloat(productData.discount_price)
                    : null,
                flash_sale_end: productData.flash_sale_end || null,
                show_countdown: productData.show_countdown,
                is_featured: productData.is_featured,
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

        if (allImages.length > 0) {
            const imageInserts = allImages.map((url: string, index: number) => ({
                product_id: id,
                image_url: url,
                display_order: index,
            }));
            await supabase.from("product_images").insert(imageInserts);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "حدث خطأ غير معروف" },
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
