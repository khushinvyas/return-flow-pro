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
    return session.userId;
}

export async function getPendingItems() {
    const userId = await checkAuth();
    return await prisma.ticketItem.findMany({
        where: {
            userId: Number(userId),
            status: 'RECEIVED'
        },
        include: {
            product: true,
            ticket: {
                include: {
                    customer: true
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });
}

export async function createBatch(prevState: any, formData: FormData) {
    const userId = await checkAuth();

    const companyId = parseInt(formData.get('companyId') as string);
    const courierName = formData.get('courierName') as string;
    const trackingNumber = formData.get('trackingNumber') as string;
    const itemIds = JSON.parse(formData.get('itemIds') as string);

    if (!companyId || !itemIds || itemIds.length === 0) {
        return { message: 'Company and at least one item are required' };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create Batch
            const batch = await tx.companyBatch.create({
                data: {
                    companyId,
                    courierName,
                    trackingNumber,
                    status: 'SENT',
                    dateSent: new Date(),
                    userId: Number(userId)
                }
            });

            // 2. Update Items
            await tx.ticketItem.updateMany({
                where: {
                    id: { in: itemIds },
                    userId: Number(userId)
                },
                data: {
                    companyBatchId: batch.id,
                    status: 'SENT_TO_COMPANY'
                }
            });
        });
    } catch (e) {
        console.error(e);
        return { message: 'Failed to create batch' };
    }

    revalidatePath('/outward');
    revalidatePath('/tickets');
    return { message: 'success' };
}
