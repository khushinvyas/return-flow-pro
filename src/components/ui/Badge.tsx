import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'outline' | 'success' | 'warning' | 'error' | 'blue' | 'purple';
    className?: string;
    style?: React.CSSProperties;
}

export function Badge({ children, variant = 'default', className = '', style = {} }: BadgeProps) {

    const variants: Record<string, React.CSSProperties> = {
        default: {
            background: 'var(--secondary)',
            color: 'var(--secondary-foreground)',
        },
        outline: {
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
        },
        success: { // Green
            background: '#ecfdf5', // emerald-50
            color: '#059669',     // emerald-600
        },
        warning: { // Orange/Amber
            background: '#fff7ed', // orange-50
            color: '#ea580c',     // orange-600
        },
        error: { // Red
            background: '#fef2f2', // red-50
            color: '#dc2626',     // red-600
        },
        blue: {
            background: '#eff6ff',
            color: '#2563eb',
        },
        purple: {
            background: '#f3e8ff',
            color: '#9333ea',
        }
    };

    return (
        <span
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                ...variants[variant],
                ...style,
            }}
        >
            {children}
        </span>
    );
}
