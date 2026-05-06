-- =============================================
-- جدول المدن وأسعار التوصيل
-- قم بتشغيل هذا الكود في Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS shipping_cities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  shipping_fee numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE shipping_cities ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة المدن
CREATE POLICY "Allow public read shipping_cities" ON shipping_cities
  FOR SELECT USING (true);

-- السماح للمستخدمين المسجلين (الأدمن) بالتعديل
CREATE POLICY "Allow authenticated manage shipping_cities" ON shipping_cities
  FOR ALL USING (auth.role() = 'authenticated');

-- إدخال بيانات المدن
INSERT INTO shipping_cities (name, shipping_fee) VALUES
  ('طرابلس', 10),
  ('زليتن', 10),
  ('الخمس', 10),
  ('القره بولي', 10),
  ('قصر خيار', 10),
  ('بني وليد', 20),
  ('مسلاته', 20),
  ('ترهونة', 30),
  ('بنغازي', 20),
  ('سرت', 20),
  ('البريقة', 20),
  ('إجدابيا', 20),
  ('البيضاء', 35),
  ('شحات', 35),
  ('المرج', 35),
  ('درنه', 35),
  ('القبة', 35),
  ('طبرق', 40),
  ('الكفرة', 40),
  ('جالو', 40),
  ('أوجله', 40),
  ('الزاوية', 25),
  ('صرمان', 30),
  ('صبراته', 30),
  ('العجيلات', 30),
  ('زواره', 35),
  ('الجميل', 40),
  ('زلطن', 40),
  ('رقدالين', 40),
  ('غريان', 30),
  ('الأصابعة', 30),
  ('يفرن + القلعة', 45),
  ('تيجي', 45),
  ('بدر', 45),
  ('الرياينة', 45),
  ('جادو', 45),
  ('الرجبان', 45),
  ('الزنتان', 45),
  ('كاباو', 45),
  ('ككلة', 45),
  ('نالوت', 50),
  ('سبها', 20),
  ('براك الشاطئ', 25),
  ('الجفرة', 20),
  ('زلة', 30),
  ('أوباري', 35);
