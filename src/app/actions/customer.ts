'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';


async function checkAuth() {
    const session = await getSession();
    if (!session?.userId) {
        redirect('/login');
    }
    return {
        userId: session.userId,
        organizationId: session.organizationId,
        isGlobalAdmin: session.isGlobalAdmin
    };
}

// Helper to check for redirect error without importing internal types if possible
function isRedirectError(error: any) {
    return error && (error.digest?.startsWith('NEXT_REDIRECT') || error.message?.includes('NEXT_REDIRECT'));
}

export async function createCustomer(prevState: any, formData: FormData) {
    const { userId, organizationId } = await checkAuth();

    if (!organizationId) {
        return { message: 'Organization is required.' };
    }

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;

    if (!name || !phone) {
        return { message: 'Name and Phone are required' };
    }

    try {
        await prisma.customer.create({
            data: {
                name,
                phone,
                email,
                address,
                userId: Number(userId),
                organizationId
            },
        });

        revalidatePath('/customers');

        const returnTo = formData.get('returnTo') as string;
        if (returnTo) {
            redirect(returnTo);
        } else {
            redirect('/customers?created=true');
        }
    } catch (e) {
        if (isRedirectError(e)) {
            throw e;
        }

        console.error('Create Customer Error:', e);
        return { message: `Failed: ${(e as Error).message || 'Unknown error'}` };
    }
}

export async function updateCustomer(prevState: any, formData: FormData) {
    const { userId, organizationId, isGlobalAdmin } = await checkAuth();
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const id = parseInt(formData.get('id') as string);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    if (!id || !name || !phone) {
        return { message: 'ID, Name and Phone are required' };
    }

    try {
        const result = await prisma.customer.updateMany({
            where: {
                id,
                ...orgFilter
            },
            data: {
                name,
                email,
                phone,
                address,
            },
        });

        if (result.count === 0) {
            return { message: 'Customer not found or unauthorized' };
        }

        revalidatePath('/customers');
        return { message: 'success' };
    } catch (error) {
        return { message: 'Failed to update customer' };
    }
}

export async function deleteCustomer(id: number) {
    const { userId, organizationId, isGlobalAdmin } = await checkAuth();
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    try {
        const result = await prisma.customer.deleteMany({
            where: {
                id,
                ...orgFilter
            },
        });

        if (result.count === 0) {
            return { message: 'Customer not found or unauthorized' };
        }

        revalidatePath('/customers');
        return { message: 'success' };
    } catch (error) {
        return { message: 'Failed to delete customer' };
    }
}
