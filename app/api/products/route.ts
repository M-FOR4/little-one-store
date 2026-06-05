import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force Next.js to aggressively cache this route for 60 seconds (super fast response)
export const revalidate = 60;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const featuredOnly = searchParams.get("featured") === "true";
        const withCategories = searchParams.get("categories") === "true";

        // Use anon key for reading public data safely Server-Side
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );

        let query = supabase
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (featuredOnly) {
            query = query.eq("is_featured", true).limit(4);
        }

        const { data: products, error } = await query;

        if (error) throw error;

        let finalProducts = products || [];

        // SMART FALLBACK: If we requested featured products but none exist, fetch the 4 newest instead!
        if (featuredOnly && finalProducts.length === 0) {
            const { data: fallbackProducts } = await supabase
                .from("products")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(4);
            finalProducts = fallbackProducts || [];
        }

        let categories = null;
        if (withCategories) {
            const { data: catData } = await supabase
                .from("categories")
                .select("*");
            categories = catData || [];
        }

        return NextResponse.json(
            { products: finalProducts, categories: categories || [] },
            {
                status: 200,
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
                    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_SITE_URL || "",
                },
            }
        );
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch products", products: [] },
            { status: 500 }
        );
    }
}
