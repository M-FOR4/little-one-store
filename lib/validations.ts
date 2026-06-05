import { z } from "zod";

// ── Product validation schema ──────────────────────────────────
export const ProductSchema = z.object({
    name: z.string().min(1, "اسم المنتج مطلوب").max(200, "اسم المنتج طويل جداً"),
    description: z.string().max(5000, "الوصف طويل جداً").optional().nullable(),
    price: z.union([z.string(), z.number()]).transform((v) => {
        const n = typeof v === "string" ? parseFloat(v) : v;
        if (isNaN(n) || n < 0) throw new Error("السعر يجب أن يكون رقماً موجباً");
        return n;
    }),
    category: z.string().max(100).optional().nullable(),
    stock_status: z.string().max(50).optional().nullable(),
    stock_quantity: z.number().int().min(0).optional().nullable(),
    dimensions: z.string().max(200).optional().nullable(),
    material: z.string().max(200).optional().nullable(),
    allow_waitlist: z.boolean().optional().default(false),
    discount_price: z
        .union([z.string(), z.number(), z.null()])
        .optional()
        .transform((v) => {
            if (v === null || v === undefined || v === "") return null;
            const n = typeof v === "string" ? parseFloat(v) : v;
            if (isNaN(n as number) || (n as number) < 0) return null;
            return n as number;
        }),
    flash_sale_end: z.string().optional().nullable(),
    show_countdown: z.boolean().optional().default(false),
    is_featured: z.boolean().optional().default(false),
});

export const ImageUrlsSchema = z
    .array(z.string().url("رابط صورة غير صالح").max(2000))
    .max(20, "الحد الأقصى 20 صورة");

// ── Order validation schema ────────────────────────────────────
export const OrderSchema = z.object({
    customer_name: z.string().min(2, "الاسم مطلوب").max(200),
    phone_number: z.string().regex(/^09\d{8}$/, "رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام"),
    city_id: z.string().uuid("معرف مدينة غير صالح"),
    address: z.string().min(3, "العنوان مطلوب").max(500),
    coupon_code: z.string().max(50).optional().nullable(),
    items: z.array(z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(100),
    })).min(1, "يجب إضافة منتج واحد على الأقل"),
});

// ── User management validation ─────────────────────────────────
export const UserCreateSchema = z.object({
    full_name: z.string().min(2, "الاسم مطلوب").max(100),
    username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل").max(50)
        .regex(/^[a-zA-Z0-9_]+$/, "اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام فقط"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").max(100),
    role: z.enum(["admin", "user"]),
});

export const UserUpdateSchema = z.object({
    full_name: z.string().min(2).max(100),
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
    password: z.string().min(6).max(100).optional().or(z.literal("")),
    role: z.enum(["admin", "user"]),
});

// ── Site settings validation ───────────────────────────────────
export const SiteSettingsSchema = z.object({
    site_name: z.string().max(200).optional(),
    site_description: z.string().max(2000).optional(),
    contact_phone: z.string().max(50).optional(),
    contact_email: z.string().max(200).optional(),
    instagram_url: z.string().max(500).optional(),
    facebook_url: z.string().max(500).optional(),
    whatsapp_number: z.string().max(50).optional(),
    delivery_info: z.string().max(2000).optional(),
    enable_coupons: z.boolean().optional(),
    company_address: z.string().max(500).optional(),
    company_tax_id: z.string().max(100).optional(),
    company_phone: z.string().max(50).optional(),
    invoice_footer_note: z.string().max(2000).optional(),
});
