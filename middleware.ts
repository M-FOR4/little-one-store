import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Protect /admin routes (except login page)
    const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
    // Protect /api/admin routes (except auth login)
    const isAdminApiRoute = pathname.startsWith("/api/admin") && pathname !== "/api/admin/auth/login";

    if (!isAdminRoute && !isAdminApiRoute) {
        return NextResponse.next();
    }

    // Retrieve the session cookie
    const sessionToken = request.cookies.get("admin_session")?.value;

    if (!sessionToken) {
        if (isAdminApiRoute) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
        // Decrypt JWT to verify validity and expiration
        const parsed = await decrypt(sessionToken);

        // Add decoded user headers to pass data down the tree if ever needed
        const response = NextResponse.next();
        response.headers.set("x-admin-user", JSON.stringify(parsed));
        return response;
    } catch {
        // Token is invalid or expired
        if (isAdminApiRoute) {
            return NextResponse.json({ error: "Session expired or invalid" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/admin/login", request.url));
    }
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*"
    ],
};
