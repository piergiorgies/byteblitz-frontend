import * as jose from 'jose';

interface ExtendedJWTPayload extends jose.JWTPayload {
    user_permissions: number;
}

export async function extractJWTPayload(
    token: string | undefined,
): Promise<ExtendedJWTPayload | null> {
    if (!token) return null;

    try {
        const publicKeyPEM = process.env.NEXT_PUBLIC_JWT_PUBLIC_KEY;
        const algorithm = process.env.NEXT_PUBLIC_JWT_ALGORITHM;
        if (!publicKeyPEM || !algorithm) {
            throw new Error(
                'Public key is not set in the environment variables.',
            );
        }

        const key = await jose.importSPKI(publicKeyPEM, algorithm);
        const { payload } = await jose.jwtVerify(token, key, {
            algorithms: [algorithm],
        });
        return payload as ExtendedJWTPayload;
    } catch {
        return null;
    }
}
