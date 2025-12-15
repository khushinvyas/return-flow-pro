import { getGlobalUsers, deleteGlobalUser } from '@/app/actions/admin';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Edit, Shield, ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';

import AdminToolbar from '@/components/admin/AdminToolbar';

export default async function GlobalUsersPage({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
    }>;
}) {
    const params = await searchParams;
    const query = params?.query || '';
    const users = await getGlobalUsers(query);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Global Users</h1>
                    <p style={{ color: 'var(--secondary-foreground)' }}>Manage all users in the system</p>
                </div>
                <Button href="/admin" variant="outline">
                    <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Admin
                </Button>
            </div>

            <AdminToolbar placeholder="Search users by name or email..." />

            <Card style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ background: 'var(--secondary)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Email</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Role</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Organizations</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Created</th>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{user.name}</td>
                                    <td style={{ padding: '1rem' }}>{user.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {user.isGlobalAdmin ? ( // Type error likely here until TS updates
                                            <Badge variant="purple">Super Admin</Badge>
                                        ) : (
                                            <Badge variant="default">User</Badge>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            {user.memberships.length === 0 ? (
                                                <span style={{ color: 'var(--secondary-foreground)', fontStyle: 'italic' }}>None</span>
                                            ) : (
                                                user.memberships.map((m) => (
                                                    <Badge key={m.id} variant="outline">{m.organization.name}</Badge>
                                                ))
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--secondary-foreground)' }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <Button href={`/admin/users/${user.id}`} size="sm" variant="ghost">
                                                <Edit size={16} />
                                            </Button>

                                            <form action={deleteGlobalUser.bind(null, user.id)}>
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
