"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PackagePlus, Settings, ShoppingBag, LogOut, Package, Users, MapPin } from "lucide-react";
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

  const navigation = [
    { name: "الرئيسية", href: "/admin", icon: LayoutDashboard },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
    { name: "المنتجات", href: "/admin/products", icon: Package },
    { name: "إضافة منتج", href: "/admin/products/new", icon: PackagePlus },
    { name: "مدن الشحن", href: "/admin/shipping", icon: MapPin },
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary font-snaga">Little One</h1>
          <p className="text-xs text-gray-500 mt-1">لوحة الإدارة</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            // Only show user management for admins
            if (item.href === "/admin/settings" && user.role !== 'admin') {
              // actually settings has store settings too, so we keep it. 
              // User management is a tab inside settings.
            }
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? "bg-primary text-white"
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {navigation.find((item) => item.href === pathname)?.name || "لوحة التحكم"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-gray-800">{user.full_name}</span>
              <span className="text-xs text-gray-400">{user.role === 'admin' ? 'مدير' : 'مستخدم'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user.full_name[0]}
            </div>
          </div>
        </header>

        <div className="p-8">
          <SaveProgressProvider>
            {children}
          </SaveProgressProvider>
        </div>
      </main>
    </div>
  );
}
