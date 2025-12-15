import { getOrganization } from '@/app/actions/admin';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AdminOrgForm from '@/components/AdminOrgForm';

export default async function AdminOrgEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const organization = await getOrganization(id);

    if (!organization) {
        return <div>Organization not found</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <Button href="/admin" variant="ghost" size="sm" style={{ marginBottom: '1rem', paddingLeft: 0 }}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Admin
            </Button>

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Edit Organization</h1>
                <p style={{ color: 'var(--secondary-foreground)' }}>Manage tenant details and subscription</p>
            </div>

            <AdminOrgForm initialData={organization} />

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Members</h3>
                <Card style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ background: 'var(--secondary)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th style={{ padding: '1rem' }}>Email</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organization.members.map((member) => (
                                <tr key={member.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={16} />
                                            </div>
                                            {member.user.name || 'No Name'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{member.user.email}</td>
                                    <td style={{ padding: '1rem' }}>{member.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
}
