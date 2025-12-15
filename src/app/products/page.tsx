
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus, Package, ArrowLeft, Search } from 'lucide-react';

import { getSession } from '@/lib/auth';

async function getProducts(query: string = '') {
    const session = await getSession();
    if (!session?.userId) return [];

    const { organizationId, isGlobalAdmin } = session;
    const orgFilter = isGlobalAdmin ? {} : { organizationId };

    return await prisma.product.findMany({
        where: {
            ...orgFilter,
            OR: [
                { name: { contains: query } },
                { brand: { contains: query } },
                { modelNumber: { contains: query } }
            ]
        },
        orderBy: { createdAt: 'desc' }
    });
}

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ActionsMenu from '@/components/ActionsMenu';
import { deleteProduct } from '../actions/inventory';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ created?: string; q?: string }> }) {
    const params = await searchParams;
    const showSuccess = params.created === 'true';
    const query = params.q || '';
    const products = await getProducts(query);

    return (
        <div>
            {showSuccess && (
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius)', marginBottom: '1rem', border: '1px solid var(--success)' }}>
                    Product created successfully!
                </div>
            )}
            <Button href="/" variant="ghost" size="sm" style={{ marginBottom: '1rem', paddingLeft: 0, color: 'var(--secondary-foreground)' }}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Products</h1>
                    <p style={{ color: 'var(--secondary-foreground)' }}>Manage product catalog</p>
                </div>
                <Button href="/products/new">
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Product
                </Button>
            </div>

            <Card style={{ padding: '1rem', marginBottom: '2rem' }}>
                <form style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-foreground)' }} />
                    <input
                        name="q"
                        type="text"
                        placeholder="Search products..."
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {products.map((product) => (
                    <Card key={product.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ color: 'var(--primary)' }}>
                                <Package size={24} />
                            </div>
                            <ActionsMenu
                                editUrl={`/products/${product.id}/edit`}
                                deleteAction={deleteProduct}
                                id={product.id}
                                entityName="product"
                            />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{product.name}</h3>
                        <p style={{ color: 'var(--secondary-foreground)', fontSize: '0.875rem' }}>{product.brand} {product.modelNumber && `• ${product.modelNumber} `}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}
