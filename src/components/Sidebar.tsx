import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, Ticket, Users, Package, Building2, Settings, ShieldCheck } from 'lucide-react';
import styles from './Sidebar.module.css';

import GlobalSearch from '@/components/GlobalSearch';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function Sidebar() {
    const session = await getSession();
    const isGlobalAdmin = session?.isGlobalAdmin;

    let user = { name: 'Guest', role: 'Viewer' };

    if (session?.userId) {
        const dbUser = await prisma.user.findUnique({
            where: { id: Number(session.userId) },
            select: { name: true, role: true }
        });
        if (dbUser) {
            user = { name: dbUser.name, role: dbUser.role };
        }
    }

    const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <aside className={`${styles.sidebar} glass no-print`} style={{
            background: 'hsl(var(--card) / 0.8)', // Override for glass effect
            borderRight: '1px solid hsl(var(--border))'
        }}>
            <div className={styles.logo}>
                <Image src="/logo.png" alt="ReturnFlow Pro" width={180} height={40} style={{ objectFit: 'contain' }} />
            </div>

            <div style={{ padding: '0 1rem 1rem' }}>
                <GlobalSearch />
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <Link key={item.name} href={item.href} className={styles.navLink}>
                        <item.icon size={20} />
                        <span>{item.name}</span>
                    </Link>
                ))}

                {isGlobalAdmin && (
                    <Link href="/admin" className={styles.navLink} style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <ShieldCheck size={20} color="var(--primary)" />
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Super Admin</span>
                    </Link>
                )}
            </nav>

            <div className={styles.footer}>
                <div className={styles.userProfile}>
                    <div className={styles.avatar} style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))', color: 'white' }}>{initials}</div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName} style={{ fontWeight: 600 }}>{user.name}</span>
                        <span className={styles.userRole} style={{ color: 'hsl(var(--secondary-foreground))' }}>{user.role}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
