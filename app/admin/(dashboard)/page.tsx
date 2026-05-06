"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { ShoppingBag, Users, DollarSign, Package, Clock } from "lucide-react";

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    waitlistCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      
      try {
        // 1. Total Orders
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        // 2. Total Revenue
        const { data: revenueData } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('status', 'completed');
        
        const revenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

        // 3. Total Products
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // 4. Waitlist Count
        const { count: waitCount } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalOrders: orderCount || 0,
          totalRevenue: revenue,
          totalProducts: productCount || 0,
          waitlistCount: waitCount || 0,
        });

        // 5. Recent Orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*, customer_name')
          .order('created_at', { ascending: false })
          .limit(5);
        
        setRecentOrders(orders || []);

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { title: "إجمالي الطلبات", value: stats.totalOrders, icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
    { title: "الإيرادات", value: `${stats.totalRevenue} د.ل`, icon: DollarSign, color: "bg-green-50 text-green-600" },
    { title: "المنتجات النشطة", value: stats.totalProducts, icon: Package, color: "bg-purple-50 text-purple-600" },
    { title: "قائمة الانتظار", value: stats.waitlistCount, icon: Users, color: "bg-orange-50 text-orange-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-4">أحدث الطلبات</h3>
        
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
                    <td className="py-4">{order.customer_name}</td>
                    <td className="py-4">{order.total_amount} د.ل</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-50 text-green-600' :
                        order.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {order.status === 'completed' ? 'مكتمل' : 
                         order.status === 'pending' ? 'قيد الانتظار' : order.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-400">
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
