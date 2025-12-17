import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import TicketPrintClient from './TicketPrintClient';

export default async function PrintTicketPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ type?: string, companyId?: string }> }) {
    const session = await getSession();
    if (!session?.userId) redirect('/login');

    const id = parseInt((await params).id);
    const type = (await searchParams).type || 'INWARD'; // INWARD or OUTWARD

    if (isNaN(id)) notFound();

    const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
            customer: true,
            organization: true,
            items: {
                include: {
                    product: true,
                    companyBatch: {
                        include: { company: true }
                    }
                }
            }
        }
    });

    if (!ticket) notFound();

    const validPrintType = (['INWARD', 'OUTWARD', 'CHALLAN'].includes(type) ? type : 'INWARD') as any;
    const targetCompanyId = (await searchParams).companyId ? parseInt((await searchParams).companyId as string) : undefined;

    return <TicketPrintClient ticket={ticket} type={validPrintType} targetCompanyId={targetCompanyId} />;
}
