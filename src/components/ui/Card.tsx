'use client';

import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    interactive?: boolean;
}

export function Card({ children, className = '', noPadding = false, interactive = false, style, ...props }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`card ${interactive ? 'card-interactive' : ''} ${className}`}
            style={{
                padding: noPadding ? '0' : '1.5rem',
                cursor: interactive ? 'pointer' : 'default',
                ...style
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className={className}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }} className={className}>
            {children}
        </h3>
    );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={className}>{children}</div>;
}
