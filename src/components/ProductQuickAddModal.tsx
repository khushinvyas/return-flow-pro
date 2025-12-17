'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createProductInline } from '@/app/actions/product-inline';
import { Loader2, X } from 'lucide-react';

interface ProductQuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (product: any) => void;
}

export default function ProductQuickAddModal({ isOpen, onClose, onSuccess }: ProductQuickAddModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await createProductInline(formData);

        if (result.success) {
            onSuccess(result.product);
            onClose();
        } else {
            setError(result.error || 'Failed to create product');
        }
        setLoading(false);
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Add New Product</h3>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Product Name</label>
                        <Input name="name" required placeholder="e.g. iPhone 15" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Brand</label>
                        <Input name="brand" required placeholder="e.g. Apple" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Model Number (Optional)</label>
                        <Input name="modelNumber" placeholder="e.g. A2846" />
                    </div>

                    {error && (
                        <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
