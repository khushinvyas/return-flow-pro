'use client';

import React from 'react';
import Link from 'next/link';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    href?: string;
    target?: string;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    href,
    target,
    style,
    disabled,
    ...props
}: ButtonProps) {
    // Construct class name based on variant and size
    const variantClass = `btn-${variant}`;
    const sizeClass = size === 'icon' ? 'p-2 w-10 h-10' : ''; // icon size/padding needs specific handling or util class

    // We can rely on globals.css for most visuals now, keeping inline for size overrides if needed for specific instances, 
    // but better to add size classes to globals.css later. For now, we will use the existing inline size logic merged 
    // or just assume standard sizes are handled by 'btn' base + specific overrides if really needed.
    // Actually, let's keep the inline size logic for now to ensure consistency until globals.css has full utility classes.

    const sizes: Record<string, React.CSSProperties> = {
        sm: { padding: '0.25rem 0.75rem', fontSize: '0.75rem', height: '2rem' },
        md: { padding: '0.625rem 1.25rem', fontSize: '0.875rem', height: '2.5rem' },
        lg: { padding: '0.75rem 1.5rem', fontSize: '1rem', height: '3rem' },
        icon: { padding: 0, width: '2.5rem', height: '2.5rem' }
    };

    const finalClassName = `btn ${variantClass} ${className}`;

    const content = (
        <>
            {isLoading && (
                <svg
                    className="animate-spin"
                    style={{ marginRight: '0.5rem', height: '1em', width: '1em', animation: 'spin 1s linear infinite' }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </svg>
            )}
            {children}
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className={finalClassName}
                style={{ ...sizes[size], ...style }}
                target={target}
            >
                {content}
            </Link>
        );
    }

    // Using motion.button for satisfying click feels
    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={finalClassName}
            style={{ ...sizes[size], ...style }}
            disabled={disabled || isLoading}
            {...(props as HTMLMotionProps<"button">)}
        >
            {content}
        </motion.button>
    );
}
