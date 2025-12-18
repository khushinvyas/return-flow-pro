
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

import { ViewToggle } from '@/components/ViewToggle';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ created?: string; q?: string; view?: string }> }) {
    const params = await searchParams;
    const showSuccess = params.created === 'true';
    const query = params.q || '';
    const view = params.view || 'grid';
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ViewToggle />
                    <Button href="/products/new">
                        <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Product
                    </Button>
                </div>
            </div>

            <Card style={{ padding: '1rem', marginBottom: '2rem' }}>
                <form style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-foreground)' }} />
                    <input
                        name="q"
                        type="text"
                        placeholder="Search products..."
                        defaultValue={query}
                        className="input"
                        style={{ paddingLeft: '3rem' }}
                    />
                    {view === 'list' && <input type="hidden" name="view" value="list" />}
                </form>
            </Card>

            {view === 'grid' ? (
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
            ) : (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Model Number</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded bg-primary/10 text-primary">
                                                    <Package size={16} />
                                                </div>
                                                {product.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{product.brand}</TableCell>
                                        <TableCell className="font-mono text-xs">{product.modelNumber || '—'}</TableCell>
                                        <TableCell>
                                            <ActionsMenu
                                                editUrl={`/products/${product.id}/edit`}
                                                deleteAction={deleteProduct}
                                                id={product.id}
                                                entityName="product"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
