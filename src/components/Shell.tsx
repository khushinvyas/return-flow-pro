'use client';

import { usePathname } from 'next/navigation';
import PageTransition from './PageTransition';

interface ShellProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    banner: React.ReactNode;
}

const PUBLIC_ROUTES = ['/login', '/register', '/subscription-expired'];

export default function Shell({ children, sidebar, banner }: ShellProps) {
    const pathname = usePathname();
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (isPublic) {
        return (
            <main style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
                <PageTransition>{children}</PageTransition>
            </main>
        );
    }

    return (
        <div className="layout-wrapper" style={{ display: 'flex', minHeight: '100vh', background: 'hsl(var(--background))' }}>
            {sidebar}
            <main className="main-content bg-slate-50" style={{
                marginLeft: '280px',
                width: 'calc(100% - 280px)',
                minHeight: '100vh',
                padding: '2rem',
                position: 'relative',
                paddingTop: banner ? '4rem' : '2rem'
            }}>
                {banner}

                {/* Background Gradient Mesh */}
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    pointerEvents: 'none',
                    background: 'radial-gradient(circle at 100% 0%, hsla(var(--primary), 0.05) 0%, transparent 50%), radial-gradient(circle at 0% 100%, hsla(var(--accent), 0.05) 0%, transparent 50%)'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <PageTransition>{children}</PageTransition>
                </div>
            </main>
        </div>
    );
}
