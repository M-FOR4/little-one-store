import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { encrypt } from "@/lib/jwt";
import { verifyPassword } from "@/lib/hash";
import { cookies } from "next/headers";

// ── Simple rate limiter (in-memory) ──────────────────────────────
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = loginAttempts.get(ip);

    if (!record || now > record.resetAt) {
        loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }

    record.count++;
    return record.count > MAX_ATTEMPTS;
}
// ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        // Rate limiting by IP
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "تم تجاوز عدد المحاولات المسموح. يرجى المحاولة بعد 15 دقيقة." },
                { status: 429 }
            );
        }

        const body = await request.json();
        const username = typeof body.username === "string" ? body.username.trim() : "";
        const password = typeof body.password === "string" ? body.password : "";

        if (!username || !password) {
            return NextResponse.json({ error: "اسم المستخدم وكلمة المرور مطلوبان" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Fetch user by username only (password checked via bcrypt)
        const { data, error } = await supabase
            .from("admin_accounts")
            .select("id, username, full_name, role, password")
            .eq("username", username)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
        }

        // Verify password with bcrypt
        const passwordValid = await verifyPassword(password, data.password);
        if (!passwordValid) {
            return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
        }

        // Create session payload (never include password)
        const sessionData = {
            id: data.id,
            username: data.username,
            full_name: data.full_name,
            role: data.role,
            loginAt: Date.now(),
        };

        // Encrypt into a JWT (expires in 8h)
        const sessionToken = await encrypt(sessionData);

        const cookieStore = await cookies();

        cookieStore.set("admin_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 8 * 60 * 60, // 8 hours
        });

        return NextResponse.json({ success: true, user: sessionData });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        if (process.env.NODE_ENV !== "production") {
            console.error("[login]", message);
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
