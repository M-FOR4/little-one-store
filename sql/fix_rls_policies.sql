-- =============================================
-- سياسات RLS للسماح بقراءة المنتجات للجميع
-- قم بتشغيل هذا الكود في Supabase SQL Editor
-- =============================================

-- ===== جدول products =====
-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Allow public read products" ON products;
DROP POLICY IF EXISTS "Allow all for products" ON products;

-- تفعيل RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة للجميع (الزبائن + الأدمن)
CREATE POLICY "Allow public read products" ON products
  FOR SELECT USING (true);

-- ===== جدول product_images =====
DROP POLICY IF EXISTS "Allow public read product_images" ON product_images;
DROP POLICY IF EXISTS "Allow all for product_images" ON product_images;

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read product_images" ON product_images
  FOR SELECT USING (true);

-- ===== جدول categories =====
DROP POLICY IF EXISTS "Allow public read categories" ON categories;
DROP POLICY IF EXISTS "Allow all for categories" ON categories;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read categories" ON categories
  FOR SELECT USING (true);

-- ===== جدول site_settings =====
DROP POLICY IF EXISTS "Allow public read site_settings" ON site_settings;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read site_settings" ON site_settings
  FOR SELECT USING (true);
