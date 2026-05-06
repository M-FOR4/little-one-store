-- Create shipping_cities table
CREATE TABLE IF NOT EXISTS shipping_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE shipping_cities ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read shipping_cities" ON shipping_cities
  FOR SELECT USING (true);

-- Allow authenticated users (admin) full access
CREATE POLICY "Allow admin full access shipping_cities" ON shipping_cities
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert Libyan cities with shipping fees
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
