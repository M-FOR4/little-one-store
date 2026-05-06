"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { ShoppingBag, Search, Filter, Eye, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";

export default function OrdersList() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o =>
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><CheckCircle size={14} /> مكتمل</span>;
      case 'pending':
        return <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><Clock size={14} /> قيد الانتظار</span>;
      case 'cancelled':
        return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><XCircle size={14} /> ملغي</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium w-fit">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">الطلبات</h1>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="البحث برقم الطلب أو اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all font-medium">
          <Filter size={20} />
          <span>تصفية</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-sm border-b">
                <th className="px-6 py-4 font-medium">رقم الطلب</th>
                <th className="px-6 py-4 font-medium">العميل</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">المبلغ الإجمالي</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="text-gray-700 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{order.customer_name}</span>
                        <span className="text-xs text-gray-400">{order.phone_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(order.created_at).toLocaleDateString('ar-LY')}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {order.total_amount} د.ل
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/orders/${order.id}`} className="p-2 text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
                          <Eye size={18} />
                          <span>عرض</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد طلبات بعد"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
