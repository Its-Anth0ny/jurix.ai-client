'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Zap,
  BarChart2,
  Settings2,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'WORK',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/judgments', label: 'Judgments', icon: FileText },
      { href: '/ai-actions', label: 'AI Actions', icon: Zap, badge: '3' },
    ],
  },
  {
    label: 'INSIGHTS',
    items: [
      { href: '/analytics', label: 'Analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'ADMIN',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings2 },
    ],
  },
];

export function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initial = user?.email ? user.email[0].toUpperCase() : '?';

  return (
    <aside
      style={{ width: collapsed ? 56 : 220, transition: 'width 0.2s ease-in-out' }}
      className="flex-shrink-0 flex flex-col h-screen bg-sidebar border-r border-sidebar-border text-sidebar-foreground overflow-hidden"
    >
      <div className="flex items-center h-11 px-3 gap-2 border-b border-sidebar-border flex-shrink-0">
        <Image
          src="/jurix_logo.png"
          alt="Jurix.ai"
          width={28}
          height={28}
          className="flex-shrink-0"
          priority
        />
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight truncate">Jurix.ai</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#4a4a4a' }}>
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 text-sm transition-colors relative',
                        isActive
                          ? 'bg-accent text-accent-foreground border-l-2 border-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="ml-auto text-[10px] font-semibold bg-destructive text-white rounded-full px-1.5 py-0.5 leading-none">
                          {item.badge}
                        </span>
                      )}
                      {collapsed && item.badge && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex-shrink-0 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center h-9 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2 px-3 py-2 border-t border-sidebar-border">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-xs font-semibold">{initial}</span>
          </div>
          {!collapsed && (
            <>
              <span className="text-xs text-muted-foreground truncate flex-1 min-w-0">
                {user?.email}
              </span>
              <button
                onClick={logout}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
