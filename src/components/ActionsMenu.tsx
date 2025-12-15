'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';

type ActionsMenuProps = {
    editUrl: string;
    deleteAction: (id: number) => Promise<{ message: string }>;
    id: number;
    entityName: string;
};

export default function ActionsMenu({ editUrl, deleteAction, id, entityName }: ActionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete this ${entityName}?`)) {
            await deleteAction(id);
            setIsOpen(false);
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                type="button" // Explicitly type button to prevent form submission if nested
                style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    color: 'var(--secondary-foreground)',
                    background: isOpen ? 'var(--secondary)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                <MoreHorizontal size={20} />
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '0.25rem',
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 50,
                    minWidth: '160px',
                    padding: '0.25rem',
                    overflow: 'hidden'
                }}>
                    <Link
                        href={editUrl}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.625rem 0.75rem',
                            color: 'hsl(var(--foreground))',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--secondary))'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <Edit size={16} /> Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        type="button"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            width: '100%',
                            padding: '0.625rem 0.75rem',
                            border: 'none',
                            background: 'transparent',
                            color: 'hsl(var(--error))',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--error-bg))'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}
