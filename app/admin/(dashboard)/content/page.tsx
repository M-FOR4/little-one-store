"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Save, Layout, Type, AlignLeft, Upload, Shield, Star, Heart, CheckCircle, Truck, Award, ThumbsUp, Clock, Sparkles } from "lucide-react";

// ── Constants (defined outside component to avoid re-creation) ───────────────
const ICONS_LIST = [
  { key: "Shield", label: "درع" },
  { key: "Star", label: "نجمة" },
  { key: "Truck", label: "شاحنة" },
  { key: "Heart", label: "قلب" },
  { key: "CheckCircle", label: "صح" },
  { key: "Award", label: "جائزة" },
  { key: "ThumbsUp", label: "إعجاب" },
  { key: "Clock", label: "ساعة" },
  { key: "Sparkles", label: "بريق" },
];
const ICON_MAP: Record<string, any> = { Shield, Star, Truck, Heart, CheckCircle, Award, ThumbsUp, Clock, Sparkles };

// ── ImageUploader (defined OUTSIDE the main component to prevent hook issues) ─
function ImageUploader({
  sectionKey,
  value,
  onChange,
  onUpload,
  isUploading,
}: {
  sectionKey: string;
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File, section: string) => Promise<string | null>;
  isUploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return alert("الرجاء اختيار صورة فقط");
    const url = await onUpload(file, sectionKey);
    if (url) onChange(url);
  }, [sectionKey, onChange, onUpload]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all
          ${dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-primary">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="text-sm font-medium">جاري الرفع...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Upload size={28} className={dragging ? "text-primary" : ""} />
            <span className="text-sm font-medium text-gray-500">اسحب صورة هنا أو <span className="text-primary underline">اضغط للاختيار</span></span>
            <span className="text-xs text-gray-300">PNG, JPG, WEBP</span>
          </div>
        )}
      </div>
      {value && (
        <div className="relative">
          <img src={value} alt="preview" className="h-28 w-full rounded-2xl object-cover border border-gray-100" />
          <span className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-lg backdrop-blur-sm">
            {value.startsWith("/") ? "صورة محلية" : "Supabase Storage"}
          </span>
        </div>
      )}
    </div>
  );
}

export default function ContentManagementPage() {
  const [loading, setLoading] = useState(true);
  const [contentSaving, setContentSaving] = useState(false);
  const [contentSuccess, setContentSuccess] = useState(false);

  // Homepage content
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
  const [aboutFeatures, setAboutFeatures] = useState([
    { icon: "Shield", title: "الجودة والأمان", description: "نحرص على استخدام أفضل أنواع الخشب والدهانات الآمنة تماماً للأطفال." },
    { icon: "Star", title: "تصميمات متميزة", description: "تصميمات عصرية تتناسب مع مختلف أذواق غرف الأطفال الحديثة." },
    { icon: "Truck", title: "توصيل سريع", description: "خدمة توصيل موثوقة لجميع المدن الليبية مع عناية خاصة بالمنتج." },
  ]);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      try {
        const [heroRes, bannerRes, aboutRes, aboutFeatRes] = await Promise.all([
          supabase.from("homepage_content").select("content").eq("section", "hero").maybeSingle(),
          supabase.from("homepage_content").select("content").eq("section", "banner").maybeSingle(),
          supabase.from("homepage_content").select("content").eq("section", "about").maybeSingle(),
          supabase.from("homepage_content").select("content").eq("section", "about_features").maybeSingle(),
        ]);
        if (heroRes.data?.content) setHeroContent((p) => ({ ...p, ...(heroRes.data!.content as any) }));
        if (bannerRes.data?.content) setBannerContent((p) => ({ ...p, ...(bannerRes.data!.content as any) }));
        if (aboutRes.data?.content) setAboutContent((p) => ({ ...p, ...(aboutRes.data!.content as any) }));
        if (aboutFeatRes.data?.content) setAboutFeatures((aboutFeatRes.data!.content as any).features || aboutFeatures);
      } catch (_) { /* table not created yet — use defaults */ }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSaveContent = async () => {
    setContentSaving(true);
    setContentSuccess(false);
    const supabase = createClient();
    try {
      await Promise.all([
        supabase.from("homepage_content").upsert({ section: "hero", content: heroContent }, { onConflict: "section" }),
        supabase.from("homepage_content").upsert({ section: "banner", content: bannerContent }, { onConflict: "section" }),
        supabase.from("homepage_content").upsert({ section: "about", content: aboutContent }, { onConflict: "section" }),
        supabase.from("homepage_content").upsert({ section: "about_features", content: { features: aboutFeatures } }, { onConflict: "section" }),
      ]);
      setContentSuccess(true);
      // Force Next.js to regenerate cached store pages immediately
      await fetch("/api/admin/revalidate", { method: "POST" }).catch(() => {});
      setTimeout(() => setContentSuccess(false), 3000);
    } catch (error: any) {
      alert("خطأ أثناء الحفظ: " + error.message);
    } finally {
      setContentSaving(false);
    }
  };

  const uploadImage = async (file: File, section: string): Promise<string | null> => {
    setUploadingImage(section);
    try {
      const ext = file.name.split(".").pop();
      const path = `content/${section}-${Date.now()}.${ext}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "media");
      formData.append("path", path);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Upload failed");
      }

      return json.publicUrl as string;
    } catch (err: any) {
      alert("خطأ في رفع الصورة: " + err.message);
      return null;
    } finally {
      setUploadingImage(null);
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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المحتوى</h1>
          <p className="text-sm text-gray-500 mt-1">تعديل نصوص وصور الصفحة الرئيسية وصفحة قصتنا</p>
        </div>

        <button
          onClick={handleSaveContent}
          disabled={contentSaving}
          className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-60"
        >
          <Save size={20} />
          <span>{contentSaving ? "جاري الحفظ..." : "حفظ المحتوى"}</span>
        </button>
      </div>

      {/* Success Banner */}
      {contentSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl text-sm font-medium animate-fade-in">
          ✅ تم حفظ المحتوى بنجاح! سيظهر على الموقع فوراً.
        </div>
      )}

      {/* Content Editor Form */}
      <div className="space-y-6 animate-fade-in">
        {/* Hero Section Editor */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-4">
            <Layout size={18} className="text-primary" />
            قسم الواجهة الرئيسية (Hero Section)
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">صورة ال Hero</label>
              <ImageUploader
                sectionKey="hero"
                value={heroContent.image_url}
                onChange={(url) => setHeroContent({ ...heroContent, image_url: url })}
                onUpload={uploadImage}
                isUploading={uploadingImage === "hero"}
              />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">نص زر «اقرأ قصتنا»</label>
              <input type="text" value={bannerContent.cta_text}
                onChange={(e) => setBannerContent({ ...bannerContent, cta_text: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">صورة ال Banner</label>
              <ImageUploader
                sectionKey="banner"
                value={bannerContent.image_url}
                onChange={(url) => setBannerContent({ ...bannerContent, image_url: url })}
                onUpload={uploadImage}
                isUploading={uploadingImage === "banner"}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">النص التفصيلي</label>
              <textarea rows={4} value={bannerContent.description}
                onChange={(e) => setBannerContent({ ...bannerContent, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none resize-none text-gray-800" />
            </div>
          </div>
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">صورة صفحة قصتنا</label>
              <ImageUploader
                sectionKey="about"
                value={aboutContent.image_url}
                onChange={(url) => setAboutContent({ ...aboutContent, image_url: url })}
                onUpload={uploadImage}
                isUploading={uploadingImage === "about"}
              />
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
        </div>

        {/* About Features Editor */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b pb-4">
            <Sparkles size={18} className="text-primary" />
            ميزات صفحة قصتنا (الجودة / التصميم / التوصيل)
          </h2>
          <div className="space-y-4">
            {aboutFeatures.map((feat, i) => {
              const FeatIcon = ICON_MAP[feat.icon] || Shield;
              return (
                <div key={i} className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <FeatIcon size={15} />
                    </span>
                    <span className="text-sm font-bold text-gray-700">ميزة {i + 1}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">الأيقونة</label>
                      <div className="flex flex-wrap gap-1.5">
                        {ICONS_LIST.map((ic) => {
                          const Ic = ICON_MAP[ic.key];
                          return (
                            <button
                              key={ic.key}
                              type="button"
                              title={ic.label}
                              onClick={() => {
                                const updated = [...aboutFeatures];
                                updated[i] = { ...updated[i], icon: ic.key };
                                setAboutFeatures(updated);
                              }}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                feat.icon === ic.key
                                  ? "bg-primary text-white shadow-md shadow-primary/30"
                                  : "bg-white border border-gray-200 text-gray-400 hover:border-primary hover:text-primary"
                              }`}
                            >
                              <Ic size={15} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">العنوان</label>
                      <input
                        type="text"
                        value={feat.title}
                        onChange={(e) => {
                          const updated = [...aboutFeatures];
                          updated[i] = { ...updated[i], title: e.target.value };
                          setAboutFeatures(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">الوصف</label>
                      <textarea
                        rows={2}
                        value={feat.description}
                        onChange={(e) => {
                          const updated = [...aboutFeatures];
                          updated[i] = { ...updated[i], description: e.target.value };
                          setAboutFeatures(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none resize-none text-gray-800 text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
