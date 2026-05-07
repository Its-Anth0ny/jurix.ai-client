'use client';

import { Menu, Search, Bell, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

export function Topbar({ onMobileMenuToggle, onOpenSearch }: { onMobileMenuToggle: () => void; onOpenSearch?: () => void }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const initial = user?.email ? user.email[0].toUpperCase() : '?';

  return (
    <header className="h-11 bg-background border-b border-border flex items-center px-3 gap-3 flex-shrink-0">
      <button
        onClick={onMobileMenuToggle}
        className="flex-shrink-0 p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors md:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      <div className="flex-1 max-w-sm">
        <button onClick={onOpenSearch} className="w-full bg-card border border-border rounded-md px-3 py-1.5 text-sm text-muted-foreground flex items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="flex-1 text-left">Search judgments...</span>
          <span className="flex-shrink-0 text-[10px] font-medium bg-secondary text-muted-foreground rounded px-1 py-0.5 leading-none">
            ⌘K
          </span>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          className="p-1.5 rounded text-muted-foreground opacity-40 cursor-not-allowed"
          aria-label="Notifications"
          title="Notifications coming soon"
          disabled
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div
          className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-1"
          aria-label={user?.email}
        >
          <span className="text-primary-foreground text-xs font-semibold">{initial}</span>
        </div>
      </div>
    </header>
  );
}
