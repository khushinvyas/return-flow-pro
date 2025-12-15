'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { createTicket } from '@/app/actions/ticket';
import { Trash2, Plus } from 'lucide-react';

const initialState = { message: '' };

type TicketItem = {
    productId: string;
    serialNumber: string;
    issueDescription: string;
    isUnderWarranty: boolean;
};

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ... (existing imports)

export default function TicketForm({
    customers,
    products,
    initialCustomerId,
    initialProductId
}: {
    customers: any[],
    products: any[],
    initialCustomerId?: number,
    initialProductId?: number
}) {
    const [state, formAction, isPending] = useActionState(createTicket, initialState);

    const [customerId, setCustomerId] = useState<string>(initialCustomerId ? String(initialCustomerId) : '');
    const [receiptMethod, setReceiptMethod] = useState('HAND_ON');

    // Items State
    const [items, setItems] = useState<TicketItem[]>([
        {
            productId: initialProductId ? String(initialProductId) : '',
            serialNumber: '',
            issueDescription: '',
            isUnderWarranty: false
        }
    ]);

    const addItem = () => {
        setItems([...items, { productId: '', serialNumber: '', issueDescription: '', isUnderWarranty: false }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateItem = (index: number, field: keyof TicketItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const getReturnUrl = () => {
        const params = new URLSearchParams();
        if (customerId) params.set('customerId', customerId);
        return `/tickets/new?${params.toString()}`;
    };

    const selectStyle = {
        width: '100%',
        padding: '0.625rem 0.875rem',
        borderRadius: 'var(--radius)',
        border: '1px solid #94a3b8', // Slate-400 for better visibility
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        outline: 'none'
    };

    return (
        <Card>
            <form action={formAction} style={{ display: 'grid', gap: '2rem' }}>

                {/* Customer Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>Customer</label>
                        <select
                            name="customerId"
                            required
                            style={selectStyle}
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                        >
                            <option value="">Select Customer</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                            <Link href={`/customers/new?returnTo=${encodeURIComponent(getReturnUrl())}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                + Add New Customer
                            </Link>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>Received by</label>
                        <select
                            name="receiptMethod"
                            required
                            style={selectStyle}
                            value={receiptMethod}
                            onChange={(e) => setReceiptMethod(e.target.value)}
                        >
                            <option value="HAND_ON">Hand-on</option>
                            <option value="COURIER">Courier</option>
                        </select>
                    </div>
                </div>

                <hr style={{ border: 0, borderTop: '1px solid var(--border)' }} />

                {/* Items Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Ticket Items</h3>
                        <Button type="button" onClick={addItem} variant="secondary" size="sm">
                            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Another Item
                        </Button>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {items.map((item, index) => (
                            <div key={index} style={{ padding: '1.5rem', background: 'var(--accent)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', position: 'relative' }}>
                                {items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--destructive)', background: 'none', border: 'none', cursor: 'pointer' }}
                                        title="Remove Item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}

                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {/* Product and Serial */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>Product</label>
                                            <select
                                                required
                                                style={selectStyle}
                                                value={item.productId}
                                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                            >
                                                <option value="">Select Product</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.brand}) {p.modelNumber ? `- ${p.modelNumber}` : ''}</option>)}
                                            </select>
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                                                <Link href={`/products/new?returnTo=${encodeURIComponent(getReturnUrl())}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                                    + Add New Product
                                                </Link>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>Serial Number</label>
                                            <input
                                                type="text"
                                                required
                                                style={selectStyle}
                                                value={item.serialNumber}
                                                onChange={(e) => updateItem(index, 'serialNumber', e.target.value)}
                                                placeholder="S/N"
                                            />
                                        </div>
                                    </div>

                                    {/* Issue and Warranty */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>Issue Description</label>
                                        <input
                                            type="text"
                                            required
                                            style={selectStyle}
                                            value={item.issueDescription}
                                            onChange={(e) => updateItem(index, 'issueDescription', e.target.value)}
                                            placeholder="Describe the issue..."
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            id={`warranty-${index}`}
                                            checked={item.isUnderWarranty}
                                            onChange={(e) => updateItem(index, 'isUnderWarranty', e.target.checked)}
                                            style={{ width: '1rem', height: '1rem' }}
                                        />
                                        <label htmlFor={`warranty-${index}`} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Under Warranty?</label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hidden Input for Items JSON */}
                <input type="hidden" name="items" value={JSON.stringify(items)} />

                {state?.message && (
                    <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius)' }}>
                        {state.message}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button href="/tickets" variant="secondary">Cancel</Button>
                    <Button type="submit" disabled={isPending} isLoading={isPending}>
                        Create Ticket
                    </Button>
                </div>
            </form>
        </Card>
    );
}
