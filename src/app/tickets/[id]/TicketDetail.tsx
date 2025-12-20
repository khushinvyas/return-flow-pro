'use client';

import { useActionState, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { updateItemStage3, updateItemStage4, undoBatchItem } from '@/app/actions/ticket';
import { createBatch } from '@/app/actions/batch';
import {
    Printer, PackageCheck, UserCheck, ChevronDown, ChevronUp, Truck, User,
    MapPin, Phone, Mail, Clock, Calendar, AlertCircle, CheckCircle2,
    FileText, History, Package, Sparkles, ExternalLink, Copy, Shield, Zap, Plus
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import StatusBadge from '@/components/StatusBadge';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/separator';

// ============================================================================
// STYLES (Refactored for Dark Mode with CSS Variables)
// ============================================================================

const styles = {
    // Hero Header
    heroContainer: {
        position: 'relative' as const,
        overflow: 'hidden',
        borderRadius: 'var(--radius)',
        background: 'var(--hero-gradient)',
        padding: '32px',
        boxShadow: 'var(--shadow-colored)',
        marginBottom: '32px',
    },
    heroPattern: {
        position: 'absolute' as const,
        inset: 0,
        opacity: 0.1,
        pointerEvents: 'none' as const,
    },
    heroContent: {
        position: 'relative' as const,
        zIndex: 10,
    },
    ticketBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        borderRadius: '9999px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: '16px',
    },
    pulseDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#34d399',
        animation: 'pulse 2s infinite',
    },
    heroTitle: {
        fontSize: '32px',
        fontWeight: 700,
        color: 'white',
        letterSpacing: '-0.5px',
        marginBottom: '16px',
    },
    heroMeta: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '16px',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '14px',
    },
    statusCard: {
        padding: '10px 20px',
        background: 'hsl(var(--card))',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-lg)',
        display: 'inline-block',
        marginLeft: '16px',
    },
    // Grid Layout
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: '300px 1fr 300px',
        gap: '24px',
        alignItems: 'start',
    },
    // Cards
    sideCard: {
        background: 'hsl(var(--card))',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
        border: '1px solid hsl(var(--border))',
    },
    cardAccent: {
        height: '4px',
        background: 'var(--hero-gradient)',
    },
    cardHeader: {
        padding: '16px 20px 12px',
        borderBottom: '1px solid hsl(var(--border))',
    },
    cardTitle: {
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        color: 'hsl(var(--secondary-foreground))',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    cardContent: {
        padding: '20px',
    },
    // Customer Avatar
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'var(--hero-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: '16px',
        flexShrink: 0,
    },
    // Contact Button
    contactButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '10px',
        transition: 'background 0.2s',
        textDecoration: 'none',
        color: 'hsl(var(--foreground))',
    },
    contactIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'hsl(var(--secondary))',
    },
    // Product Card
    productCard: {
        background: 'hsl(var(--card))',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
        border: '1px solid hsl(var(--border))',
        marginBottom: '16px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid hsl(var(--border))',
    },
    infoLabel: {
        fontSize: '14px',
        color: 'hsl(var(--secondary-foreground))',
    },
    '@media (max-width: 1024px)': {
        gridContainer: {
            gridTemplateColumns: '1fr',
        },
    },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TicketDetail({ ticket, companies }: { ticket: any, companies: any[] }) {
    return (
        <div style={{ paddingBottom: '48px' }}>
            {/* HER0 HEADER */}
            <div style={styles.heroContainer}>
                {/* Background Pattern */}
                <div style={styles.heroPattern}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '300px', height: '300px', background: 'white', borderRadius: '50%',
                        filter: 'blur(80px)', transform: 'translate(-50%, -50%)', opacity: 0.2
                    }} />
                    <div style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: '400px', height: '400px', background: 'white', borderRadius: '50%',
                        filter: 'blur(80px)', transform: 'translate(30%, 30%)', opacity: 0.2
                    }} />
                </div>

                {/* Content */}
                <div style={styles.heroContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                        <div>
                            <div style={styles.ticketBadge}>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 600, color: 'white' }}>
                                    Ticket #{ticket.ticketNumber || ticket.id}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                                <h1 style={styles.heroTitle}>Service Request</h1>
                                <div style={styles.statusCard}>
                                    <Badge
                                        variant={ticket.status === 'COMPLETED' ? 'success' : 'error'}
                                        style={{ fontSize: '14px', padding: '6px 16px', textTransform: 'capitalize' }}
                                    >
                                        {ticket.status.toLowerCase().replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            <div style={styles.heroMeta}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={14} />
                                    <span>Last updated {formatDate(ticket.updatedAt)}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Package size={14} />
                                    <span>{ticket.items.length} item{ticket.items.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={14} />
                                    <span>{ticket.customer.name}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['INWARD', 'OUTWARD'].map(type => (
                                <a key={type}
                                    href={`/tickets/${ticket.id}/print?type=${type}`}
                                    target="_blank"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 16px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '10px',
                                        color: 'white', fontSize: '14px', fontWeight: 500,
                                        textDecoration: 'none', transition: 'all 0.2s',
                                    }}
                                >
                                    {type === 'INWARD' ? <Printer size={16} /> : <FileText size={16} />}
                                    {type === 'INWARD' ? 'Receipt' : 'Invoice'}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* GRID CONTENT */}
            <div className="ticket-detail-grid">
                {/* LEFT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Customer Card */}
                    <div style={styles.sideCard}>
                        <div style={styles.cardAccent} />
                        <div style={styles.cardHeader}>
                            <div style={styles.cardTitle}><User size={14} /> Customer</div>
                        </div>
                        <div style={styles.cardContent}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                                <div style={styles.avatar}>{getInitials(ticket.customer.name)}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '2px' }}>{ticket.customer.name}</h3>
                                    <p style={{ fontSize: '12px', color: 'hsl(var(--secondary-foreground))' }}>Customer</p>
                                </div>
                            </div>
                            <Separator className="my-4" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {ticket.customer.email && (
                                    <a href={`mailto:${ticket.customer.email}`} style={styles.contactButton}>
                                        <div style={styles.contactIcon}><Mail size={14} className="text-blue-500" /></div>
                                        <span style={{ fontSize: '14px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.customer.email}</span>
                                    </a>
                                )}
                                <a href={`tel:${ticket.customer.phone}`} style={styles.contactButton}>
                                    <div style={styles.contactIcon}><Phone size={14} className="text-green-500" /></div>
                                    <span style={{ fontSize: '14px', flex: 1 }}>{ticket.customer.phone}</span>
                                </a>
                            </div>
                            <Separator className="my-4" />
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={styles.contactIcon}><MapPin size={14} className="text-orange-500" /></div>
                                <p style={{ fontSize: '14px', color: 'hsl(var(--foreground))', lineHeight: 1.6 }}>{ticket.customer.address || "No address"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reception Info */}
                    <div style={styles.sideCard}>
                        <div style={styles.cardHeader}>
                            <div style={styles.cardTitle}><FileText size={14} /> Reception Info</div>
                        </div>
                        <div style={styles.cardContent}>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Received Method</span>
                                <Badge variant={ticket.receiptMethod === 'HAND_ON' ? 'blue' : 'purple'}>
                                    {ticket.receiptMethod === 'HAND_ON' ? '🤝 Hand-on' : '📦 Courier'}
                                </Badge>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Received By</span>
                                <span style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>Admin</span>
                            </div>
                            <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
                                <span style={styles.infoLabel}>Created</span>
                                <span style={{ fontWeight: 600, color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={12} style={{ color: 'hsl(var(--secondary-foreground))' }} />
                                    {formatDate(ticket.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER COLUMN: Items */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'hsl(var(--secondary))' }}>
                                <Package size={16} style={{ color: 'hsl(var(--primary))' }} />
                            </span>
                            Product Items
                            <span style={{ padding: '4px 10px', background: 'hsl(var(--secondary))', borderRadius: '99px', fontSize: '14px', fontWeight: 500, color: 'hsl(var(--secondary-foreground))' }}>
                                {ticket.items.length}
                            </span>
                        </h2>
                    </div>

                    {ticket.items.map((item: any) => (
                        <TicketItemCard key={item.id} item={item} ticketId={ticket.id} companies={companies} />
                    ))}

                    {ticket.items.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '64px 32px', border: '2px dashed hsl(var(--border))', borderRadius: '16px', background: 'hsl(var(--card))' }}>
                            <p style={{ fontWeight: 500, color: 'hsl(var(--secondary-foreground))' }}>No items yet</p>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={styles.sideCard}>
                        <div style={{ ...styles.cardHeader, borderBottom: '1px solid hsl(var(--border))' }}>
                            <div style={styles.cardTitle}><History size={14} /> Activity Timeline</div>
                        </div>
                        <div style={{ ...styles.cardContent, maxHeight: '500px', overflowY: 'auto' }}>
                            {ticket.events && ticket.events.length > 0 ? (
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: '11px', top: '8px', bottom: '8px', width: '2px',
                                        background: 'linear-gradient(180deg, hsl(var(--primary) / 0.3), hsl(var(--border)), transparent)'
                                    }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        {ticket.events.map((event: any, idx: number) => (
                                            <TimelineItem key={event.id} event={event} isFirst={idx === 0} />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'hsl(var(--secondary-foreground))' }}>
                                    <p>No activity yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TimelineItem({ event, isFirst }: { event: any; isFirst: boolean }) {
    const getEventConfig = (type: string) => {
        switch (type) {
            case 'STATUS_CHANGE': return { icon: <Zap size={12} />, color: 'hsl(var(--primary))', bgColor: 'hsl(var(--primary) / 0.1)', label: 'Status Update' };
            case 'CREATED': return { icon: <Sparkles size={12} />, color: 'hsl(var(--success))', bgColor: 'hsl(var(--success) / 0.1)', label: 'Created' };
            default: return { icon: <AlertCircle size={12} />, color: 'hsl(var(--secondary-foreground))', bgColor: 'hsl(var(--secondary))', label: 'Event' };
        }
    };
    const config = getEventConfig(event.type);
    return (
        <div style={{ position: 'relative', paddingLeft: '32px' }}>
            <div style={{
                position: 'absolute', left: 0, top: '4px', width: '24px', height: '24px', borderRadius: '50%',
                background: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', boxShadow: '0 0 0 4px hsl(var(--card))'
            }}>{config.icon}</div>
            <div style={{ padding: '12px', borderRadius: '12px', background: config.bgColor }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>{config.label}</span>
                    <span style={{ fontSize: '10px', color: 'hsl(var(--secondary-foreground))' }}>{formatDate(event.createdAt, true)}</span>
                </div>
                {event.description && <p style={{ fontSize: '12px', color: 'hsl(var(--foreground))' }}>{event.description}</p>}
                {event.user && <div style={{ fontSize: '10px', color: 'hsl(var(--secondary-foreground))', marginTop: '4px' }}>{event.user.name}</div>}
            </div>
        </div>
    );
}

function TicketItemCard({ item, ticketId, companies }: { item: any, ticketId: number, companies: any[] }) {
    const [expanded, setExpanded] = useState(false);
    const hasActions = ['RECEIVED', 'SENT_TO_COMPANY', 'RECEIVED_FROM_COMPANY'].includes(item.status);
    return (
        <div style={styles.productCard}>
            <div style={{ height: '4px', background: 'var(--hero-gradient)' }} />
            <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={24} className="text-gray-500" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '18px', color: 'hsl(var(--foreground))' }}>{item.product.name}</h3>
                                <Badge variant="outline">{item.product.brand}</Badge>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--secondary-foreground))' }}>S/N</span>
                                <code style={{ fontSize: '14px', background: 'hsl(var(--secondary))', padding: '2px 8px', borderRadius: '4px' }}>{item.serialNumber}</code>
                            </div>
                        </div>
                    </div>
                    <StatusBadge status={item.status} />
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'hsl(var(--secondary))', marginBottom: '20px', border: '1px solid hsl(var(--border))' }}>
                    <p style={{ fontSize: '14px', color: 'hsl(var(--foreground))' }}>{item.issueDescription}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: item.isUnderWarranty ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--error) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={18} style={{ color: item.isUnderWarranty ? 'hsl(var(--success))' : 'hsl(var(--error))' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: 'hsl(var(--secondary-foreground))' }}>Warranty</p>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: item.isUnderWarranty ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>{item.isUnderWarranty ? 'Active' : 'Expired'}</p>
                        </div>
                    </div>
                    {item.companyBatch && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'hsl(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Truck size={18} style={{ color: 'hsl(var(--primary))' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: 'hsl(var(--secondary-foreground))' }}>Vendor</p>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>{item.companyBatch.company.name}</p>
                                <p style={{ fontSize: '11px', color: 'hsl(var(--secondary-foreground))', marginBottom: '4px' }}>
                                    {item.companyBatch.courierName
                                        ? `via ${item.companyBatch.courierName} ${item.companyBatch.trackingNumber ? `(${item.companyBatch.trackingNumber})` : ''}`
                                        : 'via Hand-on'
                                    }
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    {item.status === 'SENT_TO_COMPANY' && <UndoBatchItemForm item={item} ticketId={ticketId} />}
                                    <a href={`/tickets/${ticketId}/print?type=CHALLAN&companyId=${item.companyBatch.companyId}`} target="_blank" style={{ fontSize: '10px', fontWeight: 600, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Printer size={10} /> Challan
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {hasActions && (
                <div style={{ borderTop: '1px solid hsl(var(--border))' }}>
                    <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--secondary-foreground))', fontWeight: 600 }}>
                        <span style={{ display: 'flex', gap: '8px' }}><Sparkles size={14} /> {expanded ? 'Hide' : 'Action'}</span>
                        <ChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    {expanded && (
                        <div style={{ padding: '0 24px 24px' }}>
                            {item.status === 'RECEIVED' && <SendToCompanyForm item={item} ticketId={ticketId} companies={companies} />}
                            {item.status === 'SENT_TO_COMPANY' && <ReceiveFromCompanyForm item={item} ticketId={ticketId} />}
                            {item.status === 'RECEIVED_FROM_COMPANY' && <ReturnToCustomerForm item={item} ticketId={ticketId} />}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function SendToCompanyForm({ item, ticketId, companies }: { item: any, ticketId: number, companies: any[] }) {
    const [state, action, isPending] = useActionState(createBatch, { message: '' });
    const searchParams = useSearchParams();
    const initialCompanyId = searchParams.get('initialCompanyId');
    const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId || '');
    const [dispatchMethod, setDispatchMethod] = useState('HAND_ON');
    const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]); // Today's date

    // Sync with URL if user returns with a new company ID
    useEffect(() => {
        if (initialCompanyId) {
            setSelectedCompanyId(initialCompanyId);
        }
    }, [initialCompanyId]);

    return (
        <form action={action} style={{ padding: '20px', background: 'hsl(var(--secondary))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}>
            <input type="hidden" name="itemIds" value={JSON.stringify([item.id])} />
            <input type="hidden" name="ticketId" value={ticketId} />
            <input type="hidden" name="dispatchMethod" value={dispatchMethod} />
            <h5 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--primary))', marginBottom: '16px' }}>
                <Truck size={16} /> Send to Service Center
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Company Selection */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                        name="companyId"
                        required
                        value={selectedCompanyId}
                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                        className="input"
                        style={{ flex: 1 }}
                    >
                        <option value="">Select Vendor...</option>
                        {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <Button
                        href={`/companies/new?returnTo=/tickets/${ticketId}`}
                        title="Add New Vendor"
                        style={{ padding: '0 12px' }}
                    >
                        <Plus size={16} />
                    </Button>
                </div>

                {/* Dispatch Method & Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '12px', color: 'hsl(var(--secondary-foreground))', marginBottom: '4px', display: 'block' }}>Dispatch Method</label>
                        <select
                            value={dispatchMethod}
                            onChange={(e) => setDispatchMethod(e.target.value)}
                            className="input"
                            style={{ width: '100%' }}
                        >
                            <option value="HAND_ON">🤝 Hand Delivery</option>
                            <option value="COURIER">📦 Courier</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: 'hsl(var(--secondary-foreground))', marginBottom: '4px', display: 'block' }}>Dispatch Date</label>
                        <input
                            type="date"
                            name="dateSent"
                            value={dispatchDate}
                            onChange={(e) => setDispatchDate(e.target.value)}
                            className="input"
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                {/* Courier Fields (only visible when COURIER is selected) */}
                {dispatchMethod === 'COURIER' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Input name="courierName" placeholder="Courier Name" required />
                        <Input name="trackingNumber" placeholder="Tracking No." />
                    </div>
                )}

                {/* Dispatch Note */}
                <textarea
                    name="dispatchNote"
                    placeholder="Dispatch Note / Instructions..."
                    className="input"
                    style={{ minHeight: '60px', fontFamily: 'inherit' }}
                />
            </div>
            <Button type="submit" disabled={isPending} isLoading={isPending} style={{ width: '100%', marginTop: '16px' }}>Dispatch Item</Button>
        </form>
    );
}

function ReceiveFromCompanyForm({ item, ticketId }: { item: any, ticketId: number }) {
    const [state, action, isPending] = useActionState(updateItemStage3, { message: '' });
    const [resolution, setResolution] = useState('REPAIRED');
    return (
        <form action={action} style={{ padding: '20px', background: 'hsl(var(--secondary))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}>
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="ticketId" value={ticketId} />
            <h5 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--primary))', marginBottom: '16px' }}>
                <PackageCheck size={16} /> Process Vendor Return
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <select name="resolution" value={resolution} onChange={(e) => setResolution(e.target.value)} className="input">
                    <option value="REPAIRED">✓ Repaired</option>
                    <option value="REPLACED">↻ Replaced</option>
                    <option value="REJECTED">✗ Rejected</option>
                </select>
                <Input name="repairCost" type="number" step="0.01" placeholder="Cost" />
            </div>
            {resolution === 'REPLACED' && <Input name="newSerialNumber" placeholder="New Serial Number" required className="mb-4" />}
            <textarea name="companyResolutionDescription" className="input" style={{ minHeight: '80px' }} placeholder="Notes..." />
            <Button type="submit" disabled={isPending} isLoading={isPending} style={{ width: '100%', marginTop: '16px' }}>Complete Intake</Button>
        </form>
    );
}

function ReturnToCustomerForm({ item, ticketId }: { item: any, ticketId: number }) {
    const [state, action, isPending] = useActionState(updateItemStage4, { message: '' });
    const [returnMethod, setReturnMethod] = useState('HAND_ON');
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]); // Today's date

    return (
        <form action={action} style={{ padding: '20px', background: 'hsl(var(--secondary))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}>
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="ticketId" value={ticketId} />
            <h5 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--success))', marginBottom: '16px' }}>
                <UserCheck size={16} /> Return to Customer
            </h5>

            {/* Row 1: Return Method + Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                    <label style={{ fontSize: '12px', color: 'hsl(var(--secondary-foreground))', marginBottom: '4px', display: 'block' }}>Return Method</label>
                    <select name="returnMethod" value={returnMethod} onChange={(e) => setReturnMethod(e.target.value)} className="input" style={{ width: '100%' }}>
                        <option value="HAND_ON">🤝 Hand-on</option>
                        <option value="COURIER">📦 Courier</option>
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '12px', color: 'hsl(var(--secondary-foreground))', marginBottom: '4px', display: 'block' }}>Return Date</label>
                    <input
                        type="date"
                        name="dateReturnedToCustomer"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="input"
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {/* Row 2: Cost + Tracking (if courier) */}
            <div style={{ display: 'grid', gridTemplateColumns: returnMethod === 'COURIER' ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '12px' }}>
                <Input name="finalCost" type="number" step="0.01" placeholder="Final Cost" />
                {returnMethod === 'COURIER' && <Input name="returnTrackingNumber" placeholder="Tracking Number" required />}
            </div>

            {/* Notes */}
            <textarea name="customerReturnDescription" className="input" style={{ minHeight: '80px' }} placeholder="Final Notes..." />
            <Button type="submit" disabled={isPending} isLoading={isPending} style={{ width: '100%', marginTop: '16px', background: 'hsl(var(--success))' }}>Complete & Return</Button>
        </form>
    );
}

function UndoBatchItemForm({ item, ticketId }: { item: any, ticketId: number }) {
    const [state, action, isPending] = useActionState(undoBatchItem, { message: '' });
    return (
        <form action={action}>
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="ticketId" value={ticketId} />
            <button type="submit" disabled={isPending} style={{ fontSize: '10px', color: 'hsl(var(--error))', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                {isPending ? '...' : 'Undo'}
            </button>
        </form>
    );
}

function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(date: string | Date | null | undefined, includeTime = false): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
    });
}
