import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Truck, ChevronRight, Package, AlertTriangle, Clock } from 'lucide-react';

async function getData(organizationId: string) {
    const batches = await prisma.companyBatch.findMany({
        where: {
            company: { organizationId },
            items: {
                some: { status: 'SENT_TO_COMPANY' }
            }
        },
        select: {
            dateSent: true,
            company: { select: { id: true, name: true } },
            items: {
                where: { status: 'SENT_TO_COMPANY' },
                select: { id: true, updatedAt: true }
            }
        }
    });

    // Group by company with oldest item date
    const companyCounts = batches.reduce((acc, batch) => {
        const companyId = batch.company.id;
        if (!acc[companyId]) {
            acc[companyId] = {
                id: companyId,
                name: batch.company.name,
                count: 0,
                oldestDate: batch.dateSent || new Date(),
            };
        }
        acc[companyId].count += batch.items.length;
        // Track oldest date
        const batchDate = batch.dateSent || new Date();
        if (batchDate < acc[companyId].oldestDate) {
            acc[companyId].oldestDate = batchDate;
        }
        return acc;
    }, {} as Record<number, { id: number, name: string, count: number, oldestDate: Date }>);

    return Object.values(companyCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
}

export default async function VendorInventoryWidget({ organizationId }: { organizationId: string }) {
    const data = await getData(organizationId);
    const totalItems = data.reduce((acc, c) => acc + c.count, 0);

    if (data.length === 0) return null;

    return (
        <div style={{
            background: 'hsl(var(--card))',
            borderRadius: '16px',
            border: '1px solid hsl(var(--border))',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid hsl(var(--border))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Truck size={16} color="white" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))', margin: 0 }}>
                            Pending Inventory
                        </h3>
                        <p style={{ fontSize: '11px', color: 'hsl(var(--secondary-foreground))', margin: 0 }}>
                            At service centers
                        </p>
                    </div>
                </div>
                <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: totalItems > 5 ? 'hsl(var(--error) / 0.1)' : 'hsl(var(--primary) / 0.1)',
                    color: totalItems > 5 ? 'hsl(var(--error))' : 'hsl(var(--primary))',
                    fontSize: '13px',
                    fontWeight: 700,
                }}>
                    {totalItems} items
                </div>
            </div>

            {/* Company List */}
            <div style={{ padding: '12px' }}>
                {data.map((company) => {
                    const now = new Date();
                    const oldestDate = new Date(company.oldestDate);
                    const daysOld = Math.ceil((now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
                    const isCritical = daysOld > 30;
                    const isWarning = daysOld > 15 && daysOld <= 30;

                    return (
                        <div key={company.id} style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            background: 'hsl(var(--background))',
                            marginBottom: '8px',
                            border: '1px solid hsl(var(--border))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: isCritical ? 'hsl(var(--error) / 0.1)' : isWarning ? '#fef3c7' : 'hsl(var(--primary) / 0.1)',
                                    color: isCritical ? 'hsl(var(--error))' : isWarning ? '#b45309' : 'hsl(var(--primary))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                }}>
                                    {company.name.charAt(0)}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: 'hsl(var(--foreground))',
                                        margin: 0,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        {company.name}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                        <span style={{ fontSize: '11px', color: 'hsl(var(--secondary-foreground))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Package size={10} /> {company.count} items
                                        </span>
                                        {isCritical && (
                                            <span style={{ fontSize: '10px', color: 'hsl(var(--error))', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                                                <AlertTriangle size={10} /> {daysOld}d
                                            </span>
                                        )}
                                        {isWarning && !isCritical && (
                                            <span style={{ fontSize: '10px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                                                <Clock size={10} /> {daysOld}d
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Link
                                href={`/reports/vendor-inventory`}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    background: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'hsl(var(--secondary-foreground))',
                                    textDecoration: 'none',
                                    flexShrink: 0,
                                }}
                            >
                                <ChevronRight size={14} />
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div style={{
                padding: '12px 20px',
                borderTop: '1px solid hsl(var(--border))',
                background: 'hsl(var(--background))',
            }}>
                <Link
                    href="/reports/vendor-inventory"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: 'hsl(var(--primary))',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                    }}
                >
                    View Full Report
                    <ChevronRight size={14} />
                </Link>
            </div>
        </div>
    );
}
