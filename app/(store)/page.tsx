import { ProductCard } from "@/components/ProductCard";
import {
  ArrowLeft, ShoppingBag,
  Sparkles, Star, Heart, Shield, CheckCircle, Truck, Award, ThumbsUp, Clock
} from "lucide-react";
import Link from "next/link";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ISR: regenerate at most every 60s, or immediately when admin triggers /api/admin/revalidate
export const revalidate = 60;

// القيم الافتراضية — تُسخدم إذا لم تُحفظ أي بيانات في قاعدة البيانات
const DEFAULT_HERO = {
  badge: "مجموعة ٢٠٢٦",
  title_line1: "كل طفل يستحق",
  title_line2: "بداية هادئة.",
  description: "أسرّة ومهود مصنوعة بعناية فائقة من خامات طبيعية آمنة، لتحتضن أجمل لحظات عامكم الأول معاً.",
  image_url: "/images/bed1.jpg",
  cta_primary: "تسوّقي المجموعة",
  cta_secondary: "قصتنا",
};

const DEFAULT_BANNER = {
  title_line1: "أول نوم لطفلك...",
  title_line2: "هـو أول إحساس بالأمان.",
  description:
    "بدأنا Little One لنوفر للأمهات في ليبيا خيارات تجمع بين الجمال الأوروبي والمتانة المحلية. نحن ندرك أهمية تلك اللحظات الأولى، ولذا نصمم أسرّتنا لتكون الملاذ الأكثر أماناً لطفلك.",
  image_url: "/images/bed2.jpg",
  cta_text: "اقرأ قصتنا كاملة",
};

export default async function Home() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: (url, opts = {}) => fetch(url, { ...opts, next: { revalidate: 60 } }) } }
  );

  // Fetch products, features, and homepage content in parallel on the server
  const [productsRes, featuresRes, heroRes, bannerRes] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("store_features")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("homepage_content")
      .select("content")
      .eq("section", "hero")
      .maybeSingle(),
    supabase
      .from("homepage_content")
      .select("content")
      .eq("section", "banner")
      .maybeSingle(),
  ]);

  let products = productsRes.data || [];

  // Fallback: If no featured products, get 4 newest
  if (products.length === 0) {
    const { data: fallback } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4);
    products = fallback || [];
  }

  const features = featuresRes.data || [];

  // Merge DB content with defaults (fallback gracefully)
  const hero = { ...DEFAULT_HERO, ...(heroRes.data?.content as any) };
  const banner = { ...DEFAULT_BANNER, ...(bannerRes.data?.content as any) };

  return (
    <div className="flex flex-col animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-right">
            <p className="text-xs tracking-[0.3em] text-primary mb-6 animate-fade-in-up">{hero.badge}</p>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.15] font-snaga animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              {hero.title_line1} <br />
              <span className="text-primary">{hero.title_line2}</span>
            </h1>

            <p className="mt-8 text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mr-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              {hero.description}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <Link href="/products" className="inline-flex items-center gap-3 bg-primary hover:bg-foreground text-white px-8 py-4 rounded-full text-sm font-bold transition-colors duration-500">
                {hero.cta_primary}
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link href="/about" className="text-sm font-bold text-foreground border-b border-foreground/30 hover:border-primary hover:text-primary pb-0.5 transition-colors">
                {hero.cta_secondary}
              </Link>
            </div>
          </div>

          <div className="animate-fade-in-slow">
            <div className="relative aspect-[5/6] lg:aspect-[6/7] rounded-[2.5rem] overflow-hidden bg-secondary">
              <img
                src={hero.image_url}
                alt="سرير أطفال ليتل ون"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-24 bg-secondary/40 border-y border-border/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground font-snaga">ما يميز Little One</h2>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 stagger-children">
            {features.map((feature, idx) => {
              const ICON_MAP: Record<string, any> = {
                Sparkles, CheckCircle, Shield, Heart, Star, Truck, Award, ThumbsUp, Clock,
              };
              const FeatureIcon = ICON_MAP[feature.icon] || Heart;

              return (
                <div key={idx} className="group p-8 rounded-[3rem] bg-background hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 text-center space-y-6 animate-fade-in-up">
                  <div className="w-24 h-24 bg-secondary/10 rounded-[2rem] flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 transform group-hover:rotate-12 mx-auto">
                    <FeatureIcon size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground font-snaga">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm md:text-base">{feature.description}</p>
                </div>
              );
            })}

            {features.length === 0 && (
              <div className="col-span-1 md:col-span-3 text-center text-gray-400 py-10">
                <p>تتم إعداد المميزات...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-28 bg-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 space-y-6 md:space-y-0 text-center md:text-right">
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground font-snaga">المجموعة المختارة</h2>
              <p className="text-gray-500 max-w-md">تصاميمنا الأكثر مبيعاً، تجمع بين الكلاسيكية والعصرية.</p>
            </div>
            <Link href="/products" className="group flex items-center gap-3 bg-white px-8 py-4 rounded-2xl border border-gray-200 font-bold hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md">
              شاهد المجموعة
              <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {products.map((product) => (
                <div key={product.id} className="animate-fade-in-up">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image_url={product.image_url}
                    discount_price={product.discount_price}
                    stock_status={product.stock_status}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[4rem] border border-dashed border-gray-200">
              <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
              <p className="text-2xl font-bold text-gray-400 font-snaga">لا توجد منتجات مميزة لتظهر حالياً</p>
              <Link href="/products" className="mt-6 text-primary font-bold inline-block border-b-2 border-primary pb-1 hover:text-primary-dark transition-colors">تصفحي المجموعة بالكامل</Link>
            </div>
          )}
        </div>
      </section>

      {/* Story Banner */}
      <section className="py-24 relative px-4 sm:px-0">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary rounded-[4rem] overflow-hidden relative min-h-[550px] flex items-center px-8 md:px-24 text-white group shadow-2xl">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 w-full py-16">
              <div className="space-y-10 text-center lg:text-right order-2 lg:order-1">
                <h2 className="text-4xl md:text-6xl font-bold font-snaga leading-tight">
                  {banner.title_line1} <br />
                  {banner.title_line2}
                </h2>
                <p className="text-xl text-white/80 leading-relaxed max-w-xl mx-auto lg:mr-0">
                  {banner.description}
                </p>
                <Link href="/about" className="inline-block bg-white text-primary hover:bg-gray-100 px-12 py-5 rounded-3xl font-bold text-xl transition-all shadow-xl shadow-black/10 transform hover:scale-105 active:scale-95">
                  {banner.cta_text}
                </Link>
              </div>

              <div className="relative h-full flex justify-center items-center order-1 lg:order-2">
                <div className="w-full max-w-md aspect-square rounded-[4rem] overflow-hidden shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-1000 border-8 border-white/20">
                  <img
                    src={banner.image_url}
                    alt="قصة ليتل ون"
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                  />
                </div>
                {/* Float accents */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-secondary rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl opacity-50 animate-pulse" style={{ animationDelay: "1s" }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
