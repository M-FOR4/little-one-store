"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
    Sparkles, Plus, Edit2, Trash2, CheckCircle, Shield, Heart,
    Star, Truck, Award, ThumbsUp, Clock, Loader2, Save, X, Settings2
} from "lucide-react";

// Map string names to actual Lucide components
const ICON_MAP: Record<string, any> = {
    Sparkles, CheckCircle, Shield, Heart, Star, Truck, Award, ThumbsUp, Clock
};

export default function FeaturesAdminPage() {
    // Global States
    const [activeTab, setActiveTab] = useState<"store" | "product">("store");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const supabase = createClient();

    // Data States
    const [features, setFeatures] = useState<any[]>([]);
    const [benefits, setBenefits] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        id: "",
        title: "",
        description: "", // Only for store feature
        icon: "Heart",
        sort_order: 0,
        is_active: true, // Only for store feature
        is_global: true, // Only for product benefit
        product_id: ""   // Only for product benefit
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Fetch store features
        const { data: fData } = await supabase.from('store_features').select('*').order('sort_order', { ascending: true });
        if (fData) setFeatures(fData);

        // Fetch product benefits
        const { data: bData } = await supabase.from('product_benefits').select(`*, products(name)`).order('sort_order', { ascending: true });
        if (bData) setBenefits(bData);

        // Fetch products
        const { data: pData } = await supabase.from('products').select('id, name').order('name');
        if (pData) setProducts(pData);

        setLoading(false);
    };

    const handleEdit = (item: any) => {
        setFormData({
            id: item.id,
            title: item.title,
            description: item.description || "",
            icon: item.icon || "Heart",
            sort_order: item.sort_order || 0,
            is_active: item.is_active !== false,
            is_global: item.is_global !== false,
            product_id: item.product_id || ""
        });
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setFormData({
            id: "",
            title: "",
            description: "",
            icon: "Heart",
            sort_order: activeTab === "store" ? features.length : benefits.length,
            is_active: true,
            is_global: true,
            product_id: ""
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من الحذف؟")) return;
        const table = activeTab === "store" ? 'store_features' : 'product_benefits';
        await supabase.from(table).delete().eq('id', id);
        fetchData();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const table = activeTab === "store" ? 'store_features' : 'product_benefits';

        let payload: any = {
            title: formData.title,
            icon: formData.icon,
            sort_order: formData.sort_order
        };

        if (activeTab === "store") {
            payload.description = formData.description;
            payload.is_active = formData.is_active;
        } else {
            payload.is_global = formData.is_global;
            payload.product_id = formData.is_global ? null : formData.product_id;
        }

        if (formData.id) {
            await supabase.from(table).update(payload).eq('id', formData.id);
        } else {
            await supabase.from(table).insert([payload]);
        }

        setSaving(false);
        setIsEditing(false);
        fetchData();
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold font-snaga text-primary flex items-center gap-2">
                        {activeTab === "store" ? <Sparkles /> : <Shield />}
                        {formData.id ? "تعديل" : "إضافة جديدة"}
                    </h2>
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">العنوان</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                            placeholder={activeTab === "store" ? "مثال: صنع بكل حب" : "مثال: ضمان لمدة سنتين"}
                        />
                    </div>

                    {activeTab === "store" && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                placeholder="اكتب وصفاً مختصراً للميزة..."
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-4">اختر الأيقونة</label>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {Object.keys(ICON_MAP).map((iconName) => {
                                const IconComponent = ICON_MAP[iconName];
                                const isSelected = formData.icon === iconName;
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon: iconName })}
                                        className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${isSelected
                                                ? 'bg-primary text-white shadow-md'
                                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        <IconComponent size={24} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">الترتيب الظاهري</label>
                            <input
                                type="number"
                                value={formData.sort_order}
                                onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        {activeTab === "store" ? (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">الحالة</label>
                                <div className="flex items-center gap-3 pt-3">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-5 h-5 accent-primary"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-bold text-gray-500 cursor-pointer">
                                        مفعلة وتظهر في الموقع
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">تخصيص العرض</label>
                                <select
                                    value={formData.is_global ? "global" : formData.product_id}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === "global") {
                                            setFormData({ ...formData, is_global: true, product_id: "" });
                                        } else {
                                            setFormData({ ...formData, is_global: false, product_id: val });
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="global">عرض لجميع المنتجات (عام)</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>مخصص في: {p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all flex items-center gap-2 disabled:bg-gray-300"
                        >
                            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                            حفظ التغييرات
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-primary font-snaga">البطاقات والمميزات</h1>
                    <p className="text-sm text-gray-500 mt-1">أدر محتوى البطاقات الظاهرة في الموقع أو ضمانات المنتجات</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                    <Plus size={20} /> إضافة جديد
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("store")}
                    className={`pb-4 px-2 font-bold transition-all border-b-2 ${activeTab === "store" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                    مميزات الصفحة الرئيسية
                </button>
                <button
                    onClick={() => setActiveTab("product")}
                    className={`pb-4 px-2 font-bold transition-all border-b-2 ${activeTab === "product" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                    ضمانات المنتجات
                </button>
            </div>

            {activeTab === "store" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {features.map((feature) => {
                        const Icon = ICON_MAP[feature.icon] || Heart;
                        return (
                            <div key={feature.id} className={`bg-white rounded-2xl p-6 border transition-all shadow-sm ${!feature.is_active ? 'border-dashed border-gray-300 bg-gray-50 opacity-60' : 'border-gray-100'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                                        <Icon size={28} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(feature)} className="p-2 text-gray-400 hover:text-primary"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(feature.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2 font-snaga">{feature.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {benefits.map((benefit) => {
                        const Icon = ICON_MAP[benefit.icon] || CheckCircle;
                        return (
                            <div key={benefit.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 font-snaga">{benefit.title}</h3>
                                        <div className="text-xs font-bold mt-1 text-gray-400">
                                            {benefit.is_global ? (
                                                <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">يظهر في جميع المنتجات</span>
                                            ) : (
                                                <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">مخصص لـ: {benefit.products?.name}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => handleEdit(benefit)} className="p-2 text-gray-400 hover:text-primary bg-gray-50 rounded-lg"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(benefit.id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
