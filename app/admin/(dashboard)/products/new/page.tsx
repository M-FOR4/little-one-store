"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Save, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSaveProgress } from "@/components/admin/SaveProgressContext";

export default function NewProduct() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { startSave } = useSaveProgress();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "cribs",
    stock_status: "in_stock",
    stock_quantity: 0,
    dimensions: "",
    material: "",
    allow_waitlist: false,
    discount_price: "",
    flash_sale_end: "",
    show_countdown: false,
    is_featured: false,
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    if (selectedFiles.length === 0) {
      alert("يرجى إضافة صورة واحدة على الأقل للمنتج");
      return;
    }

    setLoading(true);

    const savePromise = async () => {
      // 1. Upload Images via API
      const imageUrls: string[] = [];
      for (const [i, file] of selectedFiles.entries()) {
        const ext = file.name.split(".").pop() || "jpg";
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        uploadForm.append("bucket", "media");
        uploadForm.append("path", `products/${Date.now()}-${i}.${ext}`);

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadForm,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "خطأ في رفع الصورة");
        imageUrls.push(uploadData.publicUrl);
      }

      // 2. Create Product via API
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productData: formData, imageUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في حفظ المنتج");
    };

    // Extract product name for the toast
    const productName = formData.name || "منتج جديد";

    // Create a unique ID for this task
    const taskId = `save-prod-${Date.now()}`;

    // Start background save
    startSave(taskId, productName, savePromise);

    // Unblock UI immediately
    setLoading(false);
    router.push("/admin/products");
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowRight size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">إضافة منتج جديد</h1>
        </div>
        <button
          type="submit"
          form="product-form"
          disabled={loading}
          className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          <Save size={20} />
          <span>{loading ? "جاري الحفظ..." : "حفظ المنتج"}</span>
        </button>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-4">المعلومات الأساسية</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
                placeholder="مثال: سرير أطفال كلاسيكي"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-gray-800"
                placeholder="وصف تفصيلي للمنتج..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الأبعاد (المقاسات)</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
                  placeholder="مثال: 120x60 سم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الخامات</label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
                  placeholder="مثال: خشب زان"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-4">صور المنتج</h2>
            <ImageUploader onChange={setSelectedFiles} />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-4">التسعير والمخزون</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">السعر (د.ل)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">حالة المخزون</label>
              <select
                value={formData.stock_status}
                onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-gray-800"
              >
                <option value="in_stock">متوفر</option>
                <option value="out_of_stock">غير متوفر</option>
                <option value="backorder">متاح للحجز</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كمية المخزون</label>
              <input
                type="number"
                required
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
                placeholder="0"
                min="0"
              />
            </div>

            {formData.stock_status === 'out_of_stock' && (
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer border border-gray-200">
                <input
                  type="checkbox"
                  checked={formData.allow_waitlist}
                  onChange={(e) => setFormData({ ...formData, allow_waitlist: e.target.checked })}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">تفعيل قائمة الانتظار (Waitlist)</span>
              </label>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center justify-between mb-4 border-b pb-4">
              <h2 className="text-lg font-bold text-gray-800">منتج مميز (يظهر في الرئيسية)</h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between mb-4 border-b pb-4">
              <h2 className="text-lg font-bold text-gray-800">العرض الموقوت</h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.show_countdown}
                  onChange={(e) => setFormData({ ...formData, show_countdown: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {formData.show_countdown && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سعر التخفيض (د.ل)</label>
                  <input
                    type="number"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ انتهاء العرض</label>
                  <input
                    type="datetime-local"
                    value={formData.flash_sale_end}
                    onChange={(e) => setFormData({ ...formData, flash_sale_end: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
