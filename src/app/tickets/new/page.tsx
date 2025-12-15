import { prisma } from '@/lib/db';
import TicketForm from './TicketForm';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function getData() {
    const session = await getSession();
    if (!session?.userId) redirect('/login');

    const { organizationId, isGlobalAdmin } = session;
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const customers = await prisma.customer.findMany({
        where: { ...orgFilter },
        orderBy: { name: 'asc' }
    });
    const products = await prisma.product.findMany({
        where: { ...orgFilter },
        orderBy: { name: 'asc' }
    });
    return { customers, products };
}

type PageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function NewTicketPage({ searchParams }: PageProps) {
    const { customers, products } = await getData();
    const params = await searchParams;

    const initialCustomerId = params.customerId ? Number(params.customerId) : undefined;
    const initialProductId = params.productId ? Number(params.productId) : undefined;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>New Ticket</h1>
                <p style={{ color: 'var(--secondary-foreground)' }}>Stage 1: Inward Entry</p>
            </div>

            <TicketForm
                customers={customers}
                products={products}
                initialCustomerId={initialCustomerId}
                initialProductId={initialProductId}
            />
        </div>
    );
}
