'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LayoutDashboard, FileText, Zap, BarChart2, Settings2, Search } from 'lucide-react';

const pages = [
  { id: 'dashboard', label: 'Dashboard', description: 'Overview and AI insights', href: '/dashboard', icon: LayoutDashboard },
  { id: 'judgments', label: 'Judgments', description: 'Manage court documents', href: '/judgments', icon: FileText },
  { id: 'ai-actions', label: 'AI Actions', description: 'Review queue and decisions', href: '/ai-actions', icon: Zap },
  { id: 'analytics', label: 'Analytics', description: 'Insights and trends', href: '/analytics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', description: 'Account and preferences', href: '/settings', icon: Settings2 },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = pages.filter(p =>
    p.label.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) { setQuery(''); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && filtered[selected]) { router.push(filtered[selected].href); onClose(); }
    if (e.key === 'Escape') { onClose(); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 bg-card border-border overflow-hidden max-w-lg gap-0">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions..."
            className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="py-2 max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No results found</p>
          ) : (
            filtered.map((p, i) => (
              <button key={p.id} onClick={() => { router.push(p.href); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === selected ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${i === selected ? 'bg-primary' : 'bg-secondary'}`}>
                  <p.icon className={`w-3.5 h-3.5 ${i === selected ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
