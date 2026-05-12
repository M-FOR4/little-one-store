"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PackagePlus, Settings, ShoppingBag, LogOut, Package, Users, MapPin, Menu, X, Sparkles, LineChart, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { SaveProgressProvider } from "@/components/admin/SaveProgressContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "الرئيسية", href: "/admin", icon: LayoutDashboard },
    { name: "التحليلات", href: "/admin/analytics", icon: LineChart },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
    { name: "المنتجات", href: "/admin/products", icon: Package },
    { name: "الكوبونات", href: "/admin/coupons", icon: Ticket },
    { name: "إضافة منتج", href: "/admin/products/new", icon: PackagePlus },
    { name: "مدن الشحن", href: "/admin/shipping", icon: MapPin },
    { name: "المميزات", href: "/admin/features", icon: Sparkles },
    { name: "قائمة الانتظار", href: "/admin/waitlist", icon: Users },
    { name: "الإعدادات", href: "/admin/settings", icon: Settings },
  ];

  useEffect(() => {
    const userJson = localStorage.getItem("admin_user");
    if (!userJson) {
      router.push("/admin/login");
    } else {
      setUser(JSON.parse(userJson));
    }
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  if (!user) return null;

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary font-snaga">Little One</h1>
          <p className="text-xs text-gray-500 mt-1">لوحة الإدارة</p>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg bg-gray-50"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
        >
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-l border-gray-200 flex-col flex-shrink-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Menu */}
          <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl animate-in slide-in-from-right">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full h-full overflow-hidden relative">
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-10 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              {navigation.find((item) => item.href === pathname)?.name || "لوحة التحكم"}
            </h2>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-gray-800">{user.full_name}</span>
              <span className="text-xs text-gray-400">{user.role === 'admin' ? 'مدير' : 'مستخدم'}</span>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
              {user.full_name[0]}
            </div>
          </div>
        </header>

        <div className="flex-1 bg-gray-50 overflow-y-auto p-4 md:p-8 scroll-smooth w-full">
          <div className="w-full max-w-full pb-24">
            <SaveProgressProvider>
              {children}
            </SaveProgressProvider>
          </div>
        </div>
      </main>
    </div>
  );
}
