'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <div className={cn("flex flex-1 w-full", !isHome && "max-w-7xl mx-auto px-4 md:px-6")}>
            {!isHome && <Sidebar />}
            <main className={cn("flex-1 min-w-0", !isHome ? "py-6 md:pl-8" : "w-full")}>
                {children}
            </main>
        </div>
    );
}
