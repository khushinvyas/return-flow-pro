import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, fullWidth = false, className = '', style, ...props }, ref) => {
        return (
            <div style={{ width: fullWidth ? '100%' : 'auto', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {label && (
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`input ${className}`}
                    style={{
                        width: '100%',
                        ...style
                    }}
                    {...props}
                />
                {error && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--error)' }}>
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
