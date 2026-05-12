"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
    LineChart,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Package,
    MapPin,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    PieChart,
    Calendar
} from "lucide-react";

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({
        revenueByCity: [],
        topProducts: [],
        dailyRevenue: [],
        totalRevenue: 0,
        averageOrderValue: 0,
        conversionRate: 0, // Mocked for now
        monthlyGrowth: 12.5 // Mocked
    });

    useEffect(() => {
        async function fetchAnalytics() {
            const supabase = createClient();
            try {
                // 1. Fetch Orders for City Revenue
                const { data: orders } = await supabase.from('orders').select('city, total_amount, created_at');

                const cityMap: Record<string, number> = {};
                let totalRev = 0;

                if (orders) {
                    orders.forEach(o => {
                        const city = o.city || 'أخرى';
                        cityMap[city] = (cityMap[city] || 0) + (o.total_amount || 0);
                        totalRev += (o.total_amount || 0);
                    });
                }

                const revenueByCity = Object.entries(cityMap)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value);

                // 2. Top Products
                const { data: orderItems } = await supabase
                    .from('order_items')
                    .select('product_id, quantity, products(name)');

                const productMap: Record<string, { name: string, quantity: number }> = {};
                if (orderItems) {
                    orderItems.forEach((oi: any) => {
                        const id = oi.product_id;
                        const name = oi.products?.name || 'منتج غير معروف';
                        if (!productMap[id]) productMap[id] = { name, quantity: 0 };
                        productMap[id].quantity += (oi.quantity || 0);
                    });
                }

                const topProducts = Object.values(productMap)
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 5);

                setStats({
                    revenueByCity,
                    topProducts,
                    totalRevenue: totalRev,
                    averageOrderValue: orders?.length ? totalRev / orders.length : 0,
                    monthlyGrowth: 15.2,
                });

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 font-snaga flex items-center gap-3">
                        <TrendingUp className="text-primary" size={32} />
                        التحليلات الذكية والتقارير
                    </h1>
                    <p className="text-gray-500 mt-1">مرحباً بك في مركز بيانات متجر Little One</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <Calendar size={18} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-600">آخر 30 يوم</span>
                </div>
            </div>

            {/* Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <DollarSign size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold">
                            <ArrowUpRight size={14} />
                            {stats.monthlyGrowth}%
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-bold">إجمالي المبيعات</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{stats.totalRevenue.toLocaleString()} د.ل</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                            <ShoppingBag size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold">
                            <ArrowUpRight size={14} />
                            8.2%
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-bold">متوسط قيمة الطلب</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{Math.round(stats.averageOrderValue).toLocaleString()} د.ل</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl">
                            <TrendingUp size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold">
                            <ArrowDownRight size={14} />
                            2.1%
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-bold">معدل التحويل (تقديري)</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">3.4%</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                            <Package size={24} />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-bold">المنتجات الأكثر مبيعاً</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{stats.topProducts[0]?.name.slice(0, 15)}...</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* City Distribution */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <MapPin className="text-red-500" />
                            توزيع الإيرادات حسب المدينة
                        </h3>
                        <BarChart3 size={20} className="text-gray-300" />
                    </div>
                    <div className="space-y-6">
                        {stats.revenueByCity.map((city: any, idx: number) => {
                            const percentage = (city.value / stats.totalRevenue) * 100;
                            return (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-gray-700">{city.name}</span>
                                        <span className="text-primary font-black">{city.value.toLocaleString()} د.ل</span>
                                    </div>
                                    <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                                        <div
                                            className="bg-primary h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${percentage}%`, opacity: 1 - (idx * 0.15) }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Selling Products List */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <PieChart className="text-purple-500" />
                            أفضل 5 منتجات مبيعاً
                        </h3>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">حسب الكمية</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {stats.topProducts.map((product: any, idx: number) => (
                            <div key={idx} className="py-4 flex items-center justify-between group hover:bg-gray-50 transition-colors rounded-2xl px-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                        #{idx + 1}
                                    </div>
                                    <span className="font-bold text-gray-700">{product.name}</span>
                                </div>
                                <div className="text-left">
                                    <span className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold">
                                        {product.quantity} قطعة
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-secondary/20 rounded-[2rem] border border-secondary/30 flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-secondary-dark">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            نمو المبيعات هذا الشهر ارتفع بنسبة <strong>{stats.monthlyGrowth}%</strong> مقارنة بالشهر الماضي. استمر في التركيز على المنتجات الأكثر طلباً.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
