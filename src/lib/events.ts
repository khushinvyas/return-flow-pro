import { prisma } from '@/lib/db';

export async function logTicketEvent(ticketId: number, userId: number, type: string, description: string) {
    try {
        await prisma.ticketEvent.create({
            data: {
                ticketId,
                userId,
                type,
                description
            }
        });
    } catch (error) {
        console.error('Failed to log ticket event:', error);
        // Don't throw, we don't want to break the main flow if logging fails
    }
}
