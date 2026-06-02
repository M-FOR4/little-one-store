-- ============================================================
-- جدول: homepage_content
-- الغرض: تخزين محتوى الصفحة الرئيسية وصفحة قصتنا بشكل ديناميكي
-- الأقسام: hero | banner | about
-- لا يمس أي جدول موجود مسبقاً
-- ============================================================

CREATE TABLE IF NOT EXISTS homepage_content (
  id          SERIAL PRIMARY KEY,
  section     TEXT NOT NULL UNIQUE,        -- 'hero' | 'banner' | 'about'
  content     JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- قيم افتراضية للأقسام الثلاثة
-- --------------------------------------------------------

INSERT INTO homepage_content (section, content)
VALUES
  (
    'hero',
    '{
      "badge": "مجموعة ٢٠٢٦",
      "title_line1": "كل طفل يستحق",
      "title_line2": "بداية هادئة.",
      "description": "أسرّة ومهود مصنوعة بعناية فائقة من خامات طبيعية آمنة، لتحتضن أجمل لحظات عامكم الأول معاً.",
      "image_url": "/images/bed1.jpg",
      "cta_primary": "تسوّقي المجموعة",
      "cta_secondary": "قصتنا"
    }'::jsonb
  ),
  (
    'banner',
    '{
      "title_line1": "أول نوم لطفلك...",
      "title_line2": "هـو أول إحساس بالأمان.",
      "description": "بدأنا Little One لنوفر للأمهات في ليبيا خيارات تجمع بين الجمال الأوروبي والمتانة المحلية. نحن ندرك أهمية تلك اللحظات الأولى، ولذا نصمم أسرّتنا لتكون الملاذ الأكثر أماناً لطفلك.",
      "image_url": "/images/bed2.jpg",
      "cta_text": "اقرأ قصتنا كاملة"
    }'::jsonb
  ),
  (
    'about',
    '{
      "heading": "عن Little One",
      "description": "في Little One، نؤمن أن نوم طفلك هو أساس راحته ونموه السليم. بدأنا رحلتنا بشغف لتوفير أسرّة أطفال تجمع بين الأناقة العصرية، الراحة الفائقة، والأمان التام.",
      "image_url": "/hero-image.jpg",
      "stat1_value": "100%",
      "stat1_label": "مواد طبيعية وآمنة",
      "stat2_value": "+500",
      "stat2_label": "عميل سعيد في ليبيا"
    }'::jsonb
  )
ON CONFLICT (section) DO NOTHING;

-- --------------------------------------------------------
-- Row Level Security
-- --------------------------------------------------------

ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;

-- قراءة عامة (الواجهة الأمامية تحتاجها)
CREATE POLICY "homepage_content_public_read"
  ON homepage_content FOR SELECT
  USING (true);

-- الكتابة للـ service_role فقط (لوحة الإدارة عبر supabase client)
-- ملاحظة: إذا كنت تستخدم anon key في الإدارة، استبدل service_role بـ authenticated
CREATE POLICY "homepage_content_admin_write"
  ON homepage_content FOR ALL
  USING (true)
  WITH CHECK (true);
