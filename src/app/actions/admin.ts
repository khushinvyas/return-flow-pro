'use server';

import { prisma } from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function checkGlobalAdmin() {
    const session = await getSession();
    if (!session?.userId || !session.isGlobalAdmin) {
        redirect('/'); // Or 404/403
    }
    return session;
}

export async function getAdminDashboardData(query?: string, filter?: string) {
    await checkGlobalAdmin();

    const where: any = {};

    if (query) {
        where.OR = [
            { name: { contains: query } }, // Case insensitive usually depends on DB collation
            { slug: { contains: query } }
        ];
    }

    if (filter && filter !== 'ALL') {
        where.subscriptionStatus = filter;
    }

    const [
        totalUsers,
        totalOrgs,
        totalTickets,
        organizations
    ] = await Promise.all([
        prisma.user.count(),
        prisma.organization.count(),
        prisma.ticket.count(),
        prisma.organization.findMany({
            where,
            include: {
                _count: {
                    select: { members: true, tickets: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    ]);

    return {
        stats: {
            totalUsers,
            totalOrgs,
            totalTickets
        },
        organizations
    };
}

export async function getOrganization(id: string) {
    await checkGlobalAdmin();
    return await prisma.organization.findUnique({
        where: { id },
        include: {
            members: {
                include: { user: true }
            }
        }
    });
}

export async function updateOrganization(id: string, formData: FormData) {
    await checkGlobalAdmin();

    const name = formData.get('name') as string;
    const subscriptionStatus = formData.get('subscriptionStatus') as string;
    const subscriptionPlan = formData.get('subscriptionPlan') as string;
    const expiryString = formData.get('subscriptionExpiry') as string;

    const subscriptionExpiry = expiryString ? new Date(expiryString) : null;

    await prisma.organization.update({
        where: { id },
        data: {
            name,
            subscriptionStatus,
            subscriptionPlan,
            subscriptionExpiry
        }
    });

    revalidatePath('/admin');
    revalidatePath(`/admin/organizations/${id}`);
}

export async function deleteOrganization(id: string) {
    await checkGlobalAdmin();

    // Cascading delete might be needed if not set in Prisma schema
    // Assuming Prisma handles cascade or we need to clean up manualy
    // Typically in SaaS, we might soft-delete, but for now hard delete.

    await prisma.organization.delete({
        where: { id }
    });

    revalidatePath('/admin');
}

export async function getGlobalUsers(query?: string) {
    await checkGlobalAdmin();

    const where: any = {};
    if (query) {
        where.OR = [
            { name: { contains: query } },
            { email: { contains: query } }
        ];
    }

    return await prisma.user.findMany({
        where,
        include: {
            memberships: {
                include: { organization: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateGlobalUser(id: number, formData: FormData) {
    await checkGlobalAdmin();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log(`[Admin] Updating User ${id}:`, { name, email, passwordProvided: !!password });

    const data: any = { name, email };

    if (password && password.trim() !== '') {
        console.log('[Admin] Hashing new password...');
        data.password = await hashPassword(password);
        data.tokenVersion = { increment: 1 }; // Invalidate existing sessions
    }

    try {
        await prisma.user.update({
            where: { id },
            data
        });
        console.log('[Admin] User updated successfully');
    } catch (e) {
        console.error('[Admin] Update failed:', e);
    }

    revalidatePath('/admin/users');
}

export async function deleteGlobalUser(id: number) {
    await checkGlobalAdmin();
    await prisma.user.delete({ where: { id } });
    revalidatePath('/admin/users');
    revalidatePath('/admin'); // Update stats
}
