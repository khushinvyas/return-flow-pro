import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus, Building2, Phone, Mail, ArrowLeft, Search } from 'lucide-react';

import { getSession } from '@/lib/auth';

async function getCompanies(query: string = '') {
    const session = await getSession();
    if (!session?.userId) return [];

    const { organizationId, isGlobalAdmin } = session;
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    return await prisma.company.findMany({
        where: {
            ...orgFilter,
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
                { phone: { contains: query } }
            ]
        },
        orderBy: { createdAt: 'desc' }
    });
}

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ActionsMenu from '@/components/ActionsMenu';
import { deleteCompany } from '../actions/inventory';

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ created?: string; q?: string }> }) {
    const params = await searchParams;
    const showSuccess = params.created === 'true';
    const query = params.q || '';
    const companies = await getCompanies(query);

    return (
        <div>
            {showSuccess && (
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius)', marginBottom: '1rem', border: '1px solid var(--success)' }}>
                    Company created successfully!
                </div>
            )}
            <Button href="/" variant="ghost" size="sm" style={{ marginBottom: '1rem', paddingLeft: 0, color: 'var(--secondary-foreground)' }}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Companies</h1>
                    <p style={{ color: 'var(--secondary-foreground)' }}>Manage vendor/company list</p>
                </div>
                <Button href="/companies/new">
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Company
                </Button>
            </div>

            <Card style={{ padding: '1rem', marginBottom: '2rem' }}>
                <form style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-foreground)' }} />
                    <input
                        name="q"
                        type="text"
                        placeholder="Search companies..."
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
                </form>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {companies.map((company) => (
                    <Card key={company.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 40, height: 40, background: 'var(--secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Building2 size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{company.name}</h3>
                            </div>
                            <ActionsMenu
                                editUrl={`/companies/${company.id}/edit`}
                                deleteAction={deleteCompany}
                                id={company.id}
                                entityName="company"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {company.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>
                                    <Phone size={16} /> {company.phone}
                                </div>
                            )}
                            {company.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>
                                    <Mail size={16} /> {company.email}
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
