-- ============================================================
-- سياسات RLS لـ Supabase Storage (جداول storage.objects)
-- قم بتشغيل هذا الكود في Supabase SQL Editor لحل مشكلة RLS عند رفع الصور
-- ============================================================

-- 1. التأكد من إنشاء الباكت (media) وجعله عاماً (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

-- 2. التأكد من إنشاء الباكت (products) وجعله عاماً (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('products', 'products', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

-- ============================================================
-- سياسات باكت media
-- ============================================================

-- حذف السياسات القديمة إن وجدت لتجنب الأخطاء
DROP POLICY IF EXISTS "Allow public read access to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from media" ON storage.objects;

-- سياسة SELECT (القراءة العامة)
CREATE POLICY "Allow public read access to media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- سياسة INSERT (رفع صور جديدة)
CREATE POLICY "Allow public uploads to media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media');

-- سياسة UPDATE (تعديل صور)
CREATE POLICY "Allow public updates to media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

-- سياسة DELETE (حذف صور)
CREATE POLICY "Allow public deletes from media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media');


-- ============================================================
-- سياسات باكت products
-- ============================================================

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Allow public read access to products" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to products" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to products" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from products" ON storage.objects;

-- سياسة SELECT
CREATE POLICY "Allow public read access to products" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

-- سياسة INSERT
CREATE POLICY "Allow public uploads to products" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products');

-- سياسة UPDATE
CREATE POLICY "Allow public updates to products" ON storage.objects
  FOR UPDATE USING (bucket_id = 'products') WITH CHECK (bucket_id = 'products');

-- سياسة DELETE
CREATE POLICY "Allow public deletes from products" ON storage.objects
  FOR DELETE USING (bucket_id = 'products');
