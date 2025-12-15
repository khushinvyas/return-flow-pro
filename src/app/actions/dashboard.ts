'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function checkAuth() {
    const session = await getSession();
    if (!session?.userId) {
        redirect('/login');
    }
    return {
        userId: session.userId,
        organizationId: session.organizationId,
        isGlobalAdmin: session.isGlobalAdmin
    };
}

export async function getDashboardStats() {
    const { userId, organizationId, isGlobalAdmin } = await checkAuth();
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    const [
        totalOpenTickets,
        pendingCompanyAction,
        readyForDelivery,
        activeCustomers,
        recentActivity
    ] = await Promise.all([

        prisma.ticket.count({
            where: {
                status: 'OPEN',
                ...orgFilter
            }
        }),

        prisma.ticketItem.count({
            where: {
                status: 'SENT_TO_COMPANY',
                ...orgFilter
            }
        }),

        prisma.ticketItem.count({
            where: {
                status: 'RECEIVED_FROM_COMPANY',
                ...orgFilter
            }
        }),

        prisma.customer.count({
            where: {
                ...orgFilter
            }
        }),

        prisma.ticket.findMany({
            where: {
                ...orgFilter
            },
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: {
                customer: { select: { name: true } },
                items: {
                    take: 1,
                    include: {
                        product: { select: { name: true, brand: true } }
                    }
                }
            }
        })
    ]);

    // Calculate Chart Data (Last 7 Days)
    const last7DaysTickets = await prisma.ticket.findMany({
        where: {
            ...orgFilter,
            createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
        },
        select: { createdAt: true }
    });

    const chartDataMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        chartDataMap.set(dayName, 0);
    }

    last7DaysTickets.forEach(t => {
        const dayName = new Date(t.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
        if (chartDataMap.has(dayName)) {
            chartDataMap.set(dayName, (chartDataMap.get(dayName) || 0) + 1);
        }
    });

    const chartData = Array.from(chartDataMap.entries()).map(([name, count]) => ({ name, count }));

    // Resolution Stats
    const resolutionStats = await prisma.ticketItem.groupBy({
        by: ['resolution'],
        where: {
            ...orgFilter,
            resolution: { not: null }
        },
        _count: {
            resolution: true
        }
    });

    const resolutionData = resolutionStats.map(stat => ({
        name: stat.resolution || 'Unknown',
        value: stat._count.resolution
    }));

    // Top Defective Brands
    const itemsWithBrands = await prisma.ticketItem.findMany({
        where: { ...orgFilter },
        select: {
            product: {
                select: { brand: true }
            }
        }
    });

    const brandCounts: Record<string, number> = {};
    itemsWithBrands.forEach(item => {
        const brand = item.product.brand;
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    const brandData = Object.entries(brandCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        totalOpenTickets,
        pendingCompanyAction,
        readyForDelivery,
        activeCustomers,
        recentActivity,
        chartData,
        resolutionData,
        brandData
    };
}
