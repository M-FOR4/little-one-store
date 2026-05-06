"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import {
  Search, Filter, ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBasket,
  Truck,
  ShieldCheck,
  ChevronLeft,
  Check
} from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Get search params from the Navbar search query
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/products?categories=true');
        const data = await res.json();

        if (res.ok) {
          setProducts(data.products || []);
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0; // newest is already the default from the DB fetch
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <section className="bg-white border-b border-gray-100 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground font-snaga mb-6 animate-fade-in-up">المجموعة الكاملة</h1>
            <p className="text-lg text-gray-500 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              تصفحي تشكيلتنا الواسعة من أسرّة الأطفال المصنوعة يدوياً. كل قطعة صُممت لتجمع بين الشكل الجمالي والأمان المطلق.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          {/* Categories Scrollable */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${selectedCategory === "all"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${selectedCategory === cat.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sorting */}
          <div className="relative w-full md:w-64">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pr-4 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all text-sm font-bold text-gray-600 appearance-none cursor-pointer"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="bg-gray-200 aspect-[3/4] rounded-[3rem]" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map((product) => (
              <div key={product.id} className="animate-fade-in-up">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image_url={product.image_url}
                  discount_price={product.discount_price}
                  stock_status={product.stock_status}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-gray-200">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-gray-200" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 font-snaga">لم نجد أي منتجات تطابق بحثك</h3>
            <button
              onClick={() => { setSelectedCategory("all"); setSearchQuery(""); window.history.pushState({}, '', '/products'); }}
              className="mt-6 text-primary font-bold hover:text-primary-dark transition-colors border-b-2 border-primary"
            >
              إعادة تعيين المرشحات
            </button>
          </div>
        )}
      </section>

      {/* Floating Cart (Mobile Only) */}
      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Link href="/cart" className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 transition-transform active:scale-95">
          <ShoppingBag size={20} />
          <span>عرض السلة</span>
        </Link>
      </div>
    </div>
  );
}
