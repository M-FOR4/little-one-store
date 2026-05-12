"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase";
import { ArrowRight, Package, Truck, CheckCircle, Clock, XCircle, Phone, MapPin, User, Loader2, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";

export default function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrderData() {
      const supabase = createClient();

      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) {
        alert("خطأ في جلب بيانات الطلب");
        router.push("/admin/orders");
        return;
      }

      setOrder(orderData);

      // Fetch order items with product details
      const { data: itemsData } = await supabase
        .from('order_items')
        .select(`
          *,
          products(name, image_url)
        `)
        .eq('order_id', id);

      setItems(itemsData || []);

      // Fetch site settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .single();

      setSiteSettings(settingsData);
      setLoading(false);

      // Auto-trigger print if requested via query param
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('print') === 'true') {
        setTimeout(() => {
          window.print();
        }, 1000);
      }
    }

    fetchOrderData();
  }, [id, router]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert("خطأ في تحديث الحالة: " + error.message);
    } else {
      setOrder({ ...order, status: newStatus });
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowRight size={24} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">تفاصيل الطلب #{order.id.slice(0, 8)}</h1>
            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString('ar-LY')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all font-bold"
          >
            <Printer size={18} />
            <span>طباعة الفاتورة</span>
          </button>
          <div className="relative">
            {updating && <Loader2 className="absolute -right-8 top-1/2 -translate-y-1/2 animate-spin text-primary" size={20} />}
            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-primary outline-none appearance-none min-w-[140px] cursor-pointer pl-10"
            >
              <option value="pending">قيد الانتظار</option>
              <option value="processing">جاري التجهيز</option>
              <option value="shipped">تم الشحن</option>
              <option value="completed">مكتمل</option>
              <option value="returned">مرتجع</option>
              <option value="failed">فشل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* Hide EVERYTHING else */
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; }
          @page { size: A4; margin: 0; }
          html, body { height: 100%; background: white !important; }
        }
        .print-only { display: none; }
        @media print { .print-only { display: block; } }
      `}</style>

      {/* The Mega Premium Invoice - DARK BUSINESS THEME */}
      <div className="print-only print-area w-full min-h-screen bg-white font-cairo text-gray-900 p-0 overflow-hidden">
        {/* Header Decor */}
        <div className="h-4 bg-[#1A1A1A] w-full mb-8"></div>

        <div className="px-12 py-8">
          <div className="flex justify-between items-start mb-12">
            <div className="space-y-4">
              <img src="/images/logo.png" alt="Little One" className="h-20 w-auto object-contain" />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A]">INVOICE / فاتورة بيع</h1>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Official Document</p>
              </div>
            </div>
            <div className="text-left space-y-2 pt-2">
              <div className="bg-[#1A1A1A] text-white px-6 py-4 rounded-xl inline-block">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Invoice Number</p>
                <p className="text-xl font-black">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="pr-4 border-r-4 border-gray-100 py-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Date of Issue</p>
                <p className="text-sm font-bold text-gray-700">{new Date(order.created_at).toLocaleDateString('ar-LY')}</p>
              </div>
            </div>
          </div>

          {/* Business/Client Info Row */}
          <div className="grid grid-cols-2 gap-16 mb-16 px-2">
            <div className="space-y-6">
              <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest border-b pb-2">Client Details / بيانات العميل</h4>
              <div className="space-y-2 text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-gray-400">الاسم:</span>
                  <p className="text-xl font-black text-[#1A1A1A]">{order.customer_name}</p>
                </div>
                <div className="flex items-center gap-2" dir="rtl">
                  <span className="text-sm font-black text-gray-400">الرقم:</span>
                  <p className="text-lg font-bold text-gray-700" dir="ltr">{order.phone_number}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-black text-gray-400 mt-1">العنوان:</span>
                  <p className="text-sm font-bold text-gray-500 leading-relaxed">{order.city}, {order.address}</p>
                </div>
              </div>
            </div>
            <div className="text-left space-y-6">
              <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest border-b pb-2 text-left">Company Details</h4>
              <div className="space-y-1 text-sm font-bold text-gray-500">
                <p className="text-[#1A1A1A]">{siteSettings?.site_name || "Little One Trading Co."}</p>
                <p>{siteSettings?.company_address || "Libya, Tripoli - Hai Al-Andalus"}</p>
                <p>{siteSettings?.company_tax_id || "VAT ID: 102-445-998"}</p>
                <p dir="ltr" className="text-left font-bold">{siteSettings?.company_phone || "+218 91 000 0000"}</p>
              </div>
            </div>
          </div>

          {/* Premium Table */}
          <div className="mb-12 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#1A1A1A] text-white">
                  <th className="p-6 font-black text-sm uppercase">Item Description / المنتج</th>
                  <th className="p-6 font-black text-sm uppercase text-center">Qty / كمية</th>
                  <th className="p-6 font-black text-sm uppercase text-center">Unit Price / سعر</th>
                  <th className="p-6 font-black text-sm uppercase text-left">Amount / إجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-6">
                      <p className="font-black text-gray-800 text-lg">{item.products?.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Ref ID: {item.product_id.slice(0, 8)}</p>
                    </td>
                    <td className="p-6 text-center text-lg font-bold text-gray-700">{item.quantity}</td>
                    <td className="p-6 text-center text-lg font-bold text-gray-700">{item.price_at_time_of_purchase} د.ل</td>
                    <td className="p-6 text-left text-lg font-black text-[#1A1A1A]">{item.quantity * item.price_at_time_of_purchase} د.ل</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="flex justify-between items-end mb-20 px-4">
            <div className="w-1/3 flex flex-col gap-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Authorized Signature / الختم والتوقيع</p>
                <div className="w-full h-24 border-b-2 border-gray-100 flex items-end justify-center pb-2">
                  <span className="text-[10px] text-gray-300 italic">Signature / Stamp</span>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Notice / ملاحظة</p>
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                  {siteSettings?.invoice_footer_note || "هذه الفاتورة وثيقة رسمية. يرجى مراجعة البضاعة عند الاستلام. الاسترداد والتبديل يتم خلال 3 أيام شرط وجود الفاتورة."}
                </p>
              </div>
            </div>

            <div className="w-1/2 space-y-4">
              <div className="flex justify-between items-center px-6 text-gray-400 font-bold uppercase tracking-widest text-xs">
                <span>Subtotal / المجموع</span>
                <span className="text-gray-900 border-b-2 border-gray-50">{(order.total_amount + (order.discount_amount || 0)).toFixed(2)} د.ل</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between items-center px-6 text-green-600 font-black text-sm">
                  <span>Discount / الخصم ({order.coupon_code})</span>
                  <span>-{order.discount_amount} د.ل</span>
                </div>
              )}
              <div className="relative overflow-hidden bg-[#1A1A1A] text-white p-8 rounded-[2.5rem] shadow-2xl flex justify-between items-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Amount Due</p>
                  <p className="text-sm font-bold opacity-60 font-snaga">المبلغ الإجمالي المطلوب</p>
                </div>
                <span className="text-4xl font-black font- Cairo">{order.total_amount} <span className="text-sm font-bold">د.ل</span></span>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="text-center pt-8 border-t border-gray-50">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">Quality & Reliability since 2024</p>
            <div className="flex justify-center items-center gap-6 text-[10px] font-black text-gray-400">
              <p>Phone: +218 91 000 0000</p>
              <p>Email: orders@littleone.ly</p>
              <p>Address: Hai Al-Andalus, Tripoli</p>
            </div>
          </div>
        </div>

        {/* Bottom Decor */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-[#1A1A1A] flex items-center justify-center">
          <p className="text-[8px] text-gray-500 font-bold tracking-[1em] uppercase">Private & Confidential</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Customer Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              معلومات العميل
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">الاسم</p>
                <p className="font-bold text-gray-800">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">رقم الهاتف</p>
                <p className="font-bold text-gray-800" dir="ltr">{order.phone_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">المدينة</p>
                <p className="font-bold text-gray-800">{order.city || "غير محدد"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">العنوان بالتفصيل</p>
                <p className="font-medium text-gray-700 flex items-start gap-2">
                  <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                  {order.address || order.shipping_address}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-4 flex items-center gap-2">
              <Truck size={20} className="text-primary" />
              الدفع والتوصيل
            </h2>
            <div className="py-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">طريقة الدفع</span>
                <span className="font-bold text-gray-800">عند الاستلام</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">حالة التوصيل</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                  {order.status === 'completed' ? 'تم التسليم' : 'جاري العمل'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print-card">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-4 flex items-center gap-2">
              <Package size={20} className="text-primary no-print" />
              المنتجات المرفقة ({items.length})
            </h2>
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 no-print">
                    <img src={item.products?.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{item.products?.name}</p>
                    <p className="text-xs text-gray-400">{item.quantity} قطعة × {item.price_at_time_of_purchase} د.ل</p>
                  </div>
                  <p className="font-bold text-gray-800">{item.quantity * item.price_at_time_of_purchase} د.ل</p>
                </div>
              ))}

              <div className="pt-6 mt-2 space-y-3">
                {order.discount_amount > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600 font-bold border-t border-dashed pt-4">
                    <span>خصم الكوبون ({order.coupon_code})</span>
                    <span>-{order.discount_amount} د.ل</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-800">إجمالي الطلب</span>
                  <span className="text-2xl font-black text-primary">{order.total_amount} د.ل</span>
                </div>
              </div>
            </div>
          </div>

          <div className="no-print">
            {/* Timeline */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-4 flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                تتبع الحالة وإدارتها
              </h2>
              <div className="py-6 space-y-8 relative">
                <div className="absolute top-8 bottom-8 right-5 w-0.5 bg-gray-100" />

                {/* Step 1: Pending */}
                <div className="flex gap-6 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${['pending', 'processing', 'shipped', 'completed'].includes(order.status) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                    <Clock size={18} />
                  </div>
                  <div className="pt-2 w-full">
                    <p className="font-bold text-gray-800">طلب جديد (قيد الانتظار)</p>
                    <p className="text-xs text-gray-400 mb-3">{new Date(order.created_at).toLocaleString('ar-LY')}</p>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateStatus('processing')}
                        disabled={updating}
                        className="bg-primary hover:bg-primary-dark text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-sm"
                      >
                        بدء عملية التجهيز والتصنيع
                      </button>
                    )}
                  </div>
                </div>

                {/* Step 2: Processing */}
                <div className="flex gap-6 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${['processing', 'shipped', 'completed'].includes(order.status) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                    <Package size={18} />
                  </div>
                  <div className="pt-2 w-full">
                    <p className="font-bold text-gray-800">جاري التجهيز</p>
                    <p className="text-xs text-gray-400 mb-3">يتم الآن تجهيز وتصنيع الطلب</p>
                    {order.status === 'processing' && (
                      <button
                        onClick={() => updateStatus('shipped')}
                        disabled={updating}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-sm"
                      >
                        تأكيد شحن الطلب
                      </button>
                    )}
                  </div>
                </div>

                {/* Step 3: Shipped */}
                <div className="flex gap-6 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${['shipped', 'completed'].includes(order.status) ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                    <Truck size={18} />
                  </div>
                  <div className="pt-2 w-full">
                    <p className="font-bold text-gray-800">جاري التوصيل</p>
                    <p className="text-xs text-gray-400 mb-3">الطلب الآن في عهدة شركة الشحن</p>
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateStatus('completed')}
                        disabled={updating}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-sm"
                      >
                        تأكيد استلام العميل
                      </button>
                    )}
                  </div>
                </div>

                {/* Step 4: Completed */}
                <div className="flex gap-6 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${order.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                    <CheckCircle size={18} />
                  </div>
                  <div className="pt-2">
                    <p className="font-bold text-gray-800">مكتمل</p>
                    <p className="text-xs text-gray-400">تم تسليم الطلب بنجاح للعميل</p>
                  </div>
                </div>

                {/* Cancelled State Overlay */}
                {order.status === 'cancelled' && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl border-2 border-red-100">
                    <div className="text-center">
                      <XCircle className="mx-auto text-red-500 mb-2" size={48} />
                      <h3 className="font-bold text-red-600 text-xl">الطلب ملغي</h3>
                      <p className="text-red-400 text-sm mt-1">توقف مسار التتبع بسبب الإلغاء</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="print-only no-print">
        <p className="text-sm text-gray-400 font-bold">شكراً لثقتكم في ليتل ون - نسعد دائماً بخدمتكم</p>
        <p className="text-xs text-gray-400 mt-1">www.littleone.ly</p>
      </div>
    </div>
  );
}
