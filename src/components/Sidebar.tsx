import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, Ticket, Users, Package, Building2, Settings, ShieldCheck, Truck } from 'lucide-react';
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

const reportItems = [
    { name: 'Vendor Inventory', href: '/reports/vendor-inventory', icon: Truck },
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
        <aside className={`${styles.sidebar} no-print`}>
            <div className={styles.logo}>
                <Image src="/logo-v2.png" alt="ReturnFlow Pro" width={200} height={50} style={{ objectFit: 'contain' }} />
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

                {/* Reports Section */}
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid hsl(var(--border) / 0.3)' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'hsl(var(--secondary-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.5rem', marginBottom: '0.5rem', display: 'block' }}>
                        Reports
                    </span>
                    {reportItems.map((item) => (
                        <Link key={item.name} href={item.href} className={styles.navLink}>
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </div>

                {isGlobalAdmin && (
                    <Link href="/admin" className={styles.navLink} style={{ marginTop: '1rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem' }}>
                        <ShieldCheck size={20} style={{ color: 'hsl(var(--primary))' }} />
                        <span style={{ fontWeight: 600, color: 'hsl(var(--primary))' }}>Super Admin</span>
                    </Link>
                )}
            </nav>

            <div className={styles.footer}>
                <div className={styles.userProfile}>
                    <div className={styles.avatar}>{initials}</div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userRole}>{user.role}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
