'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function searchAll(query: string) {
    const session = await getSession();
    if (!session?.userId) return { tickets: [], customers: [], products: [], companies: [] };

    if (!query || query.length < 2) {
        return { tickets: [], customers: [], products: [], companies: [] };
    }

    const { organizationId, isGlobalAdmin } = session;
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const [tickets] = await Promise.all([
        prisma.ticket.findMany({
            where: {
                ...orgFilter,
                OR: [
                    { id: isNaN(Number(query)) ? undefined : Number(query) },
                    {
                        items: {
                            some: {
                                OR: [
                                    { serialNumber: { contains: query } },
                                    { issueDescription: { contains: query } },
                                    { product: { name: { contains: query } } },
                                    { product: { brand: { contains: query } } },
                                    { companyBatch: { company: { name: { contains: query } } } }
                                ]
                            }
                        }
                    },
                    { customer: { name: { contains: query } } },
                    { customer: { phone: { contains: query } } },
                    { customer: { email: { contains: query } } }
                ]
            },
            take: 10,
            include: { customer: true, items: { include: { product: true, companyBatch: { include: { company: true } } } } }
        })
    ]);

    return { tickets };
}
