'use client';

import { LayoutGrid, List } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function ViewToggle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const view = searchParams.get('view') || 'grid';

    const setView = (newView: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newView === 'grid') {
            params.delete('view'); // Default
        } else {
            params.set('view', newView);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div style={{ display: 'flex', background: 'var(--secondary)', padding: '4px', borderRadius: 'var(--radius)', gap: '4px' }}>
            <Button
                variant={view === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setView('grid')}
                className={view === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}
                style={{ height: '32px', width: '32px', padding: 0 }}
            >
                <LayoutGrid size={16} />
            </Button>
            <Button
                variant={view === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
                className={view === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}
                style={{ height: '32px', width: '32px', padding: 0 }}
            >
                <List size={16} />
            </Button>
        </div>
    );
}
