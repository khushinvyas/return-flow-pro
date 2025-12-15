'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { updateOrganization } from '@/app/actions/admin';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminOrgForm({ initialData }: { initialData: any }) {
    const [loading, setLoading] = useState(false);

    // We can use a simple form action or client-side handler. 
    // Using simple form action for robustness, but with loading state.

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        await updateOrganization(initialData.id, formData);
        setLoading(false);
        // Maybe show toast?
    }

    return (
        <form action={handleSubmit}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <Card style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Organization Details</h3>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Organization Name</label>
                            <Input name="name" defaultValue={initialData.name} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subscription Status</label>
                                <select
                                    name="subscriptionStatus"
                                    defaultValue={initialData.subscriptionStatus}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--background)',
                                        color: 'var(--foreground)'
                                    }}
                                >
                                    <option value="TRIAL">Trial</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="PAST_DUE">Past Due</option>
                                    <option value="CANCELED">Canceled</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subscription Plan</label>
                                <select
                                    name="subscriptionPlan"
                                    defaultValue={initialData.subscriptionPlan}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--background)',
                                        color: 'var(--foreground)'
                                    }}
                                >
                                    <option value="FREE">Free</option>
                                    <option value="PRO">Pro</option>
                                    <option value="ENTERPRISE">Enterprise</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subscription Expiry</label>
                            <Input
                                name="subscriptionExpiry"
                                type="date"
                                defaultValue={initialData.subscriptionExpiry ? new Date(initialData.subscriptionExpiry).toISOString().split('T')[0] : ''}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)', marginTop: '0.5rem' }}>
                                For manual renewal, set this to a future date (e.g. +1 year).
                            </p>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" disabled={loading}>
                            <Save size={18} style={{ marginRight: '0.5rem' }} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </Card>
            </div>
        </form>
    );
}
