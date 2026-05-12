"use client";

import { useCart } from "@/components/CartProvider";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBasket,
  Truck,
  ShieldCheck,
  ChevronLeft,
  Check
} from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  if (totalItems === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-background animate-fade-in">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-primary/5">
          <ShoppingBasket size={64} className="text-gray-200" />
        </div>
        <h1 className="text-3xl font-bold text-foreground font-snaga mb-4">سلة المشتريات فارغة</h1>
        <p className="text-gray-500 mb-10 max-w-xs text-center leading-relaxed">اكتشفي مجموعتنا المميزة من الأسرّة وابدأي بتجهيز عالم طفلك الصغير.</p>
        <Link
          href="/products"
          className="bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all flex items-center gap-3 active:scale-95"
        >
          اكتشفي المجموعة
          <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground font-snaga animate-fade-in-up">سلة التسوق</h1>
            <p className="text-gray-500 font-medium flex items-center gap-2 animate-fade-in-up">
              لديك <span className="text-primary font-bold">{totalItems} قطع</span> في سلتك
            </p>
          </div>
          <Link href="/products" className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all group lg:text-lg animate-fade-in-up">
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            واصلي التسوق
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {items.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-8 group hover:shadow-xl hover:shadow-gray-200/40 transition-all">
                <div className="relative w-32 h-32 rounded-[2rem] overflow-hidden bg-background flex-shrink-0">
                  <img src={item.image_url || "/icons/logo.svg"} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>

                <div className="flex-1 text-center sm:text-right space-y-2">
                  <Link href={`/products/${item.id}`} className="text-xl font-bold text-foreground hover:text-primary transition-colors font-snaga block">
                    {item.name}
                  </Link>
                  <p className="text-primary font-bold text-lg">{item.price} د.ل</p>
                </div>

                <div className="flex items-center bg-background rounded-2xl px-3 py-2 border border-gray-100">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 text-gray-400 hover:text-primary transition-colors active:scale-90"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-10 text-center font-bold text-lg">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 text-gray-400 hover:text-primary transition-colors active:scale-90"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="text-center sm:text-left min-w-[100px] space-y-1">
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">الإجمالي</p>
                  <p className="text-xl font-black text-foreground">{item.price * item.quantity} د.ل</p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group-hover:text-gray-400"
                  title="إزالة من السلة"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-6 pt-6 text-center">
              <div className="bg-white/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center gap-3 group">
                <Truck className="text-secondary group-hover:scale-110 transition-transform" size={32} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">توصيل آمن</p>
                <span className="text-sm font-bold text-foreground">لجميع مدن ليبيا</span>
              </div>
              <div className="bg-white/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center gap-3 group">
                <ShieldCheck className="text-primary group-hover:scale-110 transition-transform" size={32} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ضمان حقيقي</p>
                <span className="text-sm font-bold text-foreground">ثقة وجودة عالية</span>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1 sticky top-32 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-primary/5 space-y-8">
              <h2 className="text-2xl font-bold text-foreground font-snaga border-b border-gray-100 pb-6">ملخص الطلب</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold text-foreground">{totalPrice} د.ل</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>رسوم التوصيل</span>
                  <span className="text-xs font-medium text-gray-400 self-center">تحدد في الخطوة القادمة</span>
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xl font-bold text-foreground font-snaga">الإجمالي</span>
                  <span className="text-3xl font-black text-primary">{totalPrice} د.ل</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-[2rem] font-bold text-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-4 transform hover:-translate-y-1 active:translate-y-0"
              >
                <span>إتمام الطلب</span>
                <ChevronLeft size={24} />
              </Link>

              <div className="space-y-4 pt-4">
                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-[2px]">طرق الدفع المتوفرة</p>
                <div className="flex items-center justify-center gap-4 bg-background py-4 rounded-2xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                    <Check className="text-green-500" size={16} />
                    الدفع عند الاستلام
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
