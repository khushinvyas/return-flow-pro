'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { TicketDocument } from '@/components/pdf/TicketDocument';
import { Loader2 } from 'lucide-react';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <LoadingState />,
    }
);

function LoadingState() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f1f5f9',
        }}>
            <div style={{ textAlign: 'center' }}>
                <Loader2 style={{ width: '40px', height: '40px', color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: 500, color: '#64748b' }}>Generating Document...</p>
            </div>
        </div>
    );
}

interface TicketPrintClientProps {
    ticket: any;
    type: 'INWARD' | 'OUTWARD' | 'CHALLAN';
    targetCompanyId?: number;
}

export default function TicketPrintClient({ ticket, type, targetCompanyId }: TicketPrintClientProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    if (!mounted) return <LoadingState />;

    return createPortal(
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'white',
            width: '100vw',
            height: '100vh',
        }}>
            <PDFViewer
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                showToolbar={true}
            >
                <TicketDocument ticket={ticket} type={type} targetCompanyId={targetCompanyId} />
            </PDFViewer>
        </div>,
        document.body
    );
}
