-- =============================================
-- جدول حسابات المشرفين (Admin Accounts)
-- قم بتشغيل هذا الكود في Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS admin_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  username text UNIQUE NOT NULL,
  password text NOT NULL, -- يفضل تشفيرها، ولكن للتبسيط سنستخدمها كنص حالياً كما طلبتم
  role text NOT NULL DEFAULT 'user', -- 'admin' or 'user'
  created_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

-- السماح بالوصول الكامل للمشرفين (مؤقتاً للتبسيط في البيئة المحلية)
CREATE POLICY "Allow all for admin_accounts" ON admin_accounts
  FOR ALL USING (true);

-- إضافة الحساب الافتراضي
-- ملاحظة: ON CONFLICT للتأكد من عدم التكرار إذا تم تشغيل الكود مرتين
INSERT INTO admin_accounts (full_name, username, password, role)
VALUES ('المدير العام', 'admin', 'admin', 'admin')
ON CONFLICT (username) DO NOTHING;
