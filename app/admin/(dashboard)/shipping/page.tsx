"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Plus, Trash2, MapPin, Save, X } from "lucide-react";

export default function ShippingCitiesPage() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCity, setNewCity] = useState({ name: "", shipping_fee: "" });

  useEffect(() => {
    fetchCities();
  }, []);

  async function fetchCities() {
    const supabase = createClient();
    const { data } = await supabase
      .from("shipping_cities")
      .select("*")
      .order("name");
    if (data) setCities(data);
    setLoading(false);
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase
      .from("shipping_cities")
      .insert({
        name: newCity.name,
        shipping_fee: parseFloat(newCity.shipping_fee),
        is_active: true
      });

    if (error) {
      alert("خطأ في إضافة المدينة");
    } else {
      setNewCity({ name: "", shipping_fee: "" });
      setIsAdding(false);
      fetchCities();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المدينة؟")) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("shipping_cities")
      .delete()
      .eq("id", id);

    if (error) {
      alert("خطأ في الحذف");
    } else {
      fetchCities();
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">مدن الشحن</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة المدن وتكاليف التوصيل المتاحة للزبائن</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-medium"
          >
            <Plus size={20} />
            إضافة مدينة
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border-2 border-primary shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">إضافة مدينة جديدة</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم المدينة</label>
              <input 
                required
                type="text"
                value={newCity.name}
                onChange={(e) => setNewCity({...newCity, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                placeholder="مثال: طرابلس"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تكلفة الشحن (د.ل)</label>
              <input 
                required
                type="number"
                value={newCity.shipping_fee}
                onChange={(e) => setNewCity({...newCity, shipping_fee: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="submit"
              className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2"
            >
              <Save size={18} />
              حفظ المدينة
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-sm border-b">
              <th className="px-6 py-4 font-medium">المدينة</th>
              <th className="px-6 py-4 font-medium">تكلفة الشحن</th>
              <th className="px-6 py-4 font-medium text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cities.map((city) => (
              <tr key={city.id} className="text-gray-700 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-primary" />
                    <span className="font-bold text-gray-800">{city.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-primary">
                  {city.shipping_fee} د.ل
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleDelete(city.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
