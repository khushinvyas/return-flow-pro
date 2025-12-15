'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateOrganizationSettings } from '@/app/actions/organization';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2 } from 'lucide-react';
import { getOrganization } from '@/app/actions/admin'; // We can reuse or fetch differently. simpler to fetch in client or pass as prop? 
// It's better to pass as prop, but I need to fetch it in page.tsx first. 
// Let's modify page.tsx to fetch organization and pass it.
// For now, I'll create the component and then update page.tsx to pass data.
// Wait, I can't fetch in client easily without a server action designed for it or API. 
// I'll assume page.tsx passes the organization data.

export function OrganizationSettingsCard({ organization }: { organization: any }) {
    const [state, action, isPending] = useActionState(updateOrganizationSettings, { message: '' });

    return (
        <Card>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Building2 size={24} /> Organization Details
            </h2>

            <form action={action} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        name="name"
                        label="Organization Name"
                        defaultValue={organization?.name || ''}
                        required
                        fullWidth
                    />
                    <Input
                        name="gstNumber"
                        label="GST Number"
                        defaultValue={organization?.gstNumber || ''}
                        placeholder="e.g. 29AAAAA0000A1Z5"
                        fullWidth
                    />
                </div>

                <Input
                    name="address"
                    label="Business Address"
                    defaultValue={organization?.address || ''}
                    fullWidth
                />

                <Input
                    name="phone"
                    label="Business Phone"
                    defaultValue={organization?.phone || ''}
                    fullWidth
                />

                {state.message && (
                    <div style={{ fontSize: '0.875rem', color: state.success ? 'green' : 'red' }}>
                        {state.message}
                    </div>
                )}

                <Button type="submit" disabled={isPending} isLoading={isPending} style={{ justifySelf: 'start' }}>
                    Save Changes
                </Button>
            </form>
        </Card>
    );
}
