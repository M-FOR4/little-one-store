"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { ShoppingBag, Search, Filter, Eye, CheckCircle, Clock, XCircle, Download, Printer, Loader2, Plus } from "lucide-react";
import Link from "next/link";

export default function OrdersList() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchOrders() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setOrders(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
    setUpdatingId(null);
  };

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
      case 'processing':
        return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">جاري التجهيز</span>;
      case 'shipped':
        return <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">تم الشحن</span>;
      case 'cancelled':
        return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><XCircle size={14} /> ملغي</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium w-fit">{status}</span>;
    }
  };

  const exportToCSV = () => {
    if (orders.length === 0) return;

    const headers = ["Order ID", "Customer", "Phone", "City", "Total", "Status", "Date"];
    const rows = orders.map(o => [
      o.id.slice(0, 8),
      o.customer_name,
      o.phone_number,
      o.city,
      o.total_amount,
      o.status,
      new Date(o.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="flex gap-3">
          <Link
            href="/admin/orders/new"
            className="flex items-center gap-2 bg-secondary text-white px-5 py-3 rounded-xl font-bold hover:bg-secondary-dark transition-all shadow-lg shadow-secondary/10"
          >
            <Plus size={18} />
            <span>طلب يدوي جديد</span>
          </Link>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/10"
          >
            <Download size={18} />
            <span>تصدير Excel</span>
          </button>
        </div>
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
          <table className="w-full text-right whitespace-nowrap min-w-[800px] lg:whitespace-normal lg:min-w-0">
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
                      {updatingId === order.id ? (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Loader2 size={14} className="animate-spin" />
                          جاري التحديث...
                        </div>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-primary outline-none transition-all ${order.status === 'completed' ? 'bg-green-50 text-green-600' :
                            order.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                              order.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                                order.status === 'shipped' ? 'bg-indigo-50 text-indigo-600' :
                                  'bg-red-50 text-red-600'
                            }`}
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="processing">جاري التجهيز</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="completed">مكتمل</option>
                          <option value="returned">مرتجع</option>
                          <option value="failed">فشل</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-2 text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium bg-gray-50 rounded-lg hover:bg-white border border-transparent hover:border-gray-100"
                          title="عرض التفاصيل"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/admin/orders/${order.id}?print=true`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-secondary transition-colors flex items-center gap-1 text-sm font-medium bg-gray-50 rounded-lg hover:bg-white border border-transparent hover:border-gray-100"
                          title="طباعة الفاتورة"
                        >
                          <Printer size={18} />
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
