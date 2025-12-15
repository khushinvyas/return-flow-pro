'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Ticket, Users, Package, Building2, X } from 'lucide-react';
import { searchAll } from '@/app/actions/search';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                const data = await searchAll(query);
                setResults(data);
                setLoading(false);
                setIsOpen(true);
            } else {
                setResults(null);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleLinkClick = () => {
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="search-container" ref={searchRef} style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-foreground)' }} />
                <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    style={{
                        width: '100%',
                        padding: '0.6rem 1rem 0.6rem 2.5rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--foreground)',
                        fontSize: '0.875rem'
                    }}
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults(null); }}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--secondary-foreground)', cursor: 'pointer' }}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {isOpen && (results || loading) && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 5px)',
                    left: 0,
                    right: 0,
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 50
                }}>
                    {loading ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--secondary-foreground)' }}>
                            <Loader2 className="animate-spin" style={{ display: 'inline-block', marginRight: '0.5rem' }} size={16} />
                            Searching...
                        </div>
                    ) : (
                        <>
                            {results?.tickets?.length > 0 ? (
                                <div style={{ padding: '0.5rem' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary-foreground)', padding: '0 0.5rem 0.25rem' }}>TICKETS FOUND</h4>
                                    {results.tickets.map((t: any) => {
                                        // Helper to find relevant item info
                                        const matchingItem = t.items.find((i: any) =>
                                            i.serialNumber.toLowerCase().includes(query.toLowerCase()) ||
                                            i.product.name.toLowerCase().includes(query.toLowerCase()) ||
                                            i.companyBatch?.company.name.toLowerCase().includes(query.toLowerCase())
                                        );

                                        return (
                                            <Link key={t.id} href={`/tickets/${t.id}`} onClick={handleLinkClick} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--foreground)', transition: 'background 0.2s' }} className="hover:bg-accent">
                                                <Ticket size={16} style={{ opacity: 0.7, flexShrink: 0 }} />
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        #{t.id} - {t.customer.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {t.items.length} items • {matchingItem ? `${matchingItem.product.name} (${matchingItem.serialNumber})` : t.items[0]?.product.name}
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--secondary-foreground)', fontSize: '0.875rem' }}>
                                    No tickets found matching "{query}".
                                </div>
                            )}

                            {!results?.tickets?.length && !results?.customers?.length && !results?.products?.length && !results?.companies?.length && (
                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--secondary-foreground)', fontSize: '0.875rem' }}>
                                    No results found.
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
