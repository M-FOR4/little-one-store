"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye } from "lucide-react";
import Link from "next/link";

export default function ProductsList() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">المنتجات</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          <Plus size={20} />
          <span>إضافة منتج</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="البحث عن منتج..."
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
          <table className="w-full text-right whitespace-nowrap min-w-[900px] lg:whitespace-normal lg:min-w-0">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-sm border-b">
                <th className="px-6 py-4 font-medium">المنتج</th>
                <th className="px-6 py-4 font-medium">الفئة</th>
                <th className="px-6 py-4 font-medium">السعر</th>
                <th className="px-6 py-4 font-medium">المخزون</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="text-gray-700 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Plus size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-400">ID: {product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {product.discount_price ? (
                        <div className="flex flex-col">
                          <span className="text-primary">{product.discount_price} د.ل</span>
                          <span className="text-xs text-gray-400 line-through">{product.price} د.ل</span>
                        </div>
                      ) : (
                        <span>{product.price} د.ل</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{product.stock_quantity || 0} قطعة</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock_status === 'in_stock' ? 'bg-green-50 text-green-600' :
                          product.stock_status === 'out_of_stock' ? 'bg-red-50 text-red-600' :
                            'bg-orange-50 text-orange-600'
                        }`}>
                        {product.stock_status === 'in_stock' ? 'متوفر' :
                          product.stock_status === 'out_of_stock' ? 'نفذ' : 'حجز'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.id}`} className="p-2 text-gray-400 hover:text-primary transition-colors">
                          <Eye size={18} />
                        </Link>
                        <Link href={`/admin/products/${product.id}`} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={async () => {
                            if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                              const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                setProducts(products.filter(p => p.id !== product.id));
                              } else {
                                alert('خطأ في حذف المنتج');
                              }
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد منتجات مضافة بعد"}
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
