import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    // Use admin or server client directly here for safety since it's an RSC
    const supabase = createAdminClient();
    const { data: product } = await supabase.from("products").select("*").eq("id", id).single();

    if (!product) {
        return { title: 'المنتج غير موجود' };
    }

    return {
        title: product.name,
        description: product.description || "أفضل سرائر الأطفال في ليبيا من Little One.",
        openGraph: {
            title: `${product.name} | Little One`,
            description: product.description || "تسوق أفضل المنتجات بأعلى معايير الجودة.",
            images: product.image_url ? [product.image_url] : [],
            url: `https://little-one-store.com/products/${id}`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            images: product.image_url ? [product.image_url] : [],
        }
    };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
