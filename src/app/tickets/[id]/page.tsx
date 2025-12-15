import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TicketDetail from './TicketDetail';

import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function getData(id: number) {
    const session = await getSession();
    if (!session?.userId) return { ticket: null, companies: [] };

    const { organizationId, isGlobalAdmin } = session;
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const ticket = await prisma.ticket.findFirst({
        where: {
            id,
            ...orgFilter
        },
        include: {
            customer: true,
            items: {
                include: {
                    product: true,
                    companyBatch: {
                        include: {
                            company: true
                        }
                    }
                }
            }
        }
    });

    // We might not need companies here anymore if we don't do sending from this page
    // But let's keep it just in case we add "Quick Send" later
    const companies = await prisma.company.findMany({
        where: { ...orgFilter },
        orderBy: { name: 'asc' }
    });

    // Self-Healing: Check if the ticket should be closed but isn't
    if (ticket && ticket.status === 'OPEN' && ticket.items.length > 0) {
        const allItemsReturned = ticket.items.every(item => item.status === 'RETURNED_TO_CUSTOMER');
        if (allItemsReturned) {
            // Auto-close the ticket locally and in DB
            await prisma.ticket.updateMany({
                where: {
                    id: ticket.id,
                    ...orgFilter
                },
                data: { status: 'COMPLETED' }
            });
            ticket.status = 'COMPLETED'; // Update local object for the UI
        }
    }

    return { ticket, companies };
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { ticket, companies } = await getData(parseInt(id));

    if (!ticket) {
        return <div>Ticket not found</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary-foreground)', marginBottom: '1rem' }}>
                <ArrowLeft size={16} /> Back to Tickets
            </Link>

            <TicketDetail ticket={ticket} companies={companies} />
        </div>
    );
}
