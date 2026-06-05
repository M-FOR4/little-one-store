"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Save, Globe, Phone, Trash2, Edit2, Plus, X, Ticket } from "lucide-react";

interface AdminUser {
  id: string;
  full_name: string;
  username: string;
  role: string;
  created_at: string;
}

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_phone: string;
  contact_email: string;
  instagram_url: string;
  facebook_url: string;
  whatsapp_number: string;
  delivery_info: string;
  enable_coupons: boolean;
  company_address: string;
  company_tax_id: string;
  company_phone: string;
  invoice_footer_note: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("store"); // "store" | "users"
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "Little One",
    site_description: "",
    contact_phone: "",
    contact_email: "",
    instagram_url: "",
    facebook_url: "",
    whatsapp_number: "",
    delivery_info: "",
    enable_coupons: true,
    company_address: "",
    company_tax_id: "",
    company_phone: "",
    invoice_footer_note: "",
  });

  // Users management
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userFormData, setUserFormData] = useState({
    full_name: "",
    username: "",
    password: "",
    role: "user"
  });

  useEffect(() => {
    // Get current user from localStorage
    const userJson = localStorage.getItem("admin_user");
    if (userJson) setCurrentUser(JSON.parse(userJson));

    async function fetchData() {
      // Fetch site settings (public read — OK via anon key)
      const supabase = createClient();
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (settingsData) {
        setSettings((prev) => ({ ...prev, ...settingsData }));
      }

      // Fetch admin users via secure API route (#4 fix)
      try {
        const usersRes = await fetch("/api/admin/users");
        if (usersRes.ok) {
          const { users } = await usersRes.json();
          if (users) setAdminUsers(users);
        }
      } catch {
        // silently fail — user may not be admin
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  // Save settings via secure API route (#4 fix)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "خطأ أثناء الحفظ");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطأ أثناء الحفظ";
      alert("خطأ أثناء الحفظ: " + message);
    } finally {
      setSaving(false);
    }
  };

  // Create/Update user via secure API route (#4 fix)
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingUser) {
        // Update via PUT /api/admin/users/[id]
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userFormData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "خطأ أثناء التعديل");
        }
      } else {
        // Create via POST /api/admin/users
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userFormData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "خطأ أثناء الإنشاء");
        }
      }

      // Refresh user list
      const listRes = await fetch("/api/admin/users");
      if (listRes.ok) {
        const { users } = await listRes.json();
        if (users) setAdminUsers(users);
      }

      setIsUserModalOpen(false);
      setEditingUser(null);
      setUserFormData({ full_name: "", username: "", password: "", role: "user" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطأ";
      alert("خطأ: " + message);
    } finally {
      setSaving(false);
    }
  };

  // Delete user via secure API route (#4 fix)
  const handleDeleteUser = async (id: string, role: string) => {
    const adminCount = adminUsers.filter(u => u.role === 'admin').length;
    if (role === 'admin' && adminCount <= 1) {
      alert("لا يمكن حذف آخر مدير (Admin) في النظام.");
      return;
    }

    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "خطأ أثناء الحذف");
      }

      setAdminUsers(adminUsers.filter(u => u.id !== id));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطأ أثناء الحذف";
      alert(message);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tabs Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("store")}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === "store"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-gray-500 hover:bg-gray-100"
              }`}
          >
            إعدادات المتجر
          </button>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === "users"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              إدارة المستخدمين
            </button>
          )}
        </div>

        {activeTab === "store" && (
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-60"
          >
            <Save size={20} />
            <span>{saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</span>
          </button>
        )}

        {activeTab === "users" && (
          <button
            onClick={() => {
              setEditingUser(null);
              setUserFormData({ full_name: "", username: "", password: "", role: "user" });
              setIsUserModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
          >
            <Plus size={20} />
            <span>إضافة مستخدم</span>
          </button>
        )}
      </div>

      {/* Success Banner */}
      {success && activeTab === "store" && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl text-sm font-medium animate-fade-in">
          ✅ تم حفظ الإعدادات بنجاح!
        </div>
      )}

      {/* Store Settings Tab Content */}
      {activeTab === "store" && (
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* General Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-4">
              <Globe size={18} className="text-primary" />
              المعلومات العامة
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم المتجر</label>
              <input
                type="text"
                value={settings.site_name || ""}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وصف المتجر</label>
              <textarea
                rows={3}
                value={settings.site_description || ""}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none resize-none text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">معلومات التوصيل (نص يظهر في الفوتر)</label>
              <textarea
                rows={2}
                value={settings.delivery_info || ""}
                onChange={(e) => setSettings({ ...settings, delivery_info: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none resize-none text-gray-800"
              />
            </div>

            <div className="pt-4 border-t border-gray-50">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.enable_coupons}
                    onChange={(e) => setSettings({ ...settings, enable_coupons: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">تفعيل نظام الكوبونات في صفحة الدفع</span>
              </label>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-4">
              <Phone size={18} className="text-primary" />
              معلومات التواصل
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف (للاتصال)</label>
              <input
                type="text"
                value={settings.contact_phone || ""}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الواتساب (2189XXXXXXXX)</label>
              <input
                type="text"
                value={settings.whatsapp_number || ""}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رابط إنستغرام</label>
              <input
                type="text"
                value={settings.instagram_url || ""}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رابط فيسبوك</label>
              <input
                type="text"
                value={settings.facebook_url || ""}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800"
              />
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 md:col-span-2 space-y-5">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-4">
              <Ticket size={18} className="text-primary" />
              إعدادات الفاتورة المطبوعة
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الشركة (يظهر في الفاتورة)</label>
                <input
                  type="text"
                  placeholder="ليبيا - طرابلس - حي الأندلس"
                  value={settings.company_address || ""}
                  onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الرقم الضريبي / السجل التجاري</label>
                <input
                  type="text"
                  placeholder="VAT ID: 102-445-998"
                  value={settings.company_tax_id || ""}
                  onChange={(e) => setSettings({ ...settings, company_tax_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف (يظهر في الفاتورة)</label>
                <input
                  type="text"
                  placeholder="+218 91 000 0000"
                  value={settings.company_phone || ""}
                  onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الملاحظة السفلية (Invoice Footer Note)</label>
              <textarea
                rows={3}
                value={settings.invoice_footer_note || ""}
                onChange={(e) => setSettings({ ...settings, invoice_footer_note: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none resize-none text-gray-800"
                placeholder="شروط الاستبدال، عبارات شكر، الخ..."
              />
            </div>
          </div>
        </form>
      )}

      {/* Users Tab Content */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-right whitespace-nowrap min-w-[700px] lg:whitespace-normal lg:min-w-0">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-sm border-b">
                  <th className="px-6 py-4 font-medium">المستخدم</th>
                  <th className="px-6 py-4 font-medium">اسم المستخدم</th>
                  <th className="px-6 py-4 font-medium">الصلاحية</th>
                  <th className="px-6 py-4 font-medium text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {adminUsers.map((user) => (
                  <tr key={user.id} className="text-gray-700 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-800">{user.full_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{user.username}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                        {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setUserFormData({
                              full_name: user.full_name,
                              username: user.username,
                              role: user.role,
                              password: "" // Don't load password
                            });
                            setIsUserModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.role)}
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
      )}

      {/* User Add/Edit Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {editingUser ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input
                  required
                  type="text"
                  value={userFormData.full_name}
                  onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                <input
                  required
                  type="text"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? "كلمة المرور (اتركها فارغة لعدم التغيير)" : "كلمة المرور"}
                </label>
                <input
                  required={!editingUser}
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصلاحية</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none bg-white"
                >
                  <option value="user">مستخدم عادي</option>
                  <option value="admin">مدير (Admin)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all"
              >
                {saving ? "جاري الحفظ..." : "حفظ البيانات"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
