import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus, Ticket as TicketIcon, ArrowLeft, Calendar, User, Package, Search } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import DeleteTicketButton from '@/components/DeleteTicketButton';
import TicketSearch from '@/components/TicketSearch';

async function getTickets(searchParams: { [key: string]: string | string[] | undefined }) {
    const session = await getSession();
    if (!session?.userId) return [];

    const { organizationId, isGlobalAdmin } = session;
    const where: any = isGlobalAdmin ? {} : { organizationId };

    const status = searchParams.status as string;
    if (status) where.status = status;

    const query = searchParams.q as string;
    if (query) {
        const queryInt = parseInt(query);
        const orConditions: any[] = [
            { customer: { name: { contains: query, mode: 'insensitive' } } },
            { items: { some: { serialNumber: { contains: query, mode: 'insensitive' } } } },
            { items: { some: { product: { name: { contains: query, mode: 'insensitive' } } } } },
        ];

        if (!isNaN(queryInt)) {
            orConditions.push({ id: queryInt });
            orConditions.push({ ticketNumber: queryInt });
        }

        where.OR = orConditions;
    }

    const customerId = searchParams.customerId as string;
    if (customerId) where.customerId = parseInt(customerId);

    // Filters that require looking into TicketItems
    const productId = searchParams.productId as string;
    const companyId = searchParams.companyId as string;
    const serial = searchParams.serial as string;
    const itemStatus = searchParams.itemStatus as string;

    if (productId || companyId || serial || itemStatus) {
        where.items = { some: where.items?.some || {} }; // Merge with existing items filter if any
        if (productId) where.items.some.productId = parseInt(productId);
        if (serial) where.items.some.serialNumber = { contains: serial };
        if (itemStatus) where.items.some.status = itemStatus;
        if (companyId) {
            where.items.some.companyBatch = { companyId: parseInt(companyId) };
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

export default async function TicketsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
    const tickets = await getTickets(searchParams);
    const query = (searchParams.q as string) || '';

    return (
        <div className="page-transition" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/" style={{ fontSize: '0.875rem', color: 'hsl(var(--secondary-foreground))', display: 'inline-flex', alignItems: 'center', marginBottom: '1rem', textDecoration: 'none' }}>
                    <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'hsl(var(--foreground))' }}>Tickets</h1>
                        <p style={{ fontSize: '1.1rem', color: 'hsl(var(--secondary-foreground))' }}>Track and manage all service requests.</p>
                    </div>
                    <Button href="/tickets/new">
                        <Plus size={18} style={{ marginRight: '0.5rem' }} /> New Ticket
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <Card style={{ padding: '1rem', marginBottom: '2rem' }}>
                <TicketSearch />
            </Card>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tickets.map((ticket) => (
                    <div key={ticket.id} className="premium-card" style={{ padding: '0', display: 'flex', transition: 'all 0.2s', border: '1px solid hsl(var(--border))' }}>

                        <Link href={`/tickets/${ticket.id}`}
                            style={{ flex: 1, textDecoration: 'none', display: 'flex', padding: '1.5rem', alignItems: 'center', gap: '1.5rem' }}
                            className="group"
                        >
                            {/* Icon */}
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '14px',
                                background: 'hsl(var(--secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <TicketIcon size={24} style={{ color: 'hsl(var(--primary))' }} />
                            </div>

                            {/* Main Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                                        Ticket #{ticket.ticketNumber || ticket.id}
                                    </span>
                                    <Badge variant={ticket.status === 'OPEN' ? 'blue' : 'success'}>
                                        {ticket.status === 'OPEN' ? 'Open' : 'Closed'}
                                    </Badge>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem', color: 'hsl(var(--secondary-foreground))' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <User size={14} /> {ticket.customer.name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Package size={14} /> {ticket.items.length} Items
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={14} /> {ticket.updatedAt.toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div style={{ color: 'hsl(var(--primary))', opacity: 0, transform: 'translateX(-10px)', transition: 'all 0.2s' }} className="group-hover:opacity-100 group-hover:translate-x-0">
                                View Details →
                            </div>
                        </Link>

                        {/* Actions */}
                        <div style={{ borderLeft: '1px solid hsl(var(--border))', padding: '0 1.5rem', display: 'flex', alignItems: 'center' }}>
                            <DeleteTicketButton ticketId={ticket.id} />
                        </div>
                    </div>
                ))}

                {tickets.length === 0 && (
                    <div className="premium-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ width: '64px', height: '64px', background: 'hsl(var(--secondary))', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TicketIcon size={32} style={{ color: 'hsl(var(--secondary-foreground))' }} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No tickets found</h3>
                        <p style={{ color: 'hsl(var(--secondary-foreground))', marginBottom: '1.5rem' }}>
                            {query ? `No results for "${query}"` : "Get started by creating a new service request."}
                        </p>
                        <Button href="/tickets/new">Create Ticket</Button>
                    </div>
                )}
            </div>

            <style>{`
                .premium-card:hover {
                    border-color: hsl(var(--primary) / 0.5) !important;
                    box-shadow: var(--shadow-md) !important;
                    transform: translateY(-2px);
                }
                .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; transform: translateX(0) !important; }
            `}</style>
        </div>
    );
}
