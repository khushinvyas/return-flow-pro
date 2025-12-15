'use client';

import { stopImpersonating } from '@/app/actions/auth';
import { LogOut } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function ExitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            style={{
                background: 'white',
                color: 'black',
                border: 'none',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}
        >
            {pending ? 'Exiting...' : <><LogOut size={14} /> Exit View</>}
        </button>
    );
}

export default function ImpersonationBanner({ orgName }: { orgName: string }) {
    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem', // Move to bottom or keep top but centered
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(220, 38, 38, 0.9)', // Red-600 with opacity
            color: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 9999, // Very high z-index
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            width: 'auto',
            maxWidth: '90%'
        }}>
            <span style={{ whiteSpace: 'nowrap' }}>Viewing as: <strong>{orgName}</strong></span>
            <form action={stopImpersonating}>
                <ExitButton />
            </form>
        </div>
    );
}
