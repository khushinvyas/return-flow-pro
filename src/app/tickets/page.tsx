import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus, Ticket as TicketIcon, ArrowLeft } from 'lucide-react';

import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function getTickets(searchParams: { [key: string]: string | string[] | undefined }) {
    const session = await getSession();
    if (!session?.userId) return [];

    const { organizationId, isGlobalAdmin } = session;

    const where: any = isGlobalAdmin ? {} : { organizationId };

    const status = searchParams.status as string;
    if (status) where.status = status;

    const customerId = searchParams.customerId as string;
    if (customerId) where.customerId = parseInt(customerId);

    // Filters that require looking into TicketItems
    const productId = searchParams.productId as string;
    const companyId = searchParams.companyId as string;
    const serial = searchParams.serial as string;
    const itemStatus = searchParams.itemStatus as string;

    if (productId || companyId || serial || itemStatus) {
        where.items = {
            some: {}
        };

        if (productId) where.items.some.productId = parseInt(productId);
        if (serial) where.items.some.serialNumber = { contains: serial };
        if (itemStatus) where.items.some.status = itemStatus;

        if (companyId) {
            where.items.some.companyBatch = {
                companyId: parseInt(companyId)
            };
        }
    }

    return await prisma.ticket.findMany({
        where,
        include: {
            customer: true,
            items: {
                include: {
                    product: true,
                    companyBatch: { include: { company: true } }
                }
            }
        },
        orderBy: { updatedAt: 'desc' },
    });
}

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import DeleteTicketButton from '@/components/DeleteTicketButton';

// ... (getTickets function remains unchanged)

export default async function TicketsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
    const tickets = await getTickets(searchParams);

    return (
        <div>
            <Button href="/" variant="ghost" size="sm" style={{ marginBottom: '1rem', paddingLeft: 0, color: 'var(--secondary-foreground)' }}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Tickets</h1>
                    <p style={{ color: 'var(--secondary-foreground)' }}>Track all repair and replacement tickets</p>
                </div>
                <Button href="/tickets/new">
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> New Ticket
                </Button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {tickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:bg-accent-light" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s', padding: '1.25rem' }}>
                        <Link href={`/tickets/${ticket.id}`} style={{ textDecoration: 'none', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginRight: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', background: 'var(--secondary)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TicketIcon size={24} color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Ticket #{ticket.ticketNumber > 0 ? ticket.ticketNumber : ticket.id}</span>
                                        <span style={{ color: 'var(--secondary-foreground)' }}>• {ticket.customer.name}</span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>
                                        {ticket.items.length} Items • {ticket.items.map((i: any) => i.product.name).join(', ')}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div className="hide-mobile" style={{ textAlign: 'right' }}>
                                    <style>{`@media (max-width: 640px) { .hide-mobile { display: none !important; } }`}</style>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)', marginBottom: '0.25rem' }}>Last Updated</div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{ticket.updatedAt.toLocaleDateString()}</div>
                                </div>
                                <Badge variant={ticket.status === 'OPEN' ? 'blue' : 'success'}>
                                    {ticket.status === 'OPEN' ? 'Open' : 'Closed'}
                                </Badge>
                            </div>
                        </Link>

                        <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>
                            <DeleteTicketButton ticketId={ticket.id} />
                        </div>
                    </Card>
                ))}

                {tickets.length === 0 && (
                    <Card style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: 'var(--secondary-foreground)' }}>No tickets yet. Create your first ticket to get started.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
