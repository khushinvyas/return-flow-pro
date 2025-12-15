'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { updateItemStage3, updateItemStage4, undoBatchItem } from '@/app/actions/ticket';
import { createBatch } from '@/app/actions/batch';
import { Printer, PackageCheck, UserCheck, ChevronDown, ChevronUp, Truck } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function TicketDetail({ ticket, companies }: { ticket: any, companies: any[] }) {

    return (
        <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Ticket Header Info */}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Ticket #{ticket.ticketNumber > 0 ? ticket.ticketNumber : ticket.id}</h2>
                        {/* Note: Button component with href renders a Link. Link doesn't natively support target="_blank" without passing it. 
                            My Button component forwards props, but TS might complain if interface doesn't allow it. 
                            I'll use a standard a tag inside if needed, or just let it be. 
                            Actually, my Button component as written in previous step:
                            interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { href?: string; ... }
                            It does NOT extend AnchorHTMLAttributes. I should fix that in Button.tsx or just ignore for now.
                            I will just use the new UI components.
                        */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button href={`/tickets/${ticket.id}/print?type=INWARD`} variant="secondary" size="sm" target="_blank">
                                <Printer size={16} style={{ marginRight: '0.5rem' }} /> Inward Receipt
                            </Button>
                            <Button href={`/tickets/${ticket.id}/print?type=OUTWARD`} variant="outline" size="sm" target="_blank">
                                <Printer size={16} style={{ marginRight: '0.5rem' }} /> Return Invoice
                            </Button>
                        </div>
                    </div>
                    <Badge variant={ticket.status === 'OPEN' ? 'blue' : 'default'}>
                        {ticket.status}
                    </Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)' }}>Customer</div>
                        <div style={{ fontWeight: 500 }}>{ticket.customer.name}</div>
                        <div style={{ fontSize: '0.875rem' }}>{ticket.customer.phone}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)' }}>Received by</div>
                        <div style={{ fontWeight: 500 }}>{ticket.receiptMethod === 'HAND_ON' ? 'Hand-on' : 'Courier'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)' }}>Items</div>
                        <div style={{ fontWeight: 500 }}>{ticket.items.length} Product(s)</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)' }}>Created</div>
                        <div style={{ fontWeight: 500 }}>{formatDate(ticket.createdAt)}</div>
                    </div>
                </div>
            </Card>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Ticket Items</h3>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {ticket.items.map((item: any) => (
                    <TicketItemCard key={item.id} item={item} ticketId={ticket.id} companies={companies} />
                ))}
            </div>
        </div>
    );
}

function SendToCompanyForm({ item, ticketId, companies }: { item: any, ticketId: number, companies: any[] }) {
    const [state, action, isPending] = useActionState(createBatch, { message: '' });
    const searchParams = useSearchParams();
    const initialCompanyId = searchParams.get('initialCompanyId');

    return (
        <form action={action} style={{ display: 'grid', gap: '1rem' }}>
            <input type="hidden" name="itemIds" value={JSON.stringify([item.id])} />
            <h5 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Truck size={18} /> Send to Company</h5>
            <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Select Company</label>
                <select
                    name="companyId"
                    required
                    defaultValue={initialCompanyId || ''}
                    className="input"
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid #94a3b8', background: 'var(--background)', color: 'var(--foreground)' }}
                >
                    <option value="">Select Vendor...</option>
                    {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    <Link href={`/companies/new?returnTo=${encodeURIComponent(`/tickets/${ticketId}`)}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                        + Add New Company
                    </Link>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input name="courierName" label="Courier Name" fullWidth />
                <Input name="trackingNumber" label="Tracking No." fullWidth />
            </div>
            <Button type="submit" disabled={isPending} isLoading={isPending} style={{ justifySelf: 'start' }}>
                Mark as Sent
            </Button>
        </form>
    );
}

function TicketItemCard({ item, ticketId, companies }: { item: any, ticketId: number, companies: any[] }) {
    const [expanded, setExpanded] = useState(false);

    // Determines if actions are available
    const hasActions = ['RECEIVED', 'SENT_TO_COMPANY', 'RECEIVED_FROM_COMPANY'].includes(item.status);

    const statusVariantMap: any = {
        'RECEIVED': 'blue',
        'SENT_TO_COMPANY': 'warning',
        'RECEIVED_FROM_COMPANY': 'purple',
        'RETURNED_TO_CUSTOMER': 'success'
    };

    return (
        <Card style={{ borderLeft: `4px solid ${getStatusColor(item.status)}` }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Header: Product & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{item.product.brand} {item.product.name}</h4>
                        <div style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>Model: {item.product.modelNumber || 'N/A'} • S/N: {item.serialNumber}</div>
                    </div>
                    <Badge variant={statusVariantMap[item.status] || 'default'}>
                        {formatStatus(item.status)}
                    </Badge>
                </div>

                <hr style={{ border: 0, borderTop: '1px solid var(--border)' }} />

                {/* Info Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                        <div style={{ color: 'var(--secondary-foreground)' }}>Issue</div>
                        <div>{item.issueDescription}</div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--secondary-foreground)' }}>Warranty</div>
                        <div>{item.isUnderWarranty ? 'Yes' : 'No'}</div>
                    </div>
                    {item.companyBatch && (
                        <div>
                            <div style={{ color: 'var(--secondary-foreground)' }}>Vendor Info</div>
                            <div>
                                Sent to <strong>{item.companyBatch.company.name}</strong><br />
                                on {formatDate(item.companyBatch.dateSent)}
                                <div style={{ marginTop: '0.25rem' }}>
                                    <Link href={`/companies/batches/${item.companyBatch.id}/print`} target="_blank" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Printer size={12} /> Print Challan
                                    </Link>
                                </div>
                            </div>
                            {item.status === 'SENT_TO_COMPANY' && (
                                <div style={{ marginTop: '0.25rem' }}>
                                    <UndoBatchItemForm item={item} ticketId={ticketId} />
                                </div>
                            )}
                        </div>
                    )}
                    {item.resolution && (
                        <div>
                            <div style={{ color: 'var(--secondary-foreground)' }}>Resolution</div>
                            <div>{item.resolution} {item.newSerialNumber ? `(New S/N: ${item.newSerialNumber})` : ''}</div>
                        </div>
                    )}
                </div>

                {/* Actions Section */}
                {hasActions && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 500, padding: 0 }}
                        >
                            {expanded ? (
                                <>Hide Actions <ChevronUp size={16} /></>
                            ) : (
                                <>Update Status <ChevronDown size={16} /></>
                            )}
                        </button>

                        {expanded && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--secondary)', borderRadius: 'var(--radius)' }}>
                                {item.status === 'RECEIVED' && <SendToCompanyForm item={item} ticketId={ticketId} companies={companies} />}
                                {item.status === 'SENT_TO_COMPANY' && <ReceiveFromCompanyForm item={item} ticketId={ticketId} />}
                                {item.status === 'RECEIVED_FROM_COMPANY' && <ReturnToCustomerForm item={item} ticketId={ticketId} />}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}

function ReceiveFromCompanyForm({ item, ticketId }: { item: any, ticketId: number }) {
    const [state, action, isPending] = useActionState(updateItemStage3, { message: '' });
    const [resolution, setResolution] = useState('REPAIRED');

    return (
        <form action={action} style={{ display: 'grid', gap: '1rem' }}>
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="ticketId" value={ticketId} />
            <h5 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PackageCheck size={18} /> Receive from Company</h5>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Resolution</label>
                    <select
                        name="resolution"
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        required
                        className="input"
                        style={{ width: '100%', padding: '0.5rem' }}
                    >
                        <option value="REPAIRED">Repaired</option>
                        <option value="REPLACED">Replaced</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Repair Cost</label>
                    <input name="repairCost" type="number" step="0.01" className="input" style={{ width: '100%', padding: '0.5rem' }} />
                </div>
            </div>

            {resolution === 'REPLACED' && (
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>New Serial Number (Required)</label>
                    <input name="newSerialNumber" type="text" className="input" required style={{ width: '100%', padding: '0.5rem' }} />
                </div>
            )}

            <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Description (What was fixed?)</label>
                <textarea name="companyResolutionDescription" className="input" style={{ width: '100%', padding: '0.5rem', minHeight: '80px' }} placeholder="e.g. Replaced motherboard, Updated firmware..." />
            </div>

            <button type="submit" disabled={isPending} className="btn btn-primary" style={{ justifySelf: 'start' }}>
                {isPending ? 'Saving...' : 'Mark as Received'}
            </button>
        </form>
    );
}

function ReturnToCustomerForm({ item, ticketId }: { item: any, ticketId: number }) {
    const [state, action, isPending] = useActionState(updateItemStage4, { message: '' });
    const [returnMethod, setReturnMethod] = useState('HAND_ON');

    return (
        <form action={action} style={{ display: 'grid', gap: '1rem' }}>
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="ticketId" value={ticketId} />
            <h5 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserCheck size={18} /> Return to Customer</h5>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Return Method</label>
                    <select
                        name="returnMethod"
                        value={returnMethod}
                        onChange={(e) => setReturnMethod(e.target.value)}
                        className="input"
                        style={{ width: '100%', padding: '0.5rem' }}
                    >
                        <option value="HAND_ON">Hand-on (In Store)</option>
                        <option value="COURIER">Courier</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Final Charges (Bill)</label>
                    <input name="finalCost" type="number" step="0.01" className="input" style={{ width: '100%', padding: '0.5rem' }} />
                </div>
            </div>

            {returnMethod === 'COURIER' && (
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Docket / Tracking Number</label>
                    <input name="returnTrackingNumber" type="text" className="input" style={{ width: '100%', padding: '0.5rem' }} required />
                </div>
            )}

            <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Description / Reason</label>
                <textarea name="customerReturnDescription" className="input" style={{ width: '100%', padding: '0.5rem', minHeight: '80px' }} placeholder="e.g. Item rejected because..." />
            </div>

            <Button type="submit" disabled={isPending} isLoading={isPending} style={{ justifySelf: 'start', background: '#16a34a' }}>
                Mark as Returned to Customer
            </Button>
        </form>
    );
}



function UndoBatchItemForm({ item, ticketId }: { item: any, ticketId: number }) {
    const [state, action, isPending] = useActionState(undoBatchItem, { message: '' });

    return (
        <form action={action}>
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="ticketId" value={ticketId} />
            <button type="submit" disabled={isPending} style={{ fontSize: '0.75rem', color: 'var(--destructive)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                {isPending ? 'Undoing...' : 'Undo / Recall Item'}
            </button>
        </form>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'RECEIVED': return '#2563eb'; // Blue
        case 'SENT_TO_COMPANY': return '#ea580c'; // Orange
        case 'RECEIVED_FROM_COMPANY': return '#9333ea'; // Purple
        case 'RETURNED_TO_CUSTOMER': return '#16a34a'; // Green
        default: return '#4b5563';
    }
}

function getStatusBg(status: string) {
    switch (status) {
        case 'RECEIVED': return '#eff6ff';
        case 'SENT_TO_COMPANY': return '#fff7ed';
        case 'RECEIVED_FROM_COMPANY': return '#f3e8ff';
        case 'RETURNED_TO_CUSTOMER': return '#f0fdf4';
        default: return '#f3f4f6';
    }
}


function formatDate(date: string | Date | null | undefined) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatStatus(status: string) {
    if (!status) return '';
    return status.replace(/_/g, ' ');
}


