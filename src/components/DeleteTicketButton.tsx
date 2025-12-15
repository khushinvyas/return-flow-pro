'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteTicket } from '@/app/actions/ticket';
import { useRouter } from 'next/navigation';

export default function DeleteTicketButton({ ticketId }: { ticketId: number }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();

        if (confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
            startTransition(async () => {
                const result = await deleteTicket(ticketId);
                if (result.message !== 'success') {
                    alert(result.message);
                } else {
                    // Optional: Refresh/Toast
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            style={{
                background: 'none',
                border: 'none',
                color: 'var(--destructive, #ef4444)',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            title="Delete Ticket"
        >
            <Trash2 size={18} />
        </button>
    );
}
