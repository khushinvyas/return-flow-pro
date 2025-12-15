'use client';

import { useEffect } from 'react';

export default function PrintAutoTrigger() {
    useEffect(() => {
        // Wait for animations (PageTransition) to finish before printing
        const timer = setTimeout(() => {
            window.print();
        }, 800); // 800ms delay

        return () => clearTimeout(timer);
    }, []);

    return null;
}
