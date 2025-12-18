import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Search, Plus, MoreHorizontal, Phone, Mail, MapPin, ArrowLeft } from 'lucide-react';
import { createCustomer, deleteCustomer } from '../actions/customer';
import styles from './page.module.css'; // We'll create this


import { getSession } from '@/lib/auth';

async function getCustomers(query: string = '') {
    const session = await getSession();
    if (!session?.userId) return [];

    const { organizationId, isGlobalAdmin } = session;
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    return await prisma.customer.findMany({
        where: {
            ...orgFilter,
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
                { phone: { contains: query } },
            ],
        },
        orderBy: { createdAt: 'desc' },
    });
}

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ActionsMenu from '@/components/ActionsMenu';

import { ViewToggle } from '@/components/ViewToggle';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; created?: string; view?: string }> }) {
    const params = await searchParams;
    const query = params.q || '';
    const showSuccess = params.created === 'true';
    const view = params.view || 'grid';
    const customers = await getCustomers(query);

    return (
        <div>
            {showSuccess && (
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius)', marginBottom: '1rem', border: '1px solid var(--success)' }}>
                    Customer created successfully!
                </div>
            )}
            <Button href="/" variant="ghost" size="sm" style={{ marginBottom: '1rem', paddingLeft: 0, color: 'var(--secondary-foreground)' }}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Customers</h1>
                    <p style={{ color: 'var(--secondary-foreground)' }}>Manage your customer database</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ViewToggle />
                    <Button href="/customers/new">
                        <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Customer
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <Card style={{ padding: '1rem', marginBottom: '2rem' }}>
                <form style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-foreground)' }} />
                    <input
                        name="q"
                        type="text"
                        placeholder="Search customers..."
                        defaultValue={query}
                        style={{
                            width: '100%',
                            padding: '0.75rem 0.75rem 0.75rem 3rem',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.9375rem',
                            background: 'var(--background)',
                            color: 'var(--foreground)',
                            outline: 'none'
                        }}
                    />
                    {view === 'list' && <input type="hidden" name="view" value="list" />}
                </form>
            </Card>

            {/* Customer List */}
            {view === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {customers.map((customer) => (
                        <Card key={customer.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ width: 40, height: 40, background: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>

                                <ActionsMenu
                                    editUrl={`/customers/${customer.id}/edit`}
                                    deleteAction={deleteCustomer}
                                    id={customer.id}
                                    entityName="customer"
                                />
                            </div>

                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{customer.name}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)', marginBottom: '1rem' }}>Added on {customer.createdAt.toLocaleDateString()}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>
                                    <Phone size={16} />
                                    {customer.phone}
                                </div>
                                {customer.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>
                                        <Mail size={16} />
                                        {customer.email}
                                    </div>
                                )}
                                {customer.address && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>
                                        <MapPin size={16} />
                                        {customer.address}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-medium">{customer.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <Phone size={12} className="text-muted-foreground" />
                                                    {customer.phone}
                                                </div>
                                                {customer.email && (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground/80">
                                                        <Mail size={12} />
                                                        {customer.email}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={customer.address || ''}>
                                            {customer.address || '—'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {customer.createdAt.toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <ActionsMenu
                                                editUrl={`/customers/${customer.id}/edit`}
                                                deleteAction={deleteCustomer}
                                                id={customer.id}
                                                entityName="customer"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {customers.length === 0 && view === 'grid' && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary-foreground)' }}>
                    <p>No customers found.</p>
                </div>
            )}
        </div>
    );
}
