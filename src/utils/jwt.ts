import * as jose from 'jose';

interface ExtendedJWTPayload extends jose.JWTPayload {
    user_permissions: number;
}

export async function extractJWTPayload(
    token: string | undefined,
): Promise<ExtendedJWTPayload | null> {
    if (!token) return null;

    try {
        let key = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, key);
        return payload as ExtendedJWTPayload;
    } catch (error) {
        return null;
    }
}
