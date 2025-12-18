import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import VendorInventoryClient from './VendorInventoryClient';
import Link from 'next/link';
import { ArrowLeft, Truck } from 'lucide-react';

export default async function VendorInventoryPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const organizationId = session.organizationId;

    // Fetch companies with at least one pending item
    // We fetch everything in one go to keep it simple, or we could fetch on demand.
    // For Reporting, fetching all data for the page is usually standard.
    const companyBatches = await prisma.companyBatch.findMany({
        where: {
            company: { organizationId },
            items: {
                some: { status: 'SENT_TO_COMPANY' }
            }
        },
        include: {
            company: true,
            items: {
                where: { status: 'SENT_TO_COMPANY' },
                include: {
                    product: true,
                    ticket: {
                        include: { customer: true }
                    }
                }
            }
        }
    });

    // Group items by Company
    const inventoryData = companyBatches.reduce((acc, batch) => {
        const companyId = batch.companyId;
        if (!acc[companyId]) {
            acc[companyId] = {
                company: batch.company,
                items: []
            };
        }
        // Add items from this batch, injecting batch date
        acc[companyId].items.push(...batch.items.map((i: any) => ({ ...i, batchDate: batch.dateSent })));
        return acc;
    }, {} as Record<number, { company: any, items: any[] }>);

    const groupedList = Object.values(inventoryData).sort((a, b) => a.company.name.localeCompare(b.company.name));

    return (
        <div className="page-transition" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* Premium Hero Header */}
            <div className="mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div className="premium-hero relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-2xl shadow-indigo-200">
                    <div className="premium-hero-pattern absolute inset-0 opacity-10" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                            <Truck size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Pending Vendor Inventory</h1>
                            <p className="text-indigo-100 mt-2 text-lg font-medium opacity-90">Track products currently at Service Centers</p>
                        </div>
                    </div>
                </div>
            </div>

            <VendorInventoryClient data={groupedList} />
        </div>
    );
}
