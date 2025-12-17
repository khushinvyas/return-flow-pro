import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

const SECRET_KEY = process.env.JWT_SECRET || 'dev-secret-key-change-me';
// ... (rest of file until getSession)

import { cache } from 'react';

export const getSession = cache(async function () {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;

    const payload = await decrypt(session);
    if (!payload?.userId) return null;

    // Verify Token Version against DB
    try {
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as number },
            select: { tokenVersion: true }
        });

        // Default to 0 if payload has no version (legacy sessions)
        const payloadVersion = payload.tokenVersion || 0;

        if (!user || (user as any).tokenVersion !== payloadVersion) {
            console.log(`Session invalid: Version mismatch (DB: ${(user as any)?.tokenVersion}, Token: ${payloadVersion})`);
            return null;
        }
    } catch (e) {
        // Fallback: If DB is unreachable, we trust the Signed JWT (Fail Open for Availability)
        console.error('Session DB check failed (Soft Fail - Trusting Token):', e);
        // We continue execution to return the payload. 
        // Security Note: This means revoked tokens might work during DB outages, 
        // but it prevents mass logouts during transient connection issues.
    }

    return {
        ...payload,
        // Impersonation Logic
        organizationId: payload.impersonatedOrgId || payload.organizationId,
        isGlobalAdmin: payload.impersonatedOrgId ? false : payload.isGlobalAdmin, // Disable admin power when impersonating
        isImpersonating: !!payload.impersonatedOrgId,
        items: payload.items // Keep original items if needed, or rely on payload structure
    };
});
const key = new TextEncoder().encode(SECRET_KEY);

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
}

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch {
        return null; // Invalid token
    }
}



export async function setSession(payload: any) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

    // HARDCODED SUPER ADMIN: Safety Override
    if (payload.email === 'khushinhvyas004@gmail.com') {
        payload.isGlobalAdmin = true;
    }

    const session = await encrypt({ ...payload, expires });
    const cookieStore = await cookies();

    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        sameSite: 'lax',
        path: '/',
    });
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
