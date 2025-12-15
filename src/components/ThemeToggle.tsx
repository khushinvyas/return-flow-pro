'use client';

import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/Switch';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Initial mount hydration fix
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div style={{ width: '3rem', height: '1.5rem' }} />; // prevent formatting shifts
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sun size={18} style={{ opacity: isDark ? 0.5 : 1, transition: 'opacity 0.2s', color: 'hsl(var(--foreground))' }} />
            <Switch
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                id="theme-switch"
            />
            <Moon size={18} style={{ opacity: isDark ? 1 : 0.5, transition: 'opacity 0.2s', color: 'hsl(var(--foreground))' }} />
        </div>
    );
}
