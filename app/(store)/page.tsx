"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ArrowLeft, Star, ShoppingBag, Heart, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products?featured=true');
        const data = await res.json();
        if (res.ok) {
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-secondary/10 to-transparent" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 -left-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-secondary/20 shadow-sm animate-fade-in-up">
              <Star className="text-secondary fill-secondary" size={16} />
              <span className="text-xs font-bold text-primary tracking-wide uppercase">العلامة التجارية الرائدة في ليبيا</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-[1.15] font-snaga animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              كل طفل يستحق <br />
              <span className="text-primary italic">بداية هادئة</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mr-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              نصنع لطفلك عالماً من الراحة والأمان. أسرّة مصممة بعناية من أجود أنواع الخشب الطبيعي لترافق نمو طفلك في سنواته الأولى بجمال لا يبهت.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <Link href="/products" className="bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-3xl font-bold text-lg transition-all shadow-xl shadow-primary/20 transform hover:scale-105 active:scale-95">
                اكتشفي المجموعة
              </Link>
              <Link href="/about" className="bg-white hover:bg-gray-50 text-foreground px-10 py-5 rounded-3xl font-bold text-lg transition-all border border-gray-200 shadow-sm">
                تعرفي علينا
              </Link>
            </div>
          </div>

          <div className="relative animate-float pointer-events-none select-none">
            <div className="relative z-10 rounded-[4rem] overflow-hidden border-[16px] border-white shadow-2xl">
              <img
                src="/images/bed1.jpg"
                alt="سرير أطفال ليتل ون"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary rounded-[3rem] -z-10 rotate-12 shadow-inner" />
            <div className="absolute -top-10 -left-10 w-56 h-56 border-4 border-primary/20 rounded-full -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px] -z-20" />
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground font-snaga">ما يميز Little One</h2>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 stagger-children">
            {[
              { icon: Heart, title: "صنع بكل حب", desc: "كل قطعة نصنعها نضع فيها اهتمامنا الكامل بالتفاصيل الصغيرة، لأننا نعلم أنها ستحتضن أغلى ما تملكون." },
              { icon: Shield, title: "أمان مطلق", desc: "نستخدم مواد طبيعية 100% وطلاءات مائية صديقة للبيئة خالية من أي مواد كيميائية ضارة، لسلامة طفلك." },
              { icon: CheckCircle, title: "جودة تدوم", desc: "خشب صلب وصنعة يدوية ليبية تضمن بقاء السرير كإرث عائلي ينتقل من جيل إلى جيل بنفس الجمال والمتانة." }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-[3rem] bg-background hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 text-center space-y-6 animate-fade-in-up">
                <div className="w-24 h-24 bg-secondary/10 rounded-[2rem] flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 transform group-hover:rotate-12 mx-auto">
                  <feature.icon size={40} />
                </div>
                <h3 className="text-2xl font-bold text-foreground font-snaga">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm md:text-base">{feature.desc}</p>
              </div>
            ))}
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

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="bg-gray-200 aspect-[3/4] rounded-[4rem]" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
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
                  أول نوم لطفلك... <br />
                  هـو أول إحساس بالأمان.
                </h2>
                <p className="text-xl text-white/80 leading-relaxed max-w-xl mx-auto lg:mr-0">
                  بدأنا Little One لنوفر للأمهات في ليبيا خيارات تجمع بين الجمال الأوروبي والمتانة المحلية. نحن ندرك أهمية تلك اللحظات الأولى، ولذا نصمم أسرّتنا لتكون الملاذ الأكثر أماناً لطفلك.
                </p>
                <Link href="/about" className="inline-block bg-white text-primary hover:bg-gray-100 px-12 py-5 rounded-3xl font-bold text-xl transition-all shadow-xl shadow-black/10 transform hover:scale-105 active:scale-95">
                  اقرأ قصتنا كاملة
                </Link>
              </div>

              <div className="relative h-full flex justify-center items-center order-1 lg:order-2">
                <div className="w-full max-w-md aspect-square rounded-[4rem] overflow-hidden shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-1000 border-8 border-white/20">
                  <img
                    src="/images/bed2.jpg"
                    alt="قصة ليتل ون"
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                  />
                </div>
                {/* Float accents */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-secondary rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-28 bg-white overflow-hidden relative">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-12 animate-fade-in-up relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-secondary/10 rounded-[2.5rem] transform -rotate-6">
            <ShoppingBag className="text-secondary" size={48} />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground font-snaga">هل تود تصميم سرير مخصص؟</h2>
            <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto font-medium">
              فريقنا جاهز لمساعدتكِ في اختيار الخامات، الألوان، والمقاسات التي تناسب طفلكِ وغرفتكم. تواصلي معنا مباشرة عبر الواتساب.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <a href="https://wa.me/218911234567" className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white px-16 py-6 rounded-[2.5rem] font-bold text-2xl transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-4 group">
              تواصلي معنا الآن
              <ArrowLeft className="group-hover:-translate-x-2 transition-transform" size={24} />
            </a>
          </div>
        </div>

        {/* Background decorative shapes */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </section>
    </div>
  );
}
