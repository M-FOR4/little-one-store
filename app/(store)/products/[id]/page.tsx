"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase";
import { useCart } from "@/components/CartProvider";
import {
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
  Plus,
  Minus,
  Star,
  Info,
  Heart,
  Sparkles,
  Award,
  ThumbsUp,
  Shield,
  CheckCircle,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient();

      // Fetch product details
      const { data: prodData, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .eq('id', id)
        .single();

      if (error || !prodData) {
        router.push('/products');
        return;
      }

      setProduct(prodData);

      // Fetch additional images
      const { data: imgData } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('display_order', { ascending: true });

      // Combine main image with additional ones if not already present
      const allImgs = prodData.image_url ? [{ image_url: prodData.image_url }] : [];
      if (imgData) {
        imgData.forEach(img => {
          if (img.image_url !== prodData.image_url) {
            allImgs.push(img);
          }
        });
      }
      setImages(allImgs);
      // Fetch product benefits
      const { data: benefitsData } = await supabase
        .from('product_benefits')
        .select('*')
        .or(`is_global.eq.true,product_id.eq.${id}`)
        .order('sort_order', { ascending: true });

      if (benefitsData) setBenefits(benefitsData);

      setLoading(false);
    }
    fetchProduct();
  }, [id, router]);

  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image_url: product.image_url
    }, quantity);

    setTimeout(() => {
      setAdding(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    setAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image_url: product.image_url
    }, quantity);

    setTimeout(() => {
      setAdding(false);
      router.push("/checkout");
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const discount = product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
  const isOutOfStock = product.stock_status === 'out_of_stock';

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
        <nav className="flex items-center gap-3 text-sm font-medium text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ChevronLeft size={16} />
          <Link href="/products" className="hover:text-primary transition-colors">المجموعة</Link>
          <ChevronLeft size={16} />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Image Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-background border border-gray-100 group shadow-lg">
            {images.length > 0 ? (
              <div className="w-full h-full relative cursor-pointer" onClick={() => setLightboxOpen(true)}>
                <img
                  src={images[activeImage].image_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Lightbox Hint */}
                <div className="absolute top-4 left-4 bg-white/50 backdrop-blur-md p-2 rounded-xl text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={24} />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-10">
                <ShoppingBag size={120} />
              </div>
            )}

            {discount > 0 && (
              <div className="absolute top-8 right-8 bg-secondary text-white px-5 py-2 rounded-2xl font-bold shadow-xl">
                وفر {discount}%
              </div>
            )}

            {/* Gallery Navigation Overlay */}
            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-8 flex justify-center gap-3">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${activeImage === idx ? "bg-primary w-8 shadow-lg shadow-primary/30" : "bg-white/50 backdrop-blur-sm"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square relative rounded-2xl overflow-hidden border-2 transition-all p-1 ${activeImage === idx ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                >
                  <div className="w-full h-full relative rounded-xl overflow-hidden">
                    <img src={img.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col space-y-10 py-4">
          <div className="space-y-4">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              {product.categories?.name || "تشكيلة ليتل ون"}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-snaga leading-tight">{product.name}</h1>

          </div>

          <div className="pb-8 border-b border-gray-100">
            <div className="flex items-center gap-4">
              {product.discount_price ? (
                <>
                  <span className="text-4xl font-bold text-primary font-snaga">{product.discount_price} د.ل</span>
                  <span className="text-xl text-gray-400 line-through font-medium">{product.price} د.ل</span>
                </>
              ) : (
                <span className="text-4xl font-bold text-foreground font-snaga">{product.price} د.ل</span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-2">* السعر شامل الضريبة، لا يشمل رسوم التوصيل</p>
          </div>

          <div className="space-y-6">
            <p className="text-gray-600 leading-relaxed text-lg">
              {product.description || "لا يوجد وصف متوفر لهذا المنتج حالياً. ولكننا نضمن لك أعلى معايير الجودة والأمان في جميع تصاميمنا."}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-8 border-t border-gray-200/60 pt-6 mt-8">
              <div className="space-y-1">
                <p className="text-sm text-primary font-bold">الخامات</p>
                <p className="text-base text-foreground font-medium leading-relaxed">{product.material || "خشب طبيعي"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-primary font-bold">المقاسات</p>
                <p className="text-base text-foreground font-medium flex items-center gap-1 direction-ltr justify-end sm:justify-start flex-row-reverse" dir="ltr">{product.dimensions || "قياسي"}</p>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-8 space-y-6">
            {!isOutOfStock ? (
              <>
                <div className="space-y-4">
                {/* Quantity selector */}
                <div className="flex items-center justify-between bg-[#FDFBF9] p-4 rounded-2xl border border-gray-100">
                  <span className="font-bold text-gray-700 text-sm">الكمية المطلوبة</span>
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl px-2 py-1">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-1.5 text-gray-400 hover:text-primary transition-colors active:scale-90"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-10 text-center font-bold text-lg text-foreground">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-1.5 text-gray-400 hover:text-primary transition-colors active:scale-90"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Actions: Buy Now (large) and Add to Cart (icon only) */}
                <div className="flex items-center gap-4">
                  {/* Buy Now Button (Large) */}
                  <button
                    onClick={handleBuyNow}
                    disabled={adding}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white h-16 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 group"
                  >
                    <CheckCircle size={22} className="group-hover:scale-110 transition-transform" />
                    <span>الشراء الفوري</span>
                  </button>

                  {/* Add to Cart Button (Small, Icon-only) */}
                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    title="إضافة إلى السلة"
                    className="w-16 h-16 bg-secondary text-primary hover:bg-secondary-dark/20 border border-secondary-dark/20 rounded-[1.5rem] flex items-center justify-center transition-all active:scale-95 disabled:opacity-70 flex-shrink-0 relative group"
                  >
                    {adding ? (
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ) : showSuccess ? (
                      <Check size={24} className="text-emerald-600 animate-bounce" />
                    ) : (
                      <ShoppingBag size={24} className="group-hover:rotate-12 transition-transform" />
                    )}

                    {showSuccess && (
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-lg animate-fade-in-up whitespace-nowrap">
                        تمت الإضافة!
                      </span>
                    )}
                  </button>
                </div>
              </div>

                {benefits.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {benefits.map(benefit => {
                      const ICON_MAP: Record<string, any> = {
                        Sparkles, CheckCircle: ShieldCheck, Shield, Heart, Star, Truck, Award, ThumbsUp, Clock
                      };
                      const Icon = ICON_MAP[benefit.icon] || ShieldCheck;
                      return (
                        <div key={benefit.id} className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                          <Icon className="text-primary" size={20} />
                          {benefit.title}
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="bg-red-50 text-red-600 p-6 rounded-[2rem] flex items-start gap-4 border border-red-100">
                  <Clock className="mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">نفذت الكمية حالياً</h4>
                    <p className="text-sm opacity-80">هذا المنتج غير متوفر حالياً ولكن يمكنك الانضمام لقائمة الانتظار لنخبرك حال توفره.</p>
                  </div>
                </div>

                {product.allow_waitlist && (
                  <button
                    onClick={() => router.push(`/products/${id}/waitlist`)}
                    className="w-full bg-foreground text-white py-5 rounded-[2rem] font-bold text-lg hover:shadow-2xl transition-all"
                  >
                    انضم لقائمة الانتظار
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Overlay */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in" onClick={() => setLightboxOpen(false)}>
          <button
            className="absolute top-8 left-8 text-white/50 hover:text-white p-2 transition-colors z-50 bg-white/10 rounded-full"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={28} />
          </button>

          <div className="relative w-full max-w-5xl aspect-square md:aspect-video rounded-3xl" onClick={e => e.stopPropagation()}>
            <img
              src={images[activeImage].image_url}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-transform hover:scale-110 z-50 bg-white/5 rounded-full"
                onClick={(e) => { e.stopPropagation(); setActiveImage(idx => idx === 0 ? images.length - 1 : idx - 1); }}
              >
                <ChevronRight size={40} />
              </button>
              <button
                className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-transform hover:scale-110 z-50 bg-white/5 rounded-full"
                onClick={(e) => { e.stopPropagation(); setActiveImage(idx => idx === images.length - 1 ? 0 : idx + 1); }}
              >
                <ChevronLeft size={40} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
