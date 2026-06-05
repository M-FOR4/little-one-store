import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    throw new Error("❌ JWT_SECRET environment variable is required. Add it to .env.local");
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Record<string, unknown>) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h") // 8 hours for admin session
        .sign(key);
}

export async function decrypt(input: string): Promise<Record<string, unknown>> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    });
    return payload;
}
