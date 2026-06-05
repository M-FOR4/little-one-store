"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PackagePlus, Settings, ShoppingBag, LogOut, Package, Users, MapPin, Menu, X, Sparkles, LineChart, Ticket, Layout } from "lucide-react";
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
  const [activeAdmins, setActiveAdmins] = useState<{ id: string; user: string; isMe: boolean }[]>([]);

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
    { name: "إدارة المحتوى", href: "/admin/content", icon: Layout },
    { name: "الإعدادات", href: "/admin/settings", icon: Settings },
  ];

  useEffect(() => {
    const checkSession = () => {
      const userJson = localStorage.getItem("admin_user");
      if (!userJson) {
        router.push("/admin/login");
        return null;
      }

      const userData = JSON.parse(userJson);
      const sessionAge = Date.now() - (userData.loginAt || 0);
      const THIRTY_MINUTES = 15 * 60 * 1000;

      if (sessionAge > THIRTY_MINUTES) {
        localStorage.removeItem("admin_user");
        router.push("/admin/login");
        return null;
      }
      return userData;
    };

    const validUser = checkSession();
    if (validUser) {
      setUser(validUser);
    }

    // Check periodically every minute
    const intervalId = setInterval(() => {
      checkSession();
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    const sessionId = Math.random().toString(36).substring(2, 9);
    const username = user.full_name || "Admin";

    const room = supabase.channel("admin-presence", {
      config: {
        presence: {
          key: username,
        },
      },
    });

    room
      .on("presence", { event: "sync" }, () => {
        const state = room.presenceState<any>();
        const activeList: { id: string; user: string; isMe: boolean }[] = [];

        Object.keys(state).forEach((userKey) => {
          activeList.push({
            id: userKey,
            user: userKey,
            isMe: userKey === username,
          });
        });

        activeList.sort((a, b) => {
          if (a.isMe) return -1;
          if (b.isMe) return 1;
          return a.user.localeCompare(b.user);
        });

        setActiveAdmins(activeList);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await room.track({
            sessionId: sessionId,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(room);
    };
  }, [user]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
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
            {/* Active admins indicator */}
            {activeAdmins.length > 0 && (
              <div className="flex items-center gap-2 border-l border-gray-200 pl-3 md:pl-4 mr-2">
                {/* Active admin names display inline on desktop */}
                <div className="hidden lg:flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <Users size={14} />
                    المتصلون الآن:
                  </span>
                  {activeAdmins.slice(0, 3).map((admin) => (
                    <span
                      key={admin.id}
                      className={`text-xs px-2.5 py-1 rounded-full border font-semibold flex items-center gap-1.5 shadow-sm transition-all ${admin.isMe
                        ? "bg-amber-50 text-amber-700 border-amber-200/60"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${admin.isMe ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                      {admin.user}
                      {admin.isMe && " (أنت)"}
                    </span>
                  ))}
                  {activeAdmins.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-bold">
                      +{activeAdmins.length - 3}
                    </span>
                  )}
                </div>

                {/* Stacked mini-avatars or a small online badge for mobile/tablet */}
                <div className="flex items-center -space-x-1.5 lg:hidden">
                  {activeAdmins.slice(0, 3).map((admin) => (
                    <div
                      key={admin.id}
                      title={admin.isMe ? `${admin.user} (أنت)` : admin.user}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shrink-0 ${admin.isMe
                        ? "bg-gradient-to-tr from-amber-500 to-yellow-400"
                        : "bg-gradient-to-tr from-emerald-500 to-teal-400"
                        }`}
                    >
                      {admin.user.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {activeAdmins.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 ring-2 ring-white">
                      +{activeAdmins.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}

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
