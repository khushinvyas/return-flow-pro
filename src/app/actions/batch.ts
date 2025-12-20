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
    const dispatchMethod = formData.get('dispatchMethod') as string; // HAND_ON or COURIER
    const courierName = formData.get('courierName') as string;
    const trackingNumber = formData.get('trackingNumber') as string;
    const dispatchNote = formData.get('dispatchNote') as string;
    const dateSentStr = formData.get('dateSent') as string;
    const itemIds = JSON.parse(formData.get('itemIds') as string);
    const ticketId = formData.get('ticketId') ? parseInt(formData.get('ticketId') as string) : null;

    if (!companyId || !itemIds || itemIds.length === 0) {
        return { message: 'Company and at least one item are required' };
    }

    // Parse date or use current date
    const dateSent = dateSentStr ? new Date(dateSentStr) : new Date();

    try {
        await prisma.$transaction(async (tx) => {
            // 0. Get company name for event logging
            const company = await tx.company.findUnique({
                where: { id: companyId },
                select: { name: true }
            });

            // 1. Create Batch
            const batch = await tx.companyBatch.create({
                data: {
                    companyId,
                    dispatchMethod: dispatchMethod || 'HAND_ON',
                    courierName: dispatchMethod === 'COURIER' ? courierName : null,
                    trackingNumber: dispatchMethod === 'COURIER' ? trackingNumber : null,
                    dispatchNote,
                    status: 'SENT',
                    dateSent,
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

            // 3. Create Ticket Event (if ticketId is provided)
            if (ticketId) {
                const methodText = dispatchMethod === 'COURIER' ? `via ${courierName || 'Courier'}` : 'via Hand Delivery';
                await tx.ticketEvent.create({
                    data: {
                        ticketId: ticketId,
                        userId: Number(userId),
                        type: 'STATUS_CHANGE',
                        description: `Dispatched ${itemIds.length} item(s) to ${company?.name || 'Service Center'} ${methodText}. ${dispatchMethod === 'COURIER' && trackingNumber ? `Tracking: ${trackingNumber}` : ''}`
                    }
                });
            }
        });
    } catch (e) {
        console.error(e);
        return { message: 'Failed to create batch' };
    }

    revalidatePath('/outward');
    revalidatePath('/tickets');
    if (ticketId) {
        revalidatePath(`/tickets/${ticketId}`);
    }
    return { message: 'success' };
}
