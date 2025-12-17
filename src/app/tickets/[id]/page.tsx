import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, Ticket } from 'lucide-react';
import TicketDetail from './TicketDetail';

import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function getData(id: number) {
    const session = await getSession();
    if (!session?.userId || isNaN(id)) return { ticket: null, companies: [] };

    const { organizationId, isGlobalAdmin } = session;
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const ticket = await prisma.ticket.findFirst({
        where: {
            id,
            ...orgFilter
        },
        include: {
            customer: true,
            organization: true,
            items: {
                include: {
                    product: true,
                    companyBatch: {
                        include: {
                            company: true
                        }
                    }
                }
            },
            events: {
                include: {
                    user: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    const companies = await prisma.company.findMany({
        where: { ...orgFilter },
        orderBy: { name: 'asc' }
    });

    // Self-Healing: Check if the ticket should be closed but isn't
    if (ticket && ticket.status === 'OPEN' && ticket.items.length > 0) {
        const allItemsReturned = ticket.items.every(item => item.status === 'RETURNED_TO_CUSTOMER');
        if (allItemsReturned) {
            await prisma.ticket.updateMany({
                where: {
                    id: ticket.id,
                    ...orgFilter
                },
                data: { status: 'COMPLETED' }
            });
            ticket.status = 'COMPLETED';
        }
    }

    return { ticket, companies };
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { ticket, companies } = await getData(parseInt(id));

    if (!ticket) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <Ticket className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Ticket Not Found</h2>
                    <p className="text-slate-500 mb-6">The ticket you're looking for doesn't exist or you don't have access.</p>
                    <Link
                        href="/tickets"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Tickets
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Premium Breadcrumb */}
            <div className="mb-6">
                <Link
                    href="/tickets"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-all duration-200"
                >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-100 transition-colors">
                        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    </span>
                    <span>Back to Tickets</span>
                </Link>
            </div>

            <TicketDetail ticket={ticket} companies={companies} />
        </div>
    );
}
