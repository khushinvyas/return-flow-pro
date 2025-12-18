import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import VendorPrintClient from './VendorPrintClient';

// Format date helper
const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export default async function VendorInventoryPrintPage({ params }: { params: Promise<{ companyId: string }> }) {
    const session = await getSession();
    if (!session) redirect('/login');

    const resolvedParams = await params;
    const companyId = parseInt(resolvedParams.companyId);

    // Fetch Company Details
    const company = await prisma.company.findUnique({
        where: { id: companyId },
    });

    if (!company || company.organizationId !== session.organizationId) {
        notFound();
    }

    // Fetch Organization for Header
    const organization = await prisma.organization.findUnique({
        where: { id: session.organizationId }
    });

    // Fetch Pending Items (Status = SENT_TO_COMPANY)
    const batches = await prisma.companyBatch.findMany({
        where: {
            companyId: companyId,
            items: { some: { status: 'SENT_TO_COMPANY' } }
        },
        include: {
            items: {
                where: { status: 'SENT_TO_COMPANY' },
                include: {
                    product: true
                }
            }
        }
    });

    // Flatten items
    const pendingItems = batches.flatMap(batch =>
        batch.items.map(item => ({
            ...item,
            batchDate: batch.dateSent
        }))
    ).sort((a, b) => {
        const dateA = a.batchDate ? new Date(a.batchDate).getTime() : 0;
        const dateB = b.batchDate ? new Date(b.batchDate).getTime() : 0;
        return dateA - dateB;
    });

    if (pendingItems.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-500">
                No pending inventory for this vendor.
            </div>
        );
    }

    return (
        <VendorPrintClient
            company={company}
            organization={organization}
            items={pendingItems}
        />
    );
}
