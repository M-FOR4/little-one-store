import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { UserUpdateSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/hash";
import { decrypt } from "@/lib/jwt";

// Helper: verify admin role from JWT cookie
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

// PUT: Update a user (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin(request);
    if (!admin) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await request.json();

        const result = UserUpdateSchema.safeParse(body);
        if (!result.success) {
            const msg = result.error.issues
                .map((e: { message: string }) => e.message)
                .join(", ");
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        const { full_name, username, password, role } = result.data;

        const updateData: Record<string, unknown> = {
            full_name,
            username,
            role,
        };

        // Only hash and update password if provided
        if (password && password.length > 0) {
            updateData.password = await hashPassword(password);
        }

        const supabase = createAdminClient();

        const { error } = await supabase
            .from("admin_accounts")
            .update(updateData)
            .eq("id", id);

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json(
                    { error: "اسم المستخدم مستخدم مسبقاً" },
                    { status: 409 }
                );
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// DELETE: Delete a user (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin(request);
    if (!admin) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    try {
        const { id } = await params;
        const supabase = createAdminClient();

        // Check if this is the last admin
        const { data: admins } = await supabase
            .from("admin_accounts")
            .select("id, role")
            .eq("role", "admin");

        const targetUser = admins?.find((u: { id: string }) => u.id === id);
        if (
            targetUser &&
            targetUser.role === "admin" &&
            admins &&
            admins.filter((u: { role: string }) => u.role === "admin").length <= 1
        ) {
            return NextResponse.json(
                { error: "لا يمكن حذف آخر مدير (Admin) في النظام" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("admin_accounts")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
