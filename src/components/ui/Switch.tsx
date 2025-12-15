'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    id?: string;
}

export function Switch({ checked, onCheckedChange, id }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            id={id}
            onClick={() => onCheckedChange(!checked)}
            style={{
                width: '3rem',
                height: '1.5rem',
                backgroundColor: checked ? 'hsl(var(--primary))' : 'hsl(var(--input))',
                borderRadius: '9999px',
                position: 'relative',
                transition: 'background-color 0.2s',
                border: 'none',
                cursor: 'pointer',
                padding: '2px'
            }}
        >
            <motion.span
                layout
                transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 30
                }}
                style={{
                    display: 'block',
                    width: '1.25rem',
                    height: '1.25rem',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    x: checked ? '1.5rem' : '0rem'
                }}
            />
        </button>
    );
}
