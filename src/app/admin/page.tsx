import { getAdminDashboardData, deleteOrganization } from '@/app/actions/admin';
import { impersonateOrganization } from '@/app/actions/auth';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Users, Building2, Ticket, Settings, Trash2, Edit, Eye } from 'lucide-react';

interface AdminOrganization {
    id: string;
    name: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    createdAt: Date;
    _count: {
        members: number;
        tickets: number;
    };
}

import AdminToolbar from '@/components/admin/AdminToolbar';

export default async function AdminDashboard({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
        filter?: string;
    }>;
}) {
    const params = await searchParams;
    const query = params?.query || '';
    const filter = params?.filter || '';
    const { stats, organizations } = await getAdminDashboardData(query, filter);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Super Admin</h1>
                    <p style={{ color: 'var(--secondary-foreground)' }}>Global System Overview</p>
                </div>
                <Button href="/" variant="outline">Back to App</Button>
            </div>

            {/* Global Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <Card style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--secondary-foreground)', fontWeight: 500 }}>Total Organizations</span>
                        <Building2 size={20} color="var(--primary)" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalOrgs}</div>
                </Card>
                <Link href="/admin/users" style={{ textDecoration: 'none' }}>
                    <Card style={{ padding: '1.5rem', height: '100%', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--secondary-foreground)', fontWeight: 500 }}>Total Users</span>
                            <Users size={20} color="var(--blue-500)" />
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)' }}>{stats.totalUsers}</div>
                    </Card>
                </Link>
                <Card style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--secondary-foreground)', fontWeight: 500 }}>Total Tickets</span>
                        <Ticket size={20} color="var(--success)" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalTickets}</div>
                </Card>
            </div>

            {/* Organizations Table */}
            <Card style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Organizations</h2>
                    </div>
                    <AdminToolbar showSubscriptionFilter={true} placeholder="Search organizations..." />
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ background: 'var(--secondary)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Plan</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Members</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Tickets</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Created</th>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map((org: AdminOrganization) => (
                                <tr key={org.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{org.name}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <Badge variant="default">{org.subscriptionPlan}</Badge>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <Badge variant={org.subscriptionStatus === 'ACTIVE' ? 'success' : 'error'}>
                                            {org.subscriptionStatus}
                                        </Badge>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{org._count.members}</td>
                                    <td style={{ padding: '1rem' }}>{org._count.tickets}</td>
                                    <td style={{ padding: '1rem', color: 'var(--secondary-foreground)' }}>
                                        {new Date(org.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            {/* View (Impersonate) Button */}
                                            <form action={impersonateOrganization.bind(null, org.id)}>
                                                <Button size="sm" variant="ghost" title="View As">
                                                    <Eye size={16} />
                                                </Button>
                                            </form>

                                            <Button href={`/admin/organizations/${org.id}`} size="sm" variant="ghost">
                                                <Edit size={16} />
                                            </Button>

                                            {/* Delete Button (Client Component needed for form action usually, or just use ActionsMenu if compatible) */}
                                            {/* Since ActionsMenu is generic, let's use it or make a simple form */}
                                            <form action={deleteOrganization.bind(null, org.id)}>
                                                <Button size="sm" variant="ghost" style={{ color: 'var(--destructive)' }}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
