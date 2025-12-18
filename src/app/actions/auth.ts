'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { comparePassword, hashPassword, setSession, clearSession, getSession } from '@/lib/auth';

export async function register(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Organization Details
    const orgNameInput = formData.get('orgName') as string;
    const gstNumber = formData.get('gstNumber') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const logo = formData.get('logo') as string;

    if (!name || !email || !password) {
        return { message: 'All fields are required' };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { message: 'User already exists' };
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.$transaction(async (tx) => {
            const orgName = orgNameInput || `${name}'s Organization`;
            const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);

            return await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'USER',
                    memberships: {
                        create: {
                            role: 'OWNER',
                            organization: {
                                create: {
                                    name: orgName,
                                    slug,
                                    subscriptionStatus: 'TRIAL',
                                    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                                    gstNumber,
                                    address,
                                    phone,
                                    logoUrl: logo
                                }
                            }
                        }
                    }
                } as any,
                include: { memberships: true }
            });
        }) as any;

        const organizationId = user.memberships[0]?.organizationId;
        // Calculate same date or fetch it. For simplicity in this transaction flow, we use the same calc.
        const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await setSession({
            userId: user.id,
            email: user.email,
            role: user.role,
            isGlobalAdmin: user.isGlobalAdmin,
            organizationId,
            subscriptionStatus: 'TRIAL',
            subscriptionExpiry: expiry.toISOString(),
            tokenVersion: user.tokenVersion
        });
    } catch (error) {
        console.error(error);
        return { message: 'Something went wrong' };
    }

    redirect('/');
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { message: 'All fields are required' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                memberships: {
                    include: { organization: true }
                }
            }
        }) as any;

        if (!user) {
            return { message: 'Invalid credentials' };
        }

        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            return { message: 'Invalid credentials' };
        }

        // Get default organization (first one for now)
        const membership = user.memberships[0];
        const organizationId = membership?.organizationId;
        const org = membership?.organization;

        await setSession({
            userId: user.id,
            email: user.email,
            role: user.role,
            isGlobalAdmin: user.isGlobalAdmin,
            organizationId,
            subscriptionStatus: org?.subscriptionStatus,
            subscriptionExpiry: org?.subscriptionExpiry,
            tokenVersion: user.tokenVersion
        });
    } catch (error) {
        return { message: 'Something went wrong' };
    }

    redirect('/');
}

export async function logout() {
    await clearSession();
    redirect('/login');
}
export async function impersonateOrganization(orgId: string) {
    const session = await getSession();
    if (!session || !session.isGlobalAdmin) {
        throw new Error('Unauthorized');
    }

    // We keep the original session payload but add the impersonation flag
    const newPayload = {
        ...session,
        impersonatedOrgId: orgId
    };

    // Re-encrypt and set cookie
    await setSession(newPayload);
    redirect('/');
}

export async function stopImpersonating() {
    const session = await getSession();
    if (!session) return;

    // Remove impersonation field
    const { impersonatedOrgId, ...originalPayload } = session;

    // We also need to restore isGlobalAdmin if it was temporally masked by getSession
    // But since we are reading the RAW payload in setSession (conceptually), we assume the original payload had isGlobalAdmin=true.
    // However, getSession returns the COMPUTED properties. 
    // We should rely on the fact that the original 'session' cookie (before compute) had the data.
    // BUT, getSession() returns the computed view.
    // LIMITATION: 'getSession' masks isGlobalAdmin. We need to be careful.

    // FIX: We trust the session has the original data, but getSession modifies it.
    // Actually, safely we should just remove the key.

    // In a real production app, we might store 'originalSession' object.
    // Here, we know the user IS global admin if they were impersonating (implied).
    // Or we simply check the database for the user again to be safe.

    const user = await prisma.user.findUnique({ where: { id: Number(session.userId) } });
    const isGlobalAdmin = user?.email === 'khushinhvyas004@gmail.com'; // or DB role check

    const newPayload = {
        ...originalPayload,
        isGlobalAdmin, // Restore admin status
        impersonatedOrgId: undefined
    };

    await setSession(newPayload);
    redirect('/admin');
}
