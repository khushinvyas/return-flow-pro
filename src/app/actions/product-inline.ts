'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createProductInline(formData: FormData) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const modelNumber = (formData.get('modelNumber') as string) || null;

    if (!name || !brand) {
        return { error: 'Name and Brand are required' };
    }

    try {
        const product = await prisma.product.create({
            data: {
                name,
                brand,
                modelNumber,
                userId: Number(session.userId),
                organizationId: session.organizationId
            },
        });

        revalidatePath('/products');
        return { success: true, product };
    } catch (e) {
        console.error('Create product error:', e);
        return { error: 'Failed to create product' };
    }
}
