'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const initialState = { message: '' };

type ProductFormProps = {
    action: (prevState: any, formData: FormData) => Promise<{ message: string }>;
    initialData?: {
        id: number;
        name: string;
        brand: string;
        modelNumber?: string | null;
    };
    title?: string;
};

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ProductForm({ action, initialData, title = 'Add New Product' }: ProductFormProps) {
    const [state, formAction, isPending] = useActionState(action, initialState);
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Button href={returnTo || "/products"} variant="ghost" size="sm" style={{ marginBottom: '1rem', paddingLeft: 0, color: 'var(--secondary-foreground)' }}>
                    <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> {returnTo ? 'Back to Ticket' : 'Back to Products'}
                </Button>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>{title}</h1>
            </div>

            <Card>
                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <input type="hidden" name="returnTo" value={returnTo || ''} />
                    {initialData && <input type="hidden" name="id" value={initialData.id} />}

                    <Input
                        name="name"
                        label="Product Name"
                        required
                        defaultValue={initialData?.name}
                        fullWidth
                    />

                    <Input
                        name="brand"
                        label="Brand"
                        required
                        defaultValue={initialData?.brand}
                        fullWidth
                    />

                    <Input
                        name="modelNumber"
                        label="Model Number"
                        defaultValue={initialData?.modelNumber || ''}
                        fullWidth
                    />

                    {state?.message === 'success' && (
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius)' }}>
                            Saved successfully! <Link href={returnTo || "/products"} style={{ textDecoration: 'underline' }}>Go back</Link>
                        </div>
                    )}
                    {state?.message && state.message !== 'success' && (
                        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius)' }}>
                            {state.message}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button href={returnTo || "/products"} variant="secondary">Cancel</Button>
                        <Button type="submit" disabled={isPending} isLoading={isPending}>
                            Save Product
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
