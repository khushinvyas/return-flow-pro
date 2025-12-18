'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, Printer, User, Package, AlertCircle, Search, AlertTriangle, CheckCircle2, History, Phone, Building2, ExternalLink, Box } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type FilterType = 'all' | 'critical' | 'warning' | 'safe';

// ============================================================================
// STYLES (Matching TicketDetail.tsx pattern)
// ============================================================================
const styles = {
    // Grid Layout
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '24px',
        alignItems: 'start',
    },
    // Side Panel Cards
    sideCard: {
        background: 'hsl(var(--card))',
        borderRadius: '16px',
        border: '1px solid hsl(var(--border))',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    cardHeader: {
        padding: '16px 20px',
        borderBottom: '1px solid hsl(var(--border))',
        background: 'hsl(var(--card))',
    },
    cardTitle: {
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        color: 'hsl(var(--secondary-foreground))',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    cardContent: {
        padding: '20px',
    },
    // Stats
    statItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 0',
        borderBottom: '1px solid hsl(var(--border))',
    },
    statLabel: {
        fontSize: '14px',
        color: 'hsl(var(--secondary-foreground))',
        fontWeight: 500,
    },
    statValue: {
        fontSize: '24px',
        fontWeight: 700,
        color: 'hsl(var(--foreground))',
    },
    // Main Content
    mainCard: {
        background: 'hsl(var(--card))',
        borderRadius: '16px',
        border: '1px solid hsl(var(--border))',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    // Company List Item
    companyItem: {
        padding: '20px',
        borderBottom: '1px solid hsl(var(--border))',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    // Product Card
    productCard: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 120px',
        gap: '16px',
        alignItems: 'center',
        padding: '16px 20px',
        background: 'hsl(var(--background))',
        borderRadius: '12px',
        border: '1px solid hsl(var(--border))',
        marginBottom: '12px',
    },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function VendorInventoryClient({ data }: { data: any[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [expandedCompany, setExpandedCompany] = useState<number | null>(null);

    // --- SMART FILTERING ENGINE ---
    const filteredData = useMemo(() => {
        return data.map(group => {
            const matchingItems = group.items.filter((item: any) => {
                const batchDate = item.batchDate ? new Date(item.batchDate) : new Date(item.updatedAt);
                const diffTime = Math.abs(new Date().getTime() - batchDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                const searchLower = searchQuery.toLowerCase();
                const matchesSearch =
                    !searchQuery ||
                    item.serialNumber?.toLowerCase().includes(searchLower) ||
                    item.product.name.toLowerCase().includes(searchLower) ||
                    item.ticket.customer.name.toLowerCase().includes(searchLower) ||
                    group.company.name.toLowerCase().includes(searchLower);

                let matchesFilter = true;
                if (activeFilter === 'critical') matchesFilter = diffDays > 30;
                else if (activeFilter === 'warning') matchesFilter = diffDays > 15 && diffDays <= 30;
                else if (activeFilter === 'safe') matchesFilter = diffDays <= 15;

                return matchesSearch && matchesFilter;
            });

            return { ...group, items: matchingItems };
        }).filter(group => group.items.length > 0);
    }, [data, searchQuery, activeFilter]);

    // Stats
    const totalItems = data.reduce((acc, g) => acc + g.items.length, 0);
    const criticalItems = data.flatMap(g => g.items).filter((i: any) => {
        const d = i.batchDate ? new Date(i.batchDate) : new Date(i.updatedAt);
        const days = Math.ceil(Math.abs(new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        return days > 30;
    }).length;
    const warningItems = data.flatMap(g => g.items).filter((i: any) => {
        const d = i.batchDate ? new Date(i.batchDate) : new Date(i.updatedAt);
        const days = Math.ceil(Math.abs(new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        return days > 15 && days <= 30;
    }).length;

    // Empty State
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-dashed border-slate-200">
                <div className="bg-emerald-50 p-6 rounded-full mb-6">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">All Clear!</h3>
                <p className="text-slate-500 max-w-sm text-center mt-2">
                    No items are currently pending at any vendor.
                </p>
            </div>
        );
    }

    return (
        <div style={styles.gridContainer} className="vendor-inventory-grid">
            {/* ==================== LEFT SIDEBAR ==================== */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Stats Card */}
                <div style={styles.sideCard}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardTitle}>
                            <History size={14} />
                            Overview
                        </div>
                    </div>
                    <div style={styles.cardContent}>
                        <div style={{ ...styles.statItem, paddingTop: 0 }}>
                            <span style={styles.statLabel}>Active Vendors</span>
                            <span style={styles.statValue}>{data.length}</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>Total Pending</span>
                            <span style={styles.statValue}>{totalItems}</span>
                        </div>
                        <div style={{ ...styles.statItem, borderBottom: 'none', paddingBottom: 0 }}>
                            <span style={styles.statLabel}>Critical Items</span>
                            <span style={{ ...styles.statValue, color: criticalItems > 0 ? 'hsl(var(--error))' : 'hsl(var(--foreground))' }}>
                                {criticalItems}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Filters Card */}
                <div style={styles.sideCard}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardTitle}>
                            <AlertTriangle size={14} />
                            Quick Filters
                        </div>
                    </div>
                    <div style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <FilterButton
                                label="All Items"
                                count={totalItems}
                                isActive={activeFilter === 'all'}
                                onClick={() => setActiveFilter('all')}
                            />
                            <FilterButton
                                label="Critical (>30d)"
                                count={criticalItems}
                                isActive={activeFilter === 'critical'}
                                onClick={() => setActiveFilter('critical')}
                                color="red"
                            />
                            <FilterButton
                                label="Warning (15-30d)"
                                count={warningItems}
                                isActive={activeFilter === 'warning'}
                                onClick={() => setActiveFilter('warning')}
                                color="amber"
                            />
                            <FilterButton
                                label="Safe (<15d)"
                                count={totalItems - criticalItems - warningItems}
                                isActive={activeFilter === 'safe'}
                                onClick={() => setActiveFilter('safe')}
                                color="emerald"
                            />
                        </div>
                    </div>
                </div>

                {/* Status Legend */}
                <div style={styles.sideCard}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardTitle}>
                            <Box size={14} />
                            Status Legend
                        </div>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <LegendItem color="emerald" label="Safe" description="< 15 days" />
                            <LegendItem color="amber" label="Warning" description="15-30 days" />
                            <LegendItem color="red" label="Critical" description="> 30 days" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== MAIN CONTENT ==================== */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Search Bar */}
                <div style={styles.mainCard}>
                    <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'hsl(var(--secondary-foreground))'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Search by serial number, product, customer, or vendor..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 44px',
                                    borderRadius: '10px',
                                    border: '1px solid hsl(var(--border))',
                                    background: 'hsl(var(--background))',
                                    fontSize: '14px',
                                    outline: 'none',
                                    color: 'hsl(var(--foreground))',
                                }}
                            />
                        </div>
                        <div style={{ fontSize: '13px', color: 'hsl(var(--secondary-foreground))', whiteSpace: 'nowrap' }}>
                            {filteredData.length} of {data.length} vendors
                        </div>
                    </div>
                </div>

                {/* Companies List */}
                <div style={styles.mainCard}>
                    <div style={styles.cardHeader}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={styles.cardTitle}>
                                <Building2 size={14} />
                                Service Centers
                            </div>
                            <Badge variant="default">{filteredData.reduce((acc, g) => acc + g.items.length, 0)} Items</Badge>
                        </div>
                    </div>

                    {filteredData.length > 0 ? (
                        <div>
                            {filteredData.map((group) => (
                                <CompanySection
                                    key={group.company.id}
                                    group={group}
                                    isExpanded={expandedCompany === group.company.id}
                                    onToggle={() => setExpandedCompany(expandedCompany === group.company.id ? null : group.company.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                            <Search size={40} style={{ color: 'hsl(var(--secondary-foreground))', margin: '0 auto 16px', opacity: 0.3 }} />
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '8px' }}>
                                No results found
                            </h3>
                            <p style={{ fontSize: '14px', color: 'hsl(var(--secondary-foreground))', marginBottom: '20px' }}>
                                Try adjusting your search or filter criteria.
                            </p>
                            <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Responsive Styles */}
            <style jsx global>{`
                .vendor-inventory-grid {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 24px;
                    align-items: start;
                }
                @media (max-width: 1024px) {
                    .vendor-inventory-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function FilterButton({ label, count, isActive, onClick, color = 'indigo' }: any) {
    const bgColors: any = {
        indigo: isActive ? 'hsl(var(--primary))' : 'hsl(var(--background))',
        red: isActive ? 'hsl(var(--error))' : 'hsl(var(--background))',
        amber: isActive ? '#f59e0b' : 'hsl(var(--background))',
        emerald: isActive ? '#10b981' : 'hsl(var(--background))',
    };
    const textColors: any = {
        indigo: isActive ? 'white' : 'hsl(var(--foreground))',
        red: isActive ? 'white' : 'hsl(var(--foreground))',
        amber: isActive ? 'white' : 'hsl(var(--foreground))',
        emerald: isActive ? 'white' : 'hsl(var(--foreground))',
    };

    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: isActive ? 'none' : '1px solid hsl(var(--border))',
                background: bgColors[color],
                color: textColors[color],
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
            }}
        >
            <span>{label}</span>
            <span style={{
                background: isActive ? 'rgba(255,255,255,0.2)' : 'hsl(var(--background))',
                padding: '2px 10px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
            }}>
                {count}
            </span>
        </button>
    );
}

function LegendItem({ color, label, description }: { color: string; label: string; description: string }) {
    const colors: any = {
        emerald: '#10b981',
        amber: '#f59e0b',
        red: 'hsl(var(--error))',
    };
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: colors[color] }} />
            <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>{label}</span>
                <span style={{ fontSize: '12px', color: 'hsl(var(--secondary-foreground))', marginLeft: '8px' }}>{description}</span>
            </div>
        </div>
    );
}

function CompanySection({ group, isExpanded, onToggle }: { group: any; isExpanded: boolean; onToggle: () => void }) {
    const { company, items } = group;

    return (
        <div style={{ borderBottom: '1px solid hsl(var(--border))' }}>
            {/* Company Header */}
            <div
                onClick={onToggle}
                style={{
                    ...styles.companyItem,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isExpanded ? 'hsl(var(--background))' : 'transparent',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: isExpanded ? 'hsl(var(--primary))' : 'hsl(var(--background))',
                        color: isExpanded ? 'white' : 'hsl(var(--secondary-foreground))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        transition: 'all 0.2s',
                    }}>
                        {company.name.charAt(0)}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '4px' }}>
                            {company.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'hsl(var(--secondary-foreground))' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Package size={14} />
                                {items.length} item{items.length !== 1 ? 's' : ''}
                            </span>
                            {company.phone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Phone size={14} />
                                    {company.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/reports/vendor-inventory/${company.id}/print`, '_blank');
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Printer size={14} />
                        <span className="hidden sm:inline">Print</span>
                    </Button>
                    <ChevronDown
                        size={20}
                        style={{
                            color: 'hsl(var(--secondary-foreground))',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s',
                        }}
                    />
                </div>
            </div>

            {/* Items List */}
            {isExpanded && (
                <div style={{ padding: '0 20px 20px', background: 'hsl(var(--background))' }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 120px',
                        gap: '16px',
                        padding: '12px 20px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'hsl(var(--secondary-foreground))',
                        borderBottom: '1px solid hsl(var(--border))',
                        marginBottom: '12px',
                    }}>
                        <div>Product</div>
                        <div>Identifiers</div>
                        <div>Customer</div>
                        <div style={{ textAlign: 'right' }}>Status</div>
                    </div>

                    {/* Items */}
                    {items.map((item: any) => {
                        const batchDate = item.batchDate ? new Date(item.batchDate) : new Date(item.updatedAt);
                        const diffTime = Math.abs(new Date().getTime() - batchDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const statusColor = diffDays > 30 ? 'error' : diffDays > 15 ? 'warning' : 'success';

                        return (
                            <div key={item.id} style={styles.productCard}>
                                {/* Product */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Package size={16} style={{ color: 'hsl(var(--secondary-foreground))' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                                            {item.product.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'hsl(var(--secondary-foreground))' }}>
                                            {item.product.brand}
                                        </div>
                                    </div>
                                </div>

                                {/* Identifiers */}
                                <div>
                                    <div style={{ fontSize: '12px', color: 'hsl(var(--secondary-foreground))', marginBottom: '4px' }}>
                                        SN: <span style={{ fontFamily: 'monospace', color: 'hsl(var(--foreground))' }}>{item.serialNumber}</span>
                                    </div>
                                    <a
                                        href={`/tickets/${item.ticket.id}`}
                                        style={{ fontSize: '12px', color: 'hsl(var(--primary))', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        TKT #{item.ticket.ticketNumber || item.ticket.id}
                                        <ExternalLink size={10} />
                                    </a>
                                </div>

                                {/* Customer */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'hsl(var(--primary))',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                    }}>
                                        {item.ticket.customer.name.charAt(0)}
                                    </div>
                                    <span style={{ fontSize: '13px', color: 'hsl(var(--foreground))' }}>
                                        {item.ticket.customer.name}
                                    </span>
                                </div>

                                {/* Status */}
                                <div style={{ textAlign: 'right' }}>
                                    <Badge variant={statusColor} style={{ fontSize: '11px' }}>
                                        {diffDays}d pending
                                    </Badge>
                                    <div style={{ fontSize: '11px', color: 'hsl(var(--secondary-foreground))', marginTop: '4px' }}>
                                        {batchDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
