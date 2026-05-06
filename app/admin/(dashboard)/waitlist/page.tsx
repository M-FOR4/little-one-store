"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Search, Mail, CheckCircle, Trash2, Phone, Loader2 } from "lucide-react";

export default function WaitlistPage() {
  const [loading, setLoading] = useState(true);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWaitlist() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('waitlist')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching waitlist:", error);
      } else {
        setWaitlist(data || []);
      }
      setLoading(false);
    }

    fetchWaitlist();
  }, []);

  const toggleNotified = async (id: string, currentStatus: boolean) => {
    setUpdating(id);
    const supabase = createClient();
    const { error } = await supabase
      .from('waitlist')
      .update({ is_notified: !currentStatus })
      .eq('id', id);

    if (!error) {
      setWaitlist(waitlist.map(w => w.id === id ? { ...w, is_notified: !currentStatus } : w));
    }
    setUpdating(null);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    const supabase = createClient();
    const { error } = await supabase.from('waitlist').delete().eq('id', id);
    if (!error) {
      setWaitlist(waitlist.filter(w => w.id !== id));
    }
  };

  const filteredWaitlist = waitlist.filter(w => 
    w.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.phone_number?.includes(searchTerm)
  );

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
        <h1 className="text-2xl font-bold text-gray-800">قائمة الانتظار</h1>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="البحث بالاسم أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-sm border-b">
                <th className="px-6 py-4 font-medium">العميل</th>
                <th className="px-6 py-4 font-medium">المنتج المطلوب</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredWaitlist.length > 0 ? (
                filteredWaitlist.map((item) => (
                  <tr key={item.id} className="text-gray-700 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{item.customer_name}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1" dir="ltr">
                          <Phone size={12} /> {item.phone_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-primary">
                      {item.products?.name || "منتج غير معروف"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('ar-LY')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.is_notified ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {item.is_notified ? 'تم الإبلاغ' : 'قيد الانتظار'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleNotified(item.id, item.is_notified)}
                          disabled={updating === item.id}
                          className={`p-2 transition-colors ${item.is_notified ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
                          title={item.is_notified ? "تحديد كغير مبلّغ" : "تحديد كمبلّغ"}
                        >
                          {updating === item.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                        </button>
                        <button 
                          onClick={() => deleteEntry(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="حذف من القائمة"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد أحد في قائمة الانتظار حالياً
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
