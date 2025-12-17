'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateOrganizationSettings } from '@/app/actions/organization';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Upload } from 'lucide-react';
import { getOrganization } from '@/app/actions/admin'; // We can reuse or fetch differently. simpler to fetch in client or pass as prop? 
// It's better to pass as prop, but I need to fetch it in page.tsx first. 
// Let's modify page.tsx to fetch organization and pass it.
// For now, I'll create the component and then update page.tsx to pass data.
// Wait, I can't fetch in client easily without a server action designed for it or API. 
// I'll assume page.tsx passes the organization data.

export function OrganizationSettingsCard({ organization }: { organization: any }) {
    const [state, action, isPending] = useActionState(updateOrganizationSettings, { message: '' });
    const [logoPreview, setLogoPreview] = useState<string | null>(organization?.logoUrl || null);
    const [logoFile, setLogoFile] = useState<string>('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) {
                alert("File size must be less than 500KB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setLogoPreview(base64);
                setLogoFile(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Building2 size={24} /> Organization Details
            </h2>

            <form action={action} style={{ display: 'grid', gap: '1rem' }}>
                {/* Logo Upload */}
                <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
                        Business Logo
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '100px', height: '100px',
                            borderRadius: '12px', border: '1px solid var(--border)',
                            background: 'var(--secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', position: 'relative'
                        }}>
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)' }}>No Logo</span>
                            )}
                        </div>

                        <div>
                            <input
                                type="file"
                                id="logo-upload"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />
                            <label htmlFor="logo-upload" className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Upload size={16} /> Upload New Logo
                            </label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)' }}>
                                Recommended: PNG or JPG. Max 500KB.
                            </p>
                            <input type="hidden" name="logo" value={logoFile} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
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
                    <div style={{ fontSize: '0.875rem', color: state.success ? 'var(--success)' : 'var(--error)' }}>
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
