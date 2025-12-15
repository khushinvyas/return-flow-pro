import { getGlobalUsers, updateGlobalUser, getAdminDashboardData } from '@/app/actions/admin'; // Need a singular fetch or filter
import { prisma } from '@/lib/db'; // fetching directly for simplicity now or can add getGlobalUser
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/auth';

async function getGlobalUser(id: number) {
    const session = await getSession();
    if (!session?.isGlobalAdmin) redirect('/');

    return await prisma.user.findUnique({
        where: { id },
        include: {
            memberships: {
                include: { organization: true }
            }
        }
    });
}

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const id = parseInt((await params).id);
    if (isNaN(id)) notFound();

    const user = await getGlobalUser(id);
    if (!user) notFound();

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Button href="/admin/users" variant="ghost" size="sm">
                    <ArrowLeft size={16} />
                </Button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Edit User</h1>
                    <p style={{ color: 'var(--secondary-foreground)' }}>ID: {user.id}</p>
                </div>
            </div>

            <Card style={{ padding: '2rem' }}>
                <form action={updateGlobalUser.bind(null, user.id)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                        <Input name="name" defaultValue={user.name} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                        <Input name="email" type="email" defaultValue={user.email} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>New Password (Optional)</label>
                        <Input name="password" type="password" placeholder="Leave blank to keep unchanged" />
                    </div>

                    {/* Read Only Info */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Role</label>
                        <Input value={user.isGlobalAdmin ? "Super Admin" : "User"} disabled readOnly />
                        <p style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)', marginTop: '0.25rem' }}>
                            Role changes are currently managed via database or separate flow.
                        </p>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Joined Organizations</label>
                        <div style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem', background: 'var(--secondary)' }}>
                            {user.memberships.length > 0 ? (
                                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                    {user.memberships.map(m => (
                                        <li key={m.id}>{m.organization.name} ({m.role})</li>
                                    ))}
                                </ul>
                            ) : (
                                <span style={{ color: 'var(--secondary-foreground)' }}>No memberships</span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
                        <Button type="submit" variant="primary">Update User</Button>
                        <Button href="/admin/users" variant="outline" type="button">Cancel</Button>
                    </div>

                </form>
            </Card>
        </div>
    );
}
