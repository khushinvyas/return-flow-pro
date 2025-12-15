'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface AdminToolbarProps {
    showSubscriptionFilter?: boolean;
    placeholder?: string;
}

export default function AdminToolbar({
    showSubscriptionFilter = false,
    placeholder = 'Search...'
}: AdminToolbarProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleFilterChange = (status: string) => {
        const params = new URLSearchParams(searchParams);
        if (status && status !== 'ALL') {
            params.set('filter', status);
        } else {
            params.delete('filter');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            alignItems: 'center'
        }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                <Search
                    size={16}
                    style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--secondary-foreground)'
                    }}
                />
                <Input
                    placeholder={placeholder}
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('query')?.toString()}
                    style={{ paddingLeft: '2.5rem' }}
                />
            </div>

            {showSubscriptionFilter && (
                <div style={{ position: 'relative' }}>
                    <Filter
                        size={16}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--secondary-foreground)'
                        }}
                    />
                    <select
                        onChange={(e) => handleFilterChange(e.target.value)}
                        defaultValue={searchParams.get('filter')?.toString() || 'ALL'}
                        style={{
                            height: '40px',
                            padding: '0 2rem 0 2.5rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            background: 'var(--card)',
                            color: 'var(--foreground)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="TRIAL">Trial</option>
                        <option value="EXPIRED">Expired</option>
                    </select>
                </div>
            )}
        </div>
    );
}
