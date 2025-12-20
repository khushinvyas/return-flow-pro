'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { logTicketEvent } from '@/lib/events';


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

// STAGE 1: Create Ticket (Multi-Item)
export async function createTicket(prevState: any, formData: FormData) {
    const { userId, organizationId, isGlobalAdmin } = await checkAuth();

    if (!organizationId && !isGlobalAdmin) {
        return { message: 'Organization is required to create tickets.' };
    }

    const customerId = parseInt(formData.get('customerId') as string);
    const receiptMethod = formData.get('receiptMethod') as string;
    const itemsJson = formData.get('items') as string;

    if (!customerId || !receiptMethod || !itemsJson) {
        return { message: 'Missing required fields' };
    }

    const items = JSON.parse(itemsJson);
    if (!Array.isArray(items) || items.length === 0) {
        return { message: 'At least one item is required' };
    }

    // Security Check: Verify Customer belongs to Organization
    // If Global Admin, allow ANY customer. If Normal, enforce organizationId.
    const customer = await prisma.customer.findFirst({
        where: {
            id: customerId,
            ...(isGlobalAdmin ? {} : { organizationId })
        }
    });

    if (!customer) {
        return { message: 'Invalid Customer ID for this Organization' };
    }

    // Determine target organization for the ticket
    const targetOrganizationId = customer.organizationId;

    try {
        await prisma.$transaction(async (tx) => {
            // Get last ticket number for this org
            const lastTicket = await tx.ticket.findFirst({
                where: { organizationId: targetOrganizationId },
                orderBy: { ticketNumber: 'desc' },
                select: { ticketNumber: true }
            });

            const nextTicketNumber = (lastTicket?.ticketNumber || 0) + 1;

            // 1. Create the Ticket
            const ticket = await tx.ticket.create({
                data: {
                    customerId,
                    receiptMethod,
                    status: 'OPEN',
                    userId: Number(userId),
                    organizationId: targetOrganizationId,
                    ticketNumber: nextTicketNumber
                }
            });

            // 2. Create Ticket Items
            for (const item of items) {
                await tx.ticketItem.create({
                    data: {
                        ticketId: ticket.id,
                        productId: parseInt(item.productId),
                        serialNumber: item.serialNumber,
                        issueDescription: item.issueDescription,
                        isUnderWarranty: item.isUnderWarranty,
                        status: 'RECEIVED',
                        userId: Number(userId),
                        organizationId: targetOrganizationId
                    }
                });
            }

            // Log Event (we can call this safely here as it's fire-and-forget or we can await it)
            // Ideally we wait for it to ensure consistency, but if it fails we don't want to rollback ticket?
            // Actually, audit logs are critical. 
            // Since logTicketEvent uses `prisma` (global), we can await it here.
            await tx.ticketEvent.create({
                data: {
                    ticketId: ticket.id,
                    userId: Number(userId),
                    type: 'INFO',
                    description: `Ticket created with ${items.length} items.`
                }
            });
        });

    } catch (e) {
        console.error(e);
        return { message: 'Failed to create ticket' };
    }

    revalidatePath('/tickets');
    redirect('/tickets');
}


// STAGE 3: Inward from Company (Per Item)
export async function updateItemStage3(prevState: any, formData: FormData) {
    const { userId, organizationId, isGlobalAdmin } = await checkAuth();
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const itemId = parseInt(formData.get('itemId') as string);
    const resolution = formData.get('resolution') as string; // REPAIRED, REPLACED, REJECTED
    const newSerialNumber = formData.get('newSerialNumber') as string;
    const repairCost = parseFloat(formData.get('repairCost') as string) || 0;
    const companyResolutionDescription = formData.get('companyResolutionDescription') as string;
    const ticketId = formData.get('ticketId') as string;

    try {
        const result = await prisma.ticketItem.updateMany({
            where: {
                id: itemId,
                ...orgFilter
            },
            data: {
                resolution,
                newSerialNumber,
                repairCost,
                companyResolutionDescription,
                dateReceivedFromCompany: new Date(),
                status: 'RECEIVED_FROM_COMPANY'
            }
        });

        if (result.count === 0) {
            return { message: 'Item not found or unauthorized' };
        }

    } catch {
        return { message: 'Failed to update item' };
    }

    revalidatePath(`/tickets/${ticketId}`);

    // Log Update
    await logTicketEvent(parseInt(ticketId), userId, 'STATUS_CHANGE', `Item #${itemId} received from company (Resolution: ${resolution})`);

    return { message: 'success' };
}

// STAGE 4: Return to Customer (Per Item)
export async function updateItemStage4(prevState: any, formData: FormData) {
    const { userId, organizationId, isGlobalAdmin } = await checkAuth();
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const itemId = parseInt(formData.get('itemId') as string);
    const finalCost = parseFloat(formData.get('finalCost') as string) || 0;
    const returnMethod = formData.get('returnMethod') as string;
    const returnTrackingNumber = formData.get('returnTrackingNumber') as string;
    const customerReturnDescription = formData.get('customerReturnDescription') as string;
    const dateReturnedStr = formData.get('dateReturnedToCustomer') as string;
    const ticketId = formData.get('ticketId') as string;

    const ticketIdInt = parseInt(ticketId);

    // Parse user-provided date or use current date
    const dateReturnedToCustomer = dateReturnedStr ? new Date(dateReturnedStr) : new Date();

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update the Item
            const updateResult = await tx.ticketItem.updateMany({
                where: {
                    id: itemId,
                    ...orgFilter
                },
                data: {
                    finalCost,
                    returnMethod,
                    returnTrackingNumber: returnMethod === 'COURIER' ? returnTrackingNumber : null,
                    customerReturnDescription,
                    dateReturnedToCustomer,
                    status: 'RETURNED_TO_CUSTOMER'
                }
            });

            if (updateResult.count === 0) {
                throw new Error('Item not found or unauthorized');
            }

            // 2. Check if all items for this ticket are closed
            const openItemsCount = await tx.ticketItem.count({
                where: {
                    ticketId: ticketIdInt,
                    ...orgFilter,
                    status: {
                        not: 'RETURNED_TO_CUSTOMER'
                    }
                }
            });

            // 3. If no open items remain, close the ticket
            if (openItemsCount === 0) {
                await tx.ticket.updateMany({
                    where: {
                        id: ticketIdInt,
                        ...orgFilter
                    },
                    data: { status: 'COMPLETED' }
                });
                // Log Completion
                await tx.ticketEvent.create({
                    data: {
                        ticketId: ticketIdInt,
                        userId: Number(userId),
                        type: 'STATUS_CHANGE',
                        description: 'Ticket marked as COMPLETED (All items returned).'
                    }
                });
            }
        });

    } catch (e) {
        console.error('DEBUG updateItemStage4 Error:', e);
        return { message: 'Failed to close item' };
    }

    revalidatePath(`/tickets/${ticketId}`);

    // Log Update
    await logTicketEvent(ticketIdInt, userId, 'STATUS_CHANGE', `Item #${itemId} returned to customer.`);

    return { message: 'success' };
}

// UNDO ACTION: Revert "Sent to Company"
export async function undoBatchItem(prevState: any, formData: FormData) {
    const { userId, organizationId, isGlobalAdmin } = await checkAuth();
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const itemId = parseInt(formData.get('itemId') as string);
    const ticketId = formData.get('ticketId') as string;

    try {
        const result = await prisma.ticketItem.updateMany({
            where: {
                id: itemId,
                ...orgFilter
            },
            data: {
                status: 'RECEIVED',
                companyBatchId: null,
                dateReceivedFromCompany: null
            }
        });

        if (result.count === 0) {
            return { message: 'Item not found or unauthorized' };
        }

    } catch (e) {
        return { message: 'Failed to undo item' };
    }
    revalidatePath(`/tickets/${ticketId}`);

    // Log Update
    await logTicketEvent(parseInt(ticketId), userId, 'INFO', `Undo: Item #${itemId} removed from batch.`);

    return { message: 'success' };
}

// DELETE ACTION: Delete Ticket
export async function deleteTicket(ticketId: number) {
    const { userId, organizationId, isGlobalAdmin } = await checkAuth();
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    try {
        const result = await prisma.ticket.deleteMany({
            where: {
                id: ticketId,
                ...orgFilter
            }
        });

        if (result.count === 0) {
            return { message: 'Ticket not found or unauthorized' };
        }

    } catch (e) {
        return { message: 'Failed to delete ticket' };
    }
    revalidatePath('/tickets');
    return { message: 'success' };
}
