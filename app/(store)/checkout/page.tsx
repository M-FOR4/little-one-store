"use client";

import { useCart } from "@/components/CartProvider";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  MapPin,
  Phone,
  User,
  CheckCircle,
  ArrowRight,
  Truck,
  CreditCard,
  ChevronLeft,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, totalItems } = useCart();
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city_id: "",
    address: "",
  });
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch Cities
      const { data: citiesData } = await supabase
        .from('shipping_cities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (citiesData) setCities(citiesData);

      // Fetch Site Settings for Coupon Toggle
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('enable_coupons')
        .limit(1)
        .maybeSingle();

      setSiteSettings(settingsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const selectedCity = cities.find(c => c.id === formData.city_id);
  const shippingFee = selectedCity ? selectedCity.shipping_fee : 0;

  // Calculate Discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (totalPrice * appliedCoupon.discount_value) / 100;
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }

  const grandTotal = totalPrice + shippingFee - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setVerifyingCoupon(true);
    setCouponError("");
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setCouponError("كود الخصم غير صحيح أو منتهي الصلاحية");
        setAppliedCoupon(null);
      } else {
        // Check expiry
        if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
          setCouponError("هذا الكود قد انتهت صلاحيته");
          setAppliedCoupon(null);
        }
        // Check min amount
        else if (totalPrice < (data.min_order_amount || 0)) {
          setCouponError(`يجب أن يكون مجموع الطلب ${data.min_order_amount} د.ل أو أكثر لتفعيل هذا الكود`);
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(data);
          setCouponError("");
        }
      }
    } catch (err) {
      setCouponError("حدث خطأ أثناء التحقق من الكود");
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalItems === 0) return;

    setPhoneError("");
    setError("");

    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setPhoneError("رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678)");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          phone_number: formData.phone,
          city: selectedCity.name,
          address: formData.address,
          total_amount: grandTotal,
          coupon_code: appliedCoupon?.code || null,
          discount_amount: discountAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time_of_purchase: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Update Coupon Usage if applied
      if (appliedCoupon) {
        await supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id });
      }

      // 4. Success
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء إتمام الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-foreground font-snaga mb-4">شكراً لك! تم استلام طلبك</h1>
        <p className="text-gray-500 mb-10 max-w-sm text-center leading-relaxed">
          سنقوم بالتواصل معك قريباً عبر الهاتف لتأكيد مواعيد التوصيل. رقم طلبك يحتاج للمتابعة من لوحة الإدارة.
        </p>
        <Link
          href="/"
          className="bg-primary hover:bg-primary-dark text-white px-12 py-5 rounded-3xl font-bold text-xl shadow-xl shadow-primary/20 transition-all flex items-center gap-3"
        >
          العودة للرئيسية
          <ArrowRight />
        </Link>
      </div>
    );
  }

  if (totalItems === 0 && !submitting) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-snaga animate-fade-in-up">بيانات الشحن</h1>
          <p className="text-gray-500 animate-fade-in-up">يرجى تعبئة البيانات بدقة لضمان وصول السرير في أسرع وقت.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-400 flex items-center gap-2 pr-2">
                    <User size={16} /> الاسم الكامل
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: أحمد محمد"
                    className="w-full px-6 py-4 bg-background border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-foreground"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-400 flex items-center gap-2 pr-2" dir="ltr">
                    <Phone size={16} /> رقم الهاتف
                  </label>
                  <input
                    required
                    type="tel"
                    maxLength={10}
                    value={formData.phone}
                    onChange={e => {
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') });
                      if (phoneError) setPhoneError("");
                    }}
                    placeholder="091XXXXXXX"
                    className={`w-full px-6 py-4 bg-background border ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-100 focus:ring-primary'} rounded-2xl focus:ring-2 outline-none transition-all font-bold text-foreground text-right`}
                    dir="ltr"
                  />
                  {phoneError && (
                    <p className="text-xs text-red-500 font-bold pr-2 animate-fade-in-up">{phoneError}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-400 flex items-center gap-2 pr-2">
                    <MapPin size={16} /> المدينة
                  </label>
                  <select
                    required
                    value={formData.city_id}
                    onChange={e => setFormData({ ...formData, city_id: e.target.value })}
                    className="w-full px-6 py-4 bg-background border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-foreground appearance-none cursor-pointer"
                  >
                    <option value="">اختر المدينة</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-400 flex items-center gap-2 pr-2">
                    <Truck size={16} /> العنوان بالتفصيل
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="الحي، اسم الشارع، معلم بارز..."
                    className="w-full px-6 py-4 bg-background border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-foreground"
                  />
                </div>
              </div>

              {/* Payment Info Box */}
              <div className="bg-background/50 p-8 rounded-3xl border border-dashed border-gray-200 space-y-4">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <CreditCard size={20} className="text-secondary" />
                  طريقة الدفع
                </h3>
                <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-primary/20 shadow-sm shadow-primary/5">
                  <div className="w-6 h-6 rounded-full border-4 border-primary flex-shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">الدفع عند الاستلام (CASH)</p>
                    <p className="text-xs text-gray-400">تدفع المبلغ نقداً لمندوب التوصيل عند استلام الطلب.</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-100 animate-shake">
                  <AlertCircle size={20} />
                  <span className="text-sm font-bold">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Side */}
          <div className="lg:col-span-1 space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-primary/5 space-y-8">
              <h2 className="text-2xl font-bold text-foreground font-snaga border-b border-gray-100 pb-6 flex items-center gap-3">
                <ShoppingBag className="text-primary" />
                ملخص طلبك
              </h2>

              <ul className="space-y-6 max-h-[300px] overflow-y-auto no-scrollbar">
                {items.map(item => (
                  <li key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-background flex-shrink-0 border border-gray-50">
                      <img src={item.image_url || "/icons/logo.svg"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} × {item.price} د.ل</p>
                    </div>
                    <span className="font-bold text-primary text-sm whitespace-nowrap">{item.price * item.quantity} د.ل</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-gray-500 font-medium text-sm">
                  <span>مجموع المنتجات</span>
                  <span className="font-bold text-foreground">{totalPrice} د.ل</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium text-sm">
                  <span>رسوم التوصيل</span>
                  <span className="font-bold text-secondary">{formData.city_id ? `${shippingFee} د.ل` : "يتم الحساب..."}</span>
                </div>

                {/* Coupon Input Area */}
                {(siteSettings?.enable_coupons !== false) && (
                  <div className="pt-4 space-y-3">
                    {!appliedCoupon ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="كود الخصم؟"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value)}
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-primary uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={verifyingCoupon || !couponCode}
                          className="px-6 py-3 bg-secondary text-primary font-bold rounded-xl text-sm hover:bg-secondary-dark transition-all disabled:opacity-50"
                        >
                          {verifyingCoupon ? <Loader2 size={16} className="animate-spin" /> : "تطبيق"}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle size={16} />
                          <span className="text-sm font-bold">تم تطبيق كود ({appliedCoupon.code})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                          className="text-xs text-red-500 font-bold hover:underline"
                        >
                          إزالة
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-[10px] text-red-500 font-bold pr-2">{couponError}</p>}
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold text-sm bg-green-50/50 p-2 rounded-lg border border-dashed border-green-200">
                    <span>خصم الكوبون</span>
                    <span>-{discountAmount} د.ل</span>
                  </div>
                )}

                <div className="pt-6 flex justify-between items-center">
                  <span className="text-xl font-bold text-foreground font-snaga">المبلغ الإجمالي</span>
                  <div className="text-left">
                    <span className="text-3xl font-black text-primary">{grandTotal} د.ل</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || loading || !formData.city_id}
                className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white h-20 rounded-[2rem] font-bold text-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-4 group active:scale-95 transform hover:-translate-y-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>جاري التأكيد...</span>
                  </>
                ) : (
                  <>
                    <span>أكدي الطلب الآن</span>
                    <ChevronLeft size={24} className="group-hover:-translate-x-2 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-gray-400 font-bold leading-relaxed px-4">بالضغط على تأكيد، فإنك توافق على سياسة التوصيل والخصوصية في ليتل ون.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
