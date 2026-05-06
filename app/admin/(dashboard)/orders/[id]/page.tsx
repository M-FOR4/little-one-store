"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase";
import { ArrowRight, Package, Truck, CheckCircle, Clock, XCircle, Phone, MapPin, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
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
      setLoading(false);
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
        
        <div className="flex items-center gap-3">
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
              <option value="cancelled">ملغي</option>
            </select>
          </div>
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
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {order.status === 'completed' ? 'تم التسليم' : 'جاري العمل'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-4 flex items-center gap-2">
              <Package size={20} className="text-primary" />
              المنتجات المرفقة ({items.length})
            </h2>
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
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
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-800">إجمالي الطلب</span>
                  <span className="text-2xl font-black text-primary">{order.total_amount} د.ل</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-4 flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              تتبع الحالة
            </h2>
            <div className="py-6 space-y-8 relative">
              <div className="absolute top-8 bottom-8 right-5 w-0.5 bg-gray-100" />
              
              <div className="flex items-center gap-6 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                  ['pending', 'processing', 'shipped', 'completed'].includes(order.status) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Clock size={18} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">تم استلام الطلب</p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('ar-LY')}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                  ['shipped', 'completed'].includes(order.status) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Truck size={18} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">تم الشحن</p>
                  <p className="text-xs text-gray-400">الطلب الآن في طريقه للعميل</p>
                </div>
              </div>

              <div className="flex items-center gap-6 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                  order.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <CheckCircle size={18} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">مكتمل</p>
                  <p className="text-xs text-gray-400">تم تسليم الطلب بنجاح للعميل</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
