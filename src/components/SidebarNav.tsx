'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ticket, Users, Package, Building2, Settings, ShieldCheck, ChevronRight } from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarNavProps {
    isGlobalAdmin?: boolean;
}

export function SidebarNav({ isGlobalAdmin }: SidebarNavProps) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-1 flex-1">
            {/* Section Label */}
            <div className="px-3 mb-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Main Menu</span>
            </div>

            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? 'text-white bg-gradient-to-r from-indigo-500/20 to-purple-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                    >
                        {/* Active Indicator */}
                        {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                        )}

                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25'
                                : 'bg-slate-800/50 group-hover:bg-slate-700/50'
                            }`}>
                            <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                        </div>

                        <span className="flex-1">{item.name}</span>

                        {/* Arrow on hover */}
                        <ChevronRight
                            size={14}
                            className={`transition-all duration-200 ${isActive
                                    ? 'text-indigo-400 opacity-100'
                                    : 'text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                                }`}
                        />
                    </Link>
                );
            })}

            {isGlobalAdmin && (
                <>
                    <div className="my-4 mx-3 border-t border-slate-800/50" />
                    <div className="px-3 mb-2">
                        <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-widest">Admin</span>
                    </div>
                    <Link
                        href="/admin"
                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${pathname?.startsWith('/admin')
                                ? 'text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                    >
                        {pathname?.startsWith('/admin') && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-purple-500 to-pink-500" />
                        )}

                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${pathname?.startsWith('/admin')
                                ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25'
                                : 'bg-slate-800/50 group-hover:bg-slate-700/50'
                            }`}>
                            <ShieldCheck size={16} className={pathname?.startsWith('/admin') ? 'text-white' : 'text-purple-400 group-hover:text-white'} />
                        </div>

                        <span className="flex-1">Super Admin</span>

                        <ChevronRight
                            size={14}
                            className={`transition-all duration-200 ${pathname?.startsWith('/admin')
                                    ? 'text-purple-400 opacity-100'
                                    : 'text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                                }`}
                        />
                    </Link>
                </>
            )}
        </nav>
    );
}
