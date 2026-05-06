import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// POST: Create a new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productData, imageUrls } = body;

        const supabase = createAdminClient();

        // 1. Insert Product
        const { data: product, error: insertError } = await supabase
            .from("products")
            .insert({
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
                image_url: imageUrls[0] || null,
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
        if (imageUrls.length > 0) {
            const imageInserts = imageUrls.map((url: string, index: number) => ({
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
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "حدث خطأ غير معروف" },
            { status: 500 }
        );
    }
}
