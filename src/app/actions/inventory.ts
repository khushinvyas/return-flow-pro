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

function isRedirectError(error: any) {
    return error && (error.digest?.startsWith('NEXT_REDIRECT') || error.message?.includes('NEXT_REDIRECT'));
}

// --- Product Actions ---

export async function createProduct(prevState: any, formData: FormData) {
    const { userId, organizationId } = await checkAuth();

    if (!organizationId) {
        return { message: 'Organization is required.' };
    }

    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const modelNumber = formData.get('modelNumber') as string;

    if (!name || !brand) {
        return { message: 'Name and Brand are required' };
    }

    try {
        const product = await prisma.product.create({
            data: {
                name,
                brand,
                modelNumber,
                userId: Number(userId),
                organizationId
            },
        });

        revalidatePath('/products');

        const returnTo = formData.get('returnTo') as string;
        if (returnTo) {
            const separator = returnTo.includes('?') ? '&' : '?';
            redirect(`${returnTo}${separator}initialProductId=${product.id}`);
        } else {
            redirect('/products?created=true');
        }
    } catch (e) {
        if (isRedirectError(e)) throw e;
        return { message: 'Failed to create product' };
    }
}

export async function updateProduct(prevState: any, formData: FormData) {
    const { userId, organizationId, isGlobalAdmin } = await checkAuth();
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const id = parseInt(formData.get('id') as string);
    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const modelNumber = formData.get('modelNumber') as string;

    if (!id || !name || !brand) {
        return { message: 'ID, Name and Brand are required' };
    }

    try {
        const result = await prisma.product.updateMany({
            where: {
                id,
                ...orgFilter
            },
            data: {
                name,
                brand,
                modelNumber,
            },
        });

        if (result.count === 0) {
            return { message: 'Product not found or unauthorized' };
        }

        revalidatePath('/products');
        redirect('/products?updated=true');
    } catch (e) {
        if (isRedirectError(e)) throw e;
        return { message: 'Failed to update product' };
    }
}

export async function deleteProduct(id: number) {
    const { userId, organizationId, isGlobalAdmin } = await checkAuth();
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    try {
        // Ensure user owns the product before deleting
        const result = await prisma.product.deleteMany({
            where: {
                id,
                ...orgFilter
            }
        });

        if (result.count === 0) {
            return { message: 'Product not found or unauthorized' };
        }

        revalidatePath('/products');
        return { message: 'success' };
    } catch {
        return { message: 'Failed to delete product' };
    }
}

// --- Company Actions ---

export async function createCompany(prevState: any, formData: FormData) {
    const { userId, organizationId } = await checkAuth();

    if (!organizationId) {
        return { message: 'Organization is required.' };
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    if (!name) return { message: 'Name is required' };

    try {
        const company = await prisma.company.create({
            data: {
                name,
                email,
                phone,
                address,
                userId: Number(userId),
                organizationId
            },
        });
        revalidatePath('/companies');

        const returnTo = formData.get('returnTo') as string;
        if (returnTo) {
            const separator = returnTo.includes('?') ? '&' : '?';
            redirect(`${returnTo}${separator}initialCompanyId=${company.id}`);
        } else {
            redirect('/companies?created=true');
        }
    } catch (e) {
        if (isRedirectError(e)) throw e;
        return { message: 'Failed to create company' };
    }
}

export async function updateCompany(prevState: any, formData: FormData) {
    const { userId, organizationId, isGlobalAdmin } = await checkAuth();
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const id = parseInt(formData.get('id') as string);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    if (!id || !name) {
        return { message: 'ID and Name are required' };
    }

    try {
        const result = await prisma.company.updateMany({
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
            return { message: 'Company not found or unauthorized' };
        }

        revalidatePath('/companies');
        redirect('/companies?updated=true');
    } catch (e) {
        if (isRedirectError(e)) throw e;
        return { message: 'Failed to update company' };
    }
}

export async function deleteCompany(id: number) {
    const { userId, organizationId, isGlobalAdmin } = await checkAuth();
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    try {
        const result = await prisma.company.deleteMany({
            where: {
                id,
                ...orgFilter
            }
        });

        if (result.count === 0) {
            return { message: 'Company not found or unauthorized' };
        }

        revalidatePath('/companies');
        return { message: 'success' };
    } catch {
        return { message: 'Failed to delete company' };
    }
}
