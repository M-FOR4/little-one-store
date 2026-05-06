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
  Heart
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
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
              <img 
                src={images[activeImage].image_url} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
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
                    className={`w-3 h-3 rounded-full transition-all ${
                      activeImage === idx ? "bg-primary w-8 shadow-lg shadow-primary/30" : "bg-white/50 backdrop-blur-sm"
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
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 ${
                    activeImage === idx ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-secondary">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-400">تقييم ممتاز (5.0)</span>
            </div>
          </div>

          <div className="pb-8 border-b border-gray-100">
            <div className="flex items-center gap-4">
              {product.discount_price ? (
                <>
                  <span className="text-4xl font-extrabold text-primary font-snaga">{product.discount_price} د.ل</span>
                  <span className="text-xl text-gray-400 line-through font-medium">{product.price} د.ل</span>
                </>
              ) : (
                <span className="text-4xl font-extrabold text-foreground font-snaga">{product.price} د.ل</span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-2">* السعر شامل الضريبة، لا يشمل رسوم التوصيل</p>
          </div>

          <div className="space-y-6">
            <p className="text-gray-600 leading-relaxed text-lg">
              {product.description || "لا يوجد وصف متوفر لهذا المنتج حالياً. ولكننا نضمن لك أعلى معايير الجودة والأمان في جميع تصاميمنا."}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-4 rounded-2xl flex items-center gap-4 border border-gray-100/50">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary">
                  <Maximize2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">الأبعاد</p>
                  <p className="text-sm font-bold text-foreground">{product.dimensions || "قياسي"}</p>
                </div>
              </div>
              <div className="bg-background p-4 rounded-2xl flex items-center gap-4 border border-gray-100/50">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary">
                  <Heart size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">المواد</p>
                  <p className="text-sm font-bold text-foreground">{product.material || "خشب طبيعي"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-8 space-y-6">
            {!isOutOfStock ? (
              <>
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-background border border-gray-100 rounded-2xl px-4 py-2">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-2 text-gray-400 hover:text-primary transition-colors active:scale-90"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="w-12 text-center font-bold text-xl text-foreground">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-2 text-gray-400 hover:text-primary transition-colors active:scale-90"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white h-16 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-70 group"
                  >
                    {adding ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : showSuccess ? (
                      <div className="flex items-center gap-2 animate-bounce">
                        <Check size={24} />
                        <span>تمت الإضافة!</span>
                      </div>
                    ) : (
                      <>
                        <ShoppingBag size={24} className="group-hover:rotate-12 transition-transform" />
                        <span>أضيفي إلى السلة</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <ShieldCheck className="text-green-500" size={20} />
                    ضمان لمدة سنتين
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <Truck className="text-primary" size={20} />
                    توصيل لباب المنزل
                  </div>
                </div>
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
    </div>
  );
}
