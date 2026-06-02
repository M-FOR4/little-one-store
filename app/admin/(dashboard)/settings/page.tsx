"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Save, Globe, Phone, Mail, Link2, Users, Key, Trash2, Edit2, Plus, X, Ticket, Layout, Image, Type, AlignLeft } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("store"); // "store" | "users" | "content"
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [settings, setSettings] = useState({
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
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    full_name: "",
    username: "",
    password: "",
    role: "user"
  });

  // Homepage content
  const [contentSaving, setContentSaving] = useState(false);
  const [contentSuccess, setContentSuccess] = useState(false);
  const [heroContent, setHeroContent] = useState({
    badge: "مجموعة ٢٠٢٦",
    title_line1: "كل طفل يستحق",
    title_line2: "بداية هادئة.",
    description: "أسرّة ومهود مصنوعة بعناية فائقة من خامات طبيعية آمنة، لتحتضن أجمل لحظات عامكم الأول معاً.",
    image_url: "/images/bed1.jpg",
    cta_primary: "تسوّقي المجموعة",
    cta_secondary: "قصتنا",
  });
  const [bannerContent, setBannerContent] = useState({
    title_line1: "أول نوم لطفلك...",
    title_line2: "هـو أول إحساس بالأمان.",
    description: "بدأنا Little One لنوفر للأمهات في ليبيا خيارات تجمع بين الجمال الأوروبي والمتانة المحلية. نحن ندرك أهمية تلك اللحظات الأولى، ولذا نصمم أسرّتنا لتكون الملاذ الأكثر أماناً لطفلك.",
    image_url: "/images/bed2.jpg",
    cta_text: "اقرأ قصتنا كاملة",
  });
  const [aboutContent, setAboutContent] = useState({
    heading: "عن Little One",
    description: "في Little One، نؤمن أن نوم طفلك هو أساس راحته ونموه السليم. بدأنا رحلتنا بشغف لتوفير أسرّة أطفال تجمع بين الأناقة العصرية، الراحة الفائقة، والأمان التام.",
    image_url: "/hero-image.jpg",
    stat1_value: "100%",
    stat1_label: "مواد طبيعية وآمنة",
    stat2_value: "+500",
    stat2_label: "عميل سعيد في ليبيا",
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

      if (usersData) setAdminUsers(usersData);

      // Fetch homepage content sections in parallel
      const [heroRes, bannerRes, aboutRes] = await Promise.all([
        supabase.from("homepage_content").select("content").eq("section", "hero").maybeSingle(),
        supabase.from("homepage_content").select("content").eq("section", "banner").maybeSingle(),
        supabase.from("homepage_content").select("content").eq("section", "about").maybeSingle(),
      ]);

      if (heroRes.data?.content) setHeroContent((p) => ({ ...p, ...heroRes.data.content }));
      if (bannerRes.data?.content) setBannerContent((p) => ({ ...p, ...bannerRes.data.content }));
      if (aboutRes.data?.content) setAboutContent((p) => ({ ...p, ...aboutRes.data.content }));

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

  const handleSaveContent = async () => {
    setContentSaving(true);
    setContentSuccess(false);
    const supabase = createClient();
    try {
      await Promise.all([
        supabase.from("homepage_content").upsert({ section: "hero", content: heroContent }, { onConflict: "section" }),
        supabase.from("homepage_content").upsert({ section: "banner", content: bannerContent }, { onConflict: "section" }),
        supabase.from("homepage_content").upsert({ section: "about", content: aboutContent }, { onConflict: "section" }),
      ]);
      setContentSuccess(true);
      setTimeout(() => setContentSuccess(false), 3000);
    } catch (error: any) {
      alert("خطأ أثناء الحفظ: " + error.message);
    } finally {
      setContentSaving(false);
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
          <button
            onClick={() => setActiveTab("content")}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === "content"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-gray-500 hover:bg-gray-100"
              }`}
          >
            تعديل المحتوى
          </button>
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

        {activeTab === "content" && (
          <button
            onClick={handleSaveContent}
            disabled={contentSaving}
            className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-60"
          >
            <Save size={20} />
            <span>{contentSaving ? "جاري الحفظ..." : "حفظ المحتوى"}</span>
          </button>
        )}
      </div>

      {/* Success Banner */}
      {success && activeTab === "store" && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl text-sm font-medium animate-fade-in">
          ✅ تم حفظ الإعدادات بنجاح!
        </div>
      )}
      {contentSuccess && activeTab === "content" && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl text-sm font-medium animate-fade-in">
          ✅ تم حفظ المحتوى بنجاح! سيظهر على الموقع فوراً.
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

      {/* ===================== Content Tab ===================== */}
      {activeTab === "content" && (
        <div className="space-y-6 animate-fade-in">

          {/* Hero Section Editor */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-4">
              <Layout size={18} className="text-primary" />
              Hero Section — الصفحة الرئيسية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الشارة الصغيرة (Badge)</label>
                <input type="text" value={heroContent.badge}
                  onChange={(e) => setHeroContent({ ...heroContent, badge: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السطر الأول من العنوان</label>
                <input type="text" value={heroContent.title_line1}
                  onChange={(e) => setHeroContent({ ...heroContent, title_line1: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السطر الثاني (بالألوان)</label>
                <input type="text" value={heroContent.title_line2}
                  onChange={(e) => setHeroContent({ ...heroContent, title_line2: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة (Image URL)</label>
                <input type="text" dir="ltr" value={heroContent.image_url}
                  onChange={(e) => setHeroContent({ ...heroContent, image_url: e.target.value })}
                  placeholder="/images/bed1.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">النص الوصفي</label>
                <textarea rows={3} value={heroContent.description}
                  onChange={(e) => setHeroContent({ ...heroContent, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none resize-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نص الزر الرئيسي</label>
                <input type="text" value={heroContent.cta_primary}
                  onChange={(e) => setHeroContent({ ...heroContent, cta_primary: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نص الرابط الثانوي</label>
                <input type="text" value={heroContent.cta_secondary}
                  onChange={(e) => setHeroContent({ ...heroContent, cta_secondary: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
            </div>
            {/* Live preview of image */}
            {heroContent.image_url && (
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-2">معاينة الصورة:</p>
                <img src={heroContent.image_url} alt="preview" className="h-32 rounded-2xl object-cover border border-gray-100" />
              </div>
            )}
          </div>

          {/* Banner Section Editor */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-4">
              <AlignLeft size={18} className="text-primary" />
              قسم «أول إحساس بالأمان» — Banner
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السطر الأول من العنوان</label>
                <input type="text" value={bannerContent.title_line1}
                  onChange={(e) => setBannerContent({ ...bannerContent, title_line1: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السطر الثاني من العنوان</label>
                <input type="text" value={bannerContent.title_line2}
                  onChange={(e) => setBannerContent({ ...bannerContent, title_line2: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة (Image URL)</label>
                <input type="text" dir="ltr" value={bannerContent.image_url}
                  onChange={(e) => setBannerContent({ ...bannerContent, image_url: e.target.value })}
                  placeholder="/images/bed2.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نص زر «اقرأ قصتنا»</label>
                <input type="text" value={bannerContent.cta_text}
                  onChange={(e) => setBannerContent({ ...bannerContent, cta_text: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">النص التفصيلي</label>
                <textarea rows={4} value={bannerContent.description}
                  onChange={(e) => setBannerContent({ ...bannerContent, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none resize-none text-gray-800" />
              </div>
            </div>
            {bannerContent.image_url && (
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-2">معاينة الصورة:</p>
                <img src={bannerContent.image_url} alt="preview" className="h-32 rounded-2xl object-cover border border-gray-100" />
              </div>
            )}
          </div>

          {/* About Section Editor */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-4">
              <Type size={18} className="text-primary" />
              صفحة قصتنا (About)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الصفحة</label>
                <input type="text" value={aboutContent.heading}
                  onChange={(e) => setAboutContent({ ...aboutContent, heading: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة (Image URL)</label>
                <input type="text" dir="ltr" value={aboutContent.image_url}
                  onChange={(e) => setAboutContent({ ...aboutContent, image_url: e.target.value })}
                  placeholder="/hero-image.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">النص التعريفي</label>
                <textarea rows={4} value={aboutContent.description}
                  onChange={(e) => setAboutContent({ ...aboutContent, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none resize-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الإحصائية الأولى — القيمة</label>
                <input type="text" value={aboutContent.stat1_value}
                  onChange={(e) => setAboutContent({ ...aboutContent, stat1_value: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الإحصائية الأولى — التسمية</label>
                <input type="text" value={aboutContent.stat1_label}
                  onChange={(e) => setAboutContent({ ...aboutContent, stat1_label: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الإحصائية الثانية — القيمة</label>
                <input type="text" value={aboutContent.stat2_value}
                  onChange={(e) => setAboutContent({ ...aboutContent, stat2_value: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الإحصائية الثانية — التسمية</label>
                <input type="text" value={aboutContent.stat2_label}
                  onChange={(e) => setAboutContent({ ...aboutContent, stat2_label: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
              </div>
            </div>
            {aboutContent.image_url && (
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-2">معاينة الصورة:</p>
                <img src={aboutContent.image_url} alt="preview" className="h-32 rounded-2xl object-cover border border-gray-100" />
              </div>
            )}
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
