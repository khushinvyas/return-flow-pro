import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { User, LogOut, Shield, ArrowLeft } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ThemeToggle from '@/components/ThemeToggle'; // Import ThemeToggle

import { OrganizationSettingsCard } from '@/components/OrganizationSettingsCard';

export default async function SettingsPage() {
    const session = await getSession();
    if (!session?.userId) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId as number },
        include: {
            memberships: {
                include: { organization: true }
            }
        }
    });

    if (!user) {
        redirect('/login');
    }

    const organization = user.memberships[0]?.organization;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Button href="/" variant="ghost" size="sm" style={{ marginBottom: '1rem', paddingLeft: 0, color: 'var(--secondary-foreground)' }}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
            </Button>

            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '2rem' }}>Settings</h1>

            <div style={{ display: 'grid', gap: '2rem' }}>
                <Card>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={24} /> My Profile
                    </h2>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary-foreground)' }}>Full Name</label>
                            <div style={{ fontSize: '1.125rem', fontWeight: 500 }}>{user.name}</div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary-foreground)' }}>Email Address</label>
                            <div style={{ fontSize: '1.125rem' }}>{user.email}</div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary-foreground)' }}>Organization</label>
                            <div style={{ fontSize: '1.125rem' }}>{organization?.name || 'N/A'}</div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary-foreground)' }}>Role</label>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600 }}>
                                <Shield size={14} /> {user.role}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Theme Switcher Section */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Appearance</h2>
                            <p style={{ color: 'var(--secondary-foreground)', fontSize: '0.875rem' }}>Customize how ReturnFlow Pro looks on your device.</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </Card>

                <OrganizationSettingsCard organization={organization} />

                <Card>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Session</h2>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--secondary-foreground)', fontSize: '0.875rem' }}>
                        Manage your current session on this device.
                    </p>

                    <form action={logout}>
                        <Button type="submit" variant="secondary">
                            <LogOut size={18} style={{ marginRight: '0.5rem' }} /> Sign Out
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}

