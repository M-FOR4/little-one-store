"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Save, Globe, Phone, Mail, Link2, Users, Key, Trash2, Edit2, Plus, X } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("store"); // "store" or "users"
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Store settings
  const [settings, setSettings] = useState({
    site_name: "Little One",
    site_description: "",
    contact_phone: "",
    contact_email: "",
    instagram_url: "",
    facebook_url: "",
    whatsapp_number: "",
    delivery_info: "",
  });

  // Users management
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
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
      const supabase = createClient();

      // Fetch site settings
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (settingsData) {
        setSettings((prev) => ({ ...prev, ...settingsData }));
      }

      // Fetch admin users
      const { data: usersData } = await supabase
        .from("admin_accounts")
        .select("*")
        .order("created_at", { ascending: true });

      if (usersData) {
        setAdminUsers(usersData);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ id: 1, ...settings });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      alert("خطأ أثناء الحفظ: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    try {
      if (editingUser) {
        // Update
        const updateData: any = {
          full_name: userFormData.full_name,
          username: userFormData.username,
          role: userFormData.role,
        };
        if (userFormData.password) updateData.password = userFormData.password;

        const { error } = await supabase
          .from("admin_accounts")
          .update(updateData)
          .eq("id", editingUser.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from("admin_accounts")
          .insert([userFormData]);

        if (error) throw error;
      }

      // Refresh list
      const { data } = await supabase.from("admin_accounts").select("*").order("created_at");
      if (data) setAdminUsers(data);

      setIsUserModalOpen(false);
      setEditingUser(null);
      setUserFormData({ full_name: "", username: "", password: "", role: "user" });
    } catch (error: any) {
      alert("خطأ: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, role: string) => {
    const adminCount = adminUsers.filter(u => u.role === 'admin').length;
    if (role === 'admin' && adminCount <= 1) {
      alert("لا يمكن حذف آخر مدير (Admin) في النظام.");
      return;
    }

    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    const supabase = createClient();
    const { error } = await supabase.from("admin_accounts").delete().eq("id", id);
    if (!error) {
      setAdminUsers(adminUsers.filter(u => u.id !== id));
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
        </form>
      )}

      {/* Users Tab Content */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <table className="w-full text-right">
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
                  type="text" // Change to text as per user request to be able to see it? or keep as password? User said "زر تعديل كلمة السر" so I'll keep it as input.
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
