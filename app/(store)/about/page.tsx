"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Shield, Star, Truck, Heart, CheckCircle, Award, ThumbsUp, Clock, Sparkles } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Shield, Star, Truck, Heart, CheckCircle, Award, ThumbsUp, Clock, Sparkles,
};

const DEFAULT_ABOUT = {
  heading: "عن Little One",
  description:
    "في Little One، نؤمن أن نوم طفلك هو أساس راحته ونموه السليم. بدأنا رحلتنا بشغف لتوفير أسرّة أطفال تجمع بين الأناقة العصرية، الراحة الفائقة، والأمان التام.",
  image_url: "/hero-image.jpg",
  stat1_value: "100%",
  stat1_label: "مواد طبيعية وآمنة",
  stat2_value: "+500",
  stat2_label: "عميل سعيد في ليبيا",
};

const DEFAULT_FEATURES = [
  { icon: "Shield", title: "الجودة والأمان", description: "نحرص على استخدام أفضل أنواع الخشب والدهانات الآمنة تماماً للأطفال." },
  { icon: "Star", title: "تصميمات متميزة", description: "تصميمات عصرية تتناسب مع مختلف أذواق غرف الأطفال الحديثة." },
  { icon: "Truck", title: "توصيل سريع", description: "خدمة توصيل موثوقة لجميع المدن الليبية مع عناية خاصة بالمنتج." },
];

export default function AboutPage() {
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  useEffect(() => {
    async function fetchAbout() {
      try {
        const supabase = createClient();
        const [aboutRes, featuresRes] = await Promise.all([
          supabase.from("homepage_content").select("content").eq("section", "about").maybeSingle(),
          supabase.from("homepage_content").select("content").eq("section", "about_features").maybeSingle(),
        ]);
        if (aboutRes.data?.content) {
          setAbout((prev) => ({ ...prev, ...(aboutRes.data!.content as any) }));
        }
        if (featuresRes.data?.content) {
          const loaded = (featuresRes.data!.content as any).features;
          if (Array.isArray(loaded) && loaded.length > 0) setFeatures(loaded);
        }
      } catch (e) {
        // Fallback to defaults silently
      }
    }
    fetchAbout();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-fade-in-up">
          <h1 className="text-5xl font-bold text-[#333] leading-tight">
            {about.heading.includes("Little One")
              ? <>
                  {about.heading.replace("Little One", "").trim()}{" "}
                  <span className="text-[#537D84]">Little One</span>
                </>
              : about.heading
            }
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">{about.description}</p>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <span className="text-4xl font-bold text-[#537D84]">{about.stat1_value}</span>
              <p className="text-sm text-gray-400 font-bold">{about.stat1_label}</p>
            </div>
            <div className="space-y-2">
              <span className="text-4xl font-bold text-[#537D84]">{about.stat2_value}</span>
              <p className="text-sm text-gray-400 font-bold">{about.stat2_label}</p>
            </div>
          </div>
        </div>
        <div className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl">
          <img
            src={about.image_url}
            alt="About Little One"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="bg-[#f3efe9] rounded-[4rem] p-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {features.map((feat, i) => {
          const Icon = ICON_MAP[feat.icon] || Shield;
          return (
            <div key={i} className="space-y-4 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-[#537D84] shadow-sm">
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#333]">{feat.title}</h3>
              <p className="text-gray-500 text-sm">{feat.description}</p>
            </div>
          );
        })}
      </div>

      <div className="text-center space-y-8 py-20">
        <h2 className="text-3xl font-bold text-[#333]">نحن هنا لخدمتكم دائماً</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          فريق عملنا مستعد للإجابة على جميع استفساراتكم ومساعدتكم في اختيار الأفضل لأطفالكم.
        </p>
        <div className="flex justify-center gap-4">
          <a href="https://wa.me/2189XXXXXXX" className="bg-[#537D84] text-white px-10 py-4 rounded-full font-bold hover:bg-[#45676d] transition-all">تواصل معنا الآن</a>
        </div>
      </div>
    </div>
  );
}
