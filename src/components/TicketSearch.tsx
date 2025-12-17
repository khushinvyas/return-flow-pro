'use client';

import { Search, Loader2 } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useTransition } from 'react';

export default function TicketSearch() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }

        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    }, 300);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-foreground)', display: 'flex', alignItems: 'center' }}>
                {isPending ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            </div>
            <input
                type="text"
                placeholder="Search by ID, Customer, Product, or Serial..."
                defaultValue={searchParams.get('q')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: '3rem', width: '100%' }}
                autoComplete="off"
            />
        </div>
    );
}
