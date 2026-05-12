"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Trash2, Search, Save, Package } from "lucide-react";
import Link from "next/link";

export default function NewOrderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [customer, setCustomer] = useState({
        name: "",
        phone: "",
        city: "",
        address: ""
    });

    const [cart, setCart] = useState<any[]>([]);

    useEffect(() => {
        async function fetchProducts() {
            const supabase = createClient();
            const { data } = await supabase.from('products').select('*').order('name');
            if (data) setProducts(data);
            setLoading(false);
        }
        fetchProducts();
    }, []);

    const addToCart = (product: any) => {
        const existing = cart.find(c => c.id === product.id);
        if (existing) {
            setCart(cart.map(c => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(c => c.id !== id));
    };

    const updateQuantity = (id: string, q: number) => {
        if (q <= 0) return removeFromCart(id);
        setCart(cart.map(c => c.id === id ? { ...c, quantity: q } : c));
    };

    const totalPrice = cart.reduce((acc, item) => {
        const price = item.discount_price || item.price;
        return acc + (price * item.quantity);
    }, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return alert("يرجى اختيار منتج واحد على الأقل");

        setSaving(true);
        const supabase = createClient();

        try {
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_name: customer.name,
                    phone_number: customer.phone,
                    city: customer.city,
                    address: customer.address,
                    total_amount: totalPrice,
                    status: 'pending'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_time_of_purchase: item.discount_price || item.price
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            router.push(`/admin/orders/${order.id}`);
        } catch (err: any) {
            alert("خطأ أثناء إنشاء الطلب: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <ChevronRight size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">إنشاء طلب يدوي</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Product Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Package size={20} className="text-primary" />
                            اختيار المنتجات
                        </h2>
                        <div className="relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="بحث عن منتج حسب الاسم..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2">
                            {filteredProducts.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary transition-all">
                                    <div className="flex items-center gap-3">
                                        <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-white" />
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{p.name}</p>
                                            <p className="text-xs text-primary font-bold">{p.discount_price || p.price} د.ل</p>
                                            <p className="text-[10px] text-gray-400">المتوفر: {p.stock_quantity}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => addToCart(p)}
                                        className="p-2 bg-white text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Cart & Customer Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-4">معلومات الزبون</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">اسم الزبون</label>
                                <input
                                    required
                                    type="text"
                                    value={customer.name}
                                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">رقم الهاتف</label>
                                <input
                                    required
                                    type="text"
                                    value={customer.phone}
                                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary"
                                    dir="ltr"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">المدينة</label>
                                    <input
                                        required
                                        type="text"
                                        value={customer.city}
                                        onChange={e => setCustomer({ ...customer, city: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">العنوان</label>
                                    <input
                                        required
                                        type="text"
                                        value={customer.address}
                                        onChange={e => setCustomer({ ...customer, address: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-4">مكونات الطلب</h2>
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-400">{item.quantity} × {item.discount_price || item.price} د.ل</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                            className="w-12 text-center bg-white border border-gray-200 rounded-lg text-sm font-bold p-1"
                                        />
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {cart.length === 0 && (
                                <p className="text-center py-4 text-gray-400 text-sm italic">لم يتم اختيار أي منتج</p>
                            )}

                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <div className="flex justify-between items-center text-lg font-black text-gray-800">
                                    <span>الإجمالي الكلي:</span>
                                    <span className="text-primary">{totalPrice.toLocaleString()} د.ل</span>
                                </div>
                                <button
                                    disabled={saving || cart.length === 0}
                                    onClick={handleSubmit}
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    <span>{saving ? "جاري الإنشاء..." : "اعتماد وإنشاء الطلب"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
