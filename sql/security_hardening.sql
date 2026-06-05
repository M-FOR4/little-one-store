-- ============================================================
-- 🔒 سكربت التقوية الأمنية الشامل — Little One Website
-- ============================================================
-- ⚠️ تشغيل هذا السكربت في Supabase SQL Editor
-- يعالج الثغرات: #3, #5 من تقرير الفحص الأمني
-- ============================================================

-- ╔══════════════════════════════════════════════════════════════╗
-- ║ 1. إغلاق RLS لجدول admin_accounts (#3)                     ║
-- ║    منع أي وصول عبر anon_key — الوصول فقط عبر service_role  ║
-- ╚══════════════════════════════════════════════════════════════╝

-- حذف السياسة المفتوحة القديمة (محمية بـ IF EXISTS لتجنب الأخطاء إذا كانت محذوفة بالفعل)
DROP POLICY IF EXISTS "Allow all for admin_accounts" ON admin_accounts;

-- التأكد من تفعيل RLS
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

-- سياسة منع كل الوصول العام (service_role يتجاوز RLS تلقائياً)
CREATE POLICY "Deny all public access to admin_accounts" ON admin_accounts
  FOR ALL USING (false);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║ 2. تقييد سياسات Storage (#5)                               ║
-- ║    القراءة للجميع، الكتابة/الحذف عبر service_role فقط      ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── باكت media ──
DROP POLICY IF EXISTS "Allow public uploads to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from media" ON storage.objects;

-- القراءة العامة تبقى كما هي (لعرض الصور)
-- DROP POLICY IF EXISTS "Allow public read access to media" ON storage.objects;
-- CREATE POLICY "Allow public read access to media" ON storage.objects
--   FOR SELECT USING (bucket_id = 'media');

-- ← لا حاجة لإنشاء سياسات INSERT/UPDATE/DELETE
-- ← الرفع يتم عبر API route باستخدام service_role_key
-- ← service_role يتجاوز RLS

-- ── باكت products ──
DROP POLICY IF EXISTS "Allow public uploads to products" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to products" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from products" ON storage.objects;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║ 3. حماية جدول الطلبات (orders)                             ║
-- ║    السماح بالإنشاء فقط، منع القراءة/التعديل/الحذف العام   ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ملاحظة: إذا كانت الطلبات تُنشأ الآن عبر API route (service_role)
-- يمكن إغلاق RLS بالكامل مثل admin_accounts
DROP POLICY IF EXISTS "Allow all for orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert orders" ON orders;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- منع كل الوصول العام — الطلبات تُنشأ وتُقرأ عبر service_role من API
CREATE POLICY "Deny all public access to orders" ON orders
  FOR ALL USING (false);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║ 4. حماية جدول order_items                                  ║
-- ╚══════════════════════════════════════════════════════════════╝

DROP POLICY IF EXISTS "Allow all for order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public insert order_items" ON order_items;

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all public access to order_items" ON order_items
  FOR ALL USING (false);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║ 5. حماية جدول الكوبونات (coupons)                          ║
-- ╚══════════════════════════════════════════════════════════════╝

DROP POLICY IF EXISTS "Allow all for coupons" ON coupons;

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- منع الكل — التحقق من الكوبونات يتم عبر API route
CREATE POLICY "Deny all public access to coupons" ON coupons
  FOR ALL USING (false);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║ 6. التأكد من أن site_settings قراءة فقط للعامة             ║
-- ╚══════════════════════════════════════════════════════════════╝

-- site_settings: القراءة مسموحة (تُستخدم في الواجهة)، الكتابة عبر API
DROP POLICY IF EXISTS "Allow all for site_settings" ON site_settings;

-- التحقق أن سياسة القراءة موجودة (من fix_rls_policies.sql)
-- إذا لم تكن موجودة:
-- CREATE POLICY "Allow public read site_settings" ON site_settings
--   FOR SELECT USING (true);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║ ✅ ملخص التغييرات                                          ║
-- ╠══════════════════════════════════════════════════════════════╣
-- ║ admin_accounts → منع كامل (service_role فقط)               ║
-- ║ orders         → منع كامل (service_role فقط)               ║
-- ║ order_items    → منع كامل (service_role فقط)               ║
-- ║ coupons        → منع كامل (service_role فقط)               ║
-- ║ storage media  → قراءة عامة، كتابة service_role فقط        ║
-- ║ storage products → قراءة عامة، كتابة service_role فقط      ║
-- ║ products       → قراءة عامة (بدون تغيير)                   ║
-- ║ site_settings  → قراءة عامة (بدون تغيير)                   ║
-- ╚══════════════════════════════════════════════════════════════╝
