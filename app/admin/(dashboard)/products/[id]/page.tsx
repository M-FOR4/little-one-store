"use client";

import { useEffect, useState, use } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Save, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useSaveProgress } from "@/components/admin/SaveProgressContext";

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { startSave } = useSaveProgress();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
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
    image_url: "",
  });

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('id', id)
        .single();

      if (error) {
        alert("خطأ في جلب بيانات المنتج");
        router.push("/admin/products");
      } else {
        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          category: data.category || "cribs",
          stock_status: data.stock_status || "in_stock",
          stock_quantity: data.stock_quantity || 0,
          dimensions: data.dimensions || "",
          material: data.material || "",
          allow_waitlist: data.allow_waitlist || false,
          discount_price: data.discount_price?.toString() || "",
          flash_sale_end: data.flash_sale_end || "",
          show_countdown: data.show_countdown || false,
          is_featured: data.is_featured || false,
          image_url: data.image_url || "",
        });
        setExistingImages(data.product_images?.map((img: any) => img.image_url) || []);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id, router]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (saving) return;
    setSaving(true);

    const savePromise = async () => {
      // 1. Upload New Images via API (if any)
      const newImageUrls: string[] = [];
      for (const file of selectedFiles) {
        const uploadForm = new FormData();
        uploadForm.append("file", file);

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadForm,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "خطأ في رفع الصورة");
        newImageUrls.push(uploadData.url);
      }

      const allImages = [...existingImages, ...newImageUrls];

      // 2. Update Product via API
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productData: formData, allImages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في تحديث المنتج");
    };

    const productName = formData.name || "المنتج";
    const taskId = `update-prod-${id}-${Date.now()}`;

    startSave(taskId, productName, savePromise);

    setSaving(false);
    router.push("/admin/products");
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في حذف المنتج");

      alert("تم حذف المنتج");
      router.push("/admin/products");
    } catch (error: any) {
      alert("خطأ في الحذف: " + error.message);
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
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowRight size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">تعديل المنتج</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-medium hover:bg-red-100 transition-all"
          >
            <Trash2 size={20} />
            <span>حذف</span>
          </button>
          <button
            type="submit"
            form="edit-product-form"
            disabled={saving}
            className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
          >
            <Save size={20} />
            <span>{saving ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
          </button>
        </div>
      </div>

      <form id="edit-product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-gray-800"
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الخامات</label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-4">صور المنتج</h2>

            {existingImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setExistingImages(existingImages.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <ImageUploader onChange={setSelectedFiles} />
          </div>
        </div>

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
          </div>

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
      </form>
    </div>
  );
}
