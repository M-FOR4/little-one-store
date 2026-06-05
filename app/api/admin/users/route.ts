import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { UserCreateSchema, UserUpdateSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/hash";
import { decrypt } from "@/lib/jwt";

// Helper: extract current user from middleware-injected header
async function getCurrentUser(request: NextRequest) {
    const userHeader = request.headers.get("x-admin-user");
    if (!userHeader) return null;
    try {
        return JSON.parse(userHeader);
    } catch {
        return null;
    }
}

// Helper: verify admin role from JWT cookie (server-side authority check)
async function requireAdmin(request: NextRequest) {
    const sessionToken = request.cookies.get("admin_session")?.value;
    if (!sessionToken) return null;
    try {
        const payload = await decrypt(sessionToken);
        if (payload.role !== "admin") return null;
        return payload;
    } catch {
        return null;
    }
}

// GET: List all admin users (admin only)
export async function GET(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (!admin) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("admin_accounts")
        .select("id, full_name, username, role, created_at")
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data });
}

// POST: Create a new admin user (admin only)
export async function POST(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (!admin) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    try {
        const body = await request.json();

        const result = UserCreateSchema.safeParse(body);
        if (!result.success) {
            const msg = result.error.issues
                .map((e: { message: string }) => e.message)
                .join(", ");
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        const { full_name, username, password, role } = result.data;

        // Hash the password before storing
        const hashedPassword = await hashPassword(password);

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("admin_accounts")
            .insert({
                full_name,
                username,
                password: hashedPassword,
                role,
            })
            .select("id, full_name, username, role, created_at")
            .single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json(
                    { error: "اسم المستخدم مستخدم مسبقاً" },
                    { status: 409 }
                );
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, user: data });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
