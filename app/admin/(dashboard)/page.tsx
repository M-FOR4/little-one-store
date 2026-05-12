"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { ShoppingBag, Users, DollarSign, Package, Clock, LineChart, Banknote, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);

  // New Analytics Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    waitlistCount: 0,

    // Revenue breakdown
    confirmedRevenue: 0, // Completed + Shipped
    pendingRevenue: 0,   // Pending + Processing

    // Status counts for funnel
    statusCounts: {
      pending: 0,
      processing: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0
    },
    lowStockProducts: [] as any[]
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      try {
        // Fetch all orders for analytics
        const { data: allOrders } = await supabase.from('orders').select('status, total_amount');

        let cRev = 0;
        let pRev = 0;
        let sCounts = { pending: 0, processing: 0, shipped: 0, completed: 0, cancelled: 0 };

        if (allOrders) {
          allOrders.forEach(order => {
            const amount = order.total_amount || 0;
            const status = order.status;

            if (['completed', 'shipped'].includes(status)) {
              cRev += amount;
            } else if (['pending', 'processing'].includes(status)) {
              pRev += amount;
            }

            if (status in sCounts) {
              sCounts[status as keyof typeof sCounts]++;
            }
          });
        }

        const { data: products } = await supabase.from('products').select('*');
        const { count: waitCount } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });
        // Use stock_quantity and include 0 stock
        const lowStock = products?.filter(p => (p.stock_quantity || 0) <= 5) || [];

        setStats({
          totalOrders: allOrders?.length || 0,
          totalProducts: products?.length || 0,
          waitlistCount: waitCount || 0,
          confirmedRevenue: cRev,
          pendingRevenue: pRev,
          statusCounts: sCounts,
          lowStockProducts: lowStock
        });

        // Fetch Recent Orders
        const { data: recent } = await supabase
          .from('orders')
          .select('*, customer_name')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders(recent || []);

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const totalRevenue = stats.confirmedRevenue + stats.pendingRevenue;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-snaga text-gray-800 flex items-center gap-2">
          <LineChart className="text-primary" />
          تحليلات الأداء والتقارير
        </h1>
        {stats.lowStockProducts.length > 0 && (
          <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-xl flex items-center gap-3 animate-pulse">
            <Package className="text-red-500" size={20} />
            <span className="text-sm font-bold text-red-600">تنبيه: يوجد {stats.lowStockProducts.length} منتجات أوشكت على النفاد!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-bold">إجمالي الإيرادات المؤكدة</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-gray-800">{stats.confirmedRevenue.toLocaleString()}</h3>
                <span className="text-sm text-gray-400">د.ل</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-medium">الطلبات المكتملة والمشحونة</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-xl"><Banknote size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-bold">إيرادات معلقة للتأكيد</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-gray-800">{stats.pendingRevenue.toLocaleString()}</h3>
                <span className="text-sm text-gray-400">د.ل</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-medium">الطلبات قيد المراجعة والتجهيز</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><ShoppingBag size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-bold">حجم الطلبات الكلي</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h3>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-medium">إجمالي الطلبات في المتجر</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Funnel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">مراحل سير الطلبات المنتظرة</h3>

          <div className="space-y-4">
            {/* Pending */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-600">طلب جديد (قيد الانتظار)</span>
                <span className="text-gray-800">{stats.statusCounts.pending} طلبات</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-orange-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${stats.totalOrders ? (stats.statusCounts.pending / stats.totalOrders) * 100 : 0}%` }} />
              </div>
            </div>
            {/* Processing */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-600">قيد التجهيز والتصنيع</span>
                <span className="text-gray-800">{stats.statusCounts.processing} طلبات</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-blue-400 h-3 rounded-full transition-all duration-1000 delay-100" style={{ width: `${stats.totalOrders ? (stats.statusCounts.processing / stats.totalOrders) * 100 : 0}%` }} />
              </div>
            </div>
            {/* Shipped */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-600">تم الشحن للتسليم</span>
                <span className="text-gray-800">{stats.statusCounts.shipped} طلبات</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-indigo-400 h-3 rounded-full transition-all duration-1000 delay-200" style={{ width: `${stats.totalOrders ? (stats.statusCounts.shipped / stats.totalOrders) * 100 : 0}%` }} />
              </div>
            </div>
            {/* Completed */}
            <div className="space-y-1.5 pt-4 border-t border-gray-50 border-dashed">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-green-600 flex items-center gap-1"><ShieldCheck size={16} /> طلبات تم تسليمها بنجاح</span>
                <span className="text-gray-800">{stats.statusCounts.completed} طلبات</span>
              </div>
              <div className="w-full bg-green-50 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${stats.totalOrders ? (stats.statusCounts.completed / stats.totalOrders) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Other Meta Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 gap-4 h-fit">
            <div className="bg-gray-50 flex flex-col justify-center items-center rounded-2xl border border-gray-100 p-4">
              <Package className="text-purple-500 mb-2" size={32} />
              <span className="text-3xl font-black text-gray-800">{stats.totalProducts}</span>
              <span className="text-gray-500 text-sm font-bold mt-1">منتج حي</span>
            </div>
            <div className="bg-gray-50 flex flex-col justify-center items-center rounded-2xl border border-gray-100 p-4">
              <Users className="text-pink-500 mb-2" size={32} />
              <span className="text-3xl font-black text-gray-800">{stats.waitlistCount}</span>
              <span className="text-gray-500 text-sm font-bold mt-1">قائمة الانتظار</span>
            </div>
          </div>
        </div>

        {/* Low Stock Panel - Moved out for better layout */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-red-600 mb-6 border-b pb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            منتجات أوشكت على النفاد
          </h3>
          <div className="space-y-4">
            {stats.lowStockProducts.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-sm">{p.name}</span>
                  <span className="text-xs text-red-500 font-bold">المخزون: {p.stock_quantity || 0}</span>
                </div>
                <Link href={`/admin/products`} className="text-xs font-bold text-primary hover:underline">تحديث</Link>
              </div>
            ))}
            {stats.lowStockProducts.length === 0 && (
              <div className="text-center py-10">
                <ShieldCheck className="mx-auto text-green-200 mb-2" size={48} />
                <p className="text-xs text-gray-400 font-bold uppercase">المخزون ممتاز حالياً</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-4">مؤخراً في المتجر (أحدث الطلبات)</h3>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-gray-400 text-sm border-b">
                  <th className="pb-4 font-medium">رقم الطلب</th>
                  <th className="pb-4 font-medium">العميل</th>
                  <th className="pb-4 font-medium">المبلغ</th>
                  <th className="pb-4 font-medium">الحالة</th>
                  <th className="pb-4 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="text-gray-700">
                    <td className="py-4 font-medium">#{order.id.slice(0, 8)}</td>
                    <td className="py-4 font-bold">{order.customer_name}</td>
                    <td className="py-4 font-bold text-primary">{order.total_amount} د.ل</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-green-50 text-green-600' :
                        order.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                          order.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                            order.status === 'shipped' ? 'bg-indigo-50 text-indigo-600' :
                              'bg-red-50 text-red-600'
                        }`}>
                        {order.status === 'completed' ? 'مكتمل' :
                          order.status === 'pending' ? 'طلب جديد' :
                            order.status === 'processing' ? 'جاري التجهيز' :
                              order.status === 'shipped' ? 'في الطريق' :
                                order.status === 'returned' ? 'مرتجع' :
                                  order.status === 'failed' ? 'فشل' : 'ملغي'}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-400 font-medium">
                      {new Date(order.created_at).toLocaleDateString('ar-LY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
            <p>لا توجد طلبات حديثة لعرضها</p>
          </div>
        )}
      </div>
    </div>
  );
}
