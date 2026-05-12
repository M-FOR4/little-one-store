"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
    Ticket,
    Plus,
    Trash2,
    Calendar,
    Hash,
    Settings2,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    Percent,
    Banknote
} from "lucide-react";

export default function CouponsPage() {
    const [loading, setLoading] = useState(true);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [saving, setSaving] = useState(false);

    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        min_order_amount: 0,
        is_active: true,
        expiry_date: ""
    });

    async function fetchCoupons() {
        setLoading(true);
        const supabase = createClient();
        const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        setCoupons(data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleAddCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();

        // Auto uppercase the code and handle optional date
        const preparedCoupon = {
            ...newCoupon,
            code: newCoupon.code.toUpperCase().trim(),
            expiry_date: newCoupon.expiry_date === "" ? null : newCoupon.expiry_date
        };

        const { error } = await supabase.from('coupons').insert([preparedCoupon]);

        if (error) {
            alert("خطأ في إضافة الكوبون: " + error.message);
        } else {
            setIsAdding(false);
            setNewCoupon({
                code: "",
                discount_type: "percentage",
                discount_value: 0,
                min_order_amount: 0,
                is_active: true,
                expiry_date: ""
            });
            fetchCoupons();
        }
        setSaving(false);
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
        const supabase = createClient();
        await supabase.from('coupons').delete().eq('id', id);
        fetchCoupons();
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const supabase = createClient();
        await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
        fetchCoupons();
    };

    if (loading && coupons.length === 0) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 font-snaga flex items-center gap-3">
                        <Ticket className="text-primary" size={32} />
                        إدارة الكوبونات (أكواد الخصم)
                    </h1>
                    <p className="text-gray-500 mt-1">أنشئ خصومات لزيادة مبيعاتك وجذب العملاء</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>كوبون جديد</span>
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAddCoupon} className="bg-white p-8 rounded-[2.5rem] border-2 border-primary/20 shadow-xl animate-fade-in-up space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <Settings2 className="text-primary" />
                        إعدادات الكوبون الجديد
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 block">كود الخصم (مثال: EID2024)</label>
                            <input
                                required
                                type="text"
                                value={newCoupon.code}
                                onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none uppercase font-bold"
                                placeholder="ZAYER10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 block">نوع الخصم</label>
                            <select
                                value={newCoupon.discount_type}
                                onChange={e => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="percentage">نسبة مئوية (%)</option>
                                <option value="fixed">مبلغ ثابت (د.ل)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 block">قيمة الخصم</label>
                            <div className="relative">
                                <input
                                    required
                                    type="number"
                                    value={newCoupon.discount_value}
                                    onChange={e => setNewCoupon({ ...newCoupon, discount_value: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {newCoupon.discount_type === 'percentage' ? <Percent size={18} /> : <Banknote size={18} />}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 block">أقل قيمة للطلب لتفعيل الخصم</label>
                            <input
                                type="number"
                                value={newCoupon.min_order_amount}
                                onChange={e => setNewCoupon({ ...newCoupon, min_order_amount: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 block">تاريخ الانتهاء (اختياري)</label>
                            <input
                                type="date"
                                value={newCoupon.expiry_date}
                                onChange={e => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            disabled={saving}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                            حفظ الكوبون
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50 text-gray-400 text-sm border-b uppercase tracking-widest">
                                <th className="px-8 py-5 font-bold">الكود</th>
                                <th className="px-8 py-5 font-bold">القيمة</th>
                                <th className="px-8 py-5 font-bold">الحد الأدنى</th>
                                <th className="px-8 py-5 font-bold">تاريخ الانتهاء</th>
                                <th className="px-8 py-5 font-bold">عدد الاستخدام</th>
                                <th className="px-8 py-5 font-bold">الحالة</th>
                                <th className="px-8 py-5 font-bold text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {coupons.map((coupon) => (
                                <tr key={coupon.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <span className="bg-primary/10 text-primary font-black px-4 py-2 rounded-xl border border-primary/20">
                                            {coupon.code}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-bold text-gray-800">
                                            {coupon.discount_value} {coupon.discount_type === 'percentage' ? '%' : 'د.ل'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-gray-500 font-medium">≥ {coupon.min_order_amount} د.ل</td>
                                    <td className="px-8 py-6 text-gray-500 flex items-center gap-2">
                                        <Calendar size={16} />
                                        {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString('ar-LY') : 'غير محدد'}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Hash size={16} className="text-gray-300" />
                                            <span className="font-bold text-gray-700">{coupon.usage_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${coupon.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                }`}
                                        >
                                            {coupon.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {coupon.is_active ? 'نشط' : 'متوقف'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => deleteCoupon(coupon.id)}
                                                className="p-3 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="حذف الكوبون"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center text-gray-400">
                                        <Ticket size={64} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-xl font-bold">لا يوجد أي أكواد خصم حالياً</p>
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
