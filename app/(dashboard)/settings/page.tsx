'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { getCurrentUser } from '@/lib/auth';
import { Copy, Check, Moon, Sun } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const sections = ['Account', 'Appearance', 'Notifications', 'API', 'Security'] as const;
type Section = typeof sections[number];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('Account');
  const [copied, setCopied] = useState(false);
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const user = getCurrentUser();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const initials = user?.email ? user.email[0].toUpperCase() : '?';

  async function copyApiUrl() {
    await navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        <nav className="w-48 flex-shrink-0 space-y-1">
          {sections.map(s => (
            <button key={s} onClick={() => setActiveSection(s)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === s ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
              {s}
            </button>
          ))}
        </nav>

        <div className="flex-1 space-y-4">
          {activeSection === 'Account' && (
            <>
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-border">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary text-lg font-bold">{initials}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user?.email || '—'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Member</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email address</label>
                  <div className="h-9 px-3 flex items-center bg-secondary border border-border rounded-lg text-sm text-muted-foreground">{user?.email || '—'}</div>
                  <p className="text-xs text-muted-foreground">Contact support to change your email.</p>
                </div>
              </div>
              <div className="bg-[#1a0a0a] border border-[#3a1a1a] rounded-xl p-6">
                <h3 className="text-sm font-medium text-[#EF4444] mb-1">Danger zone</h3>
                <p className="text-xs text-muted-foreground mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-xs text-[#EF4444] border border-[#3a1a1a] px-3 py-1.5 rounded-lg hover:bg-[#2a1a1a] transition-colors">Delete account</button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone. All your data will be permanently deleted.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={logout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Account</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}

          {activeSection === 'Appearance' && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-medium text-foreground mb-1">Theme</h3>
              <p className="text-xs text-muted-foreground mb-4">Choose your preferred appearance.</p>
              <div className="flex gap-3">
                {(['dark', 'light'] as const).map(t => (
                  <button key={t} onClick={() => setTheme(t)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${theme === t ? 'border-primary bg-accent text-foreground' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/50'}`}>
                    {t === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                    {theme === t && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'Notifications' && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-medium text-foreground mb-1">Notifications</h3>
              <p className="text-xs text-muted-foreground">Notification preferences coming soon.</p>
            </div>
          )}

          {activeSection === 'API' && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">API Endpoint</h3>
                <p className="text-xs text-muted-foreground mb-3">The backend API URL used by this application.</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-9 px-3 flex items-center bg-secondary border border-border rounded-lg text-sm text-muted-foreground font-mono">{apiUrl}</div>
                  <button onClick={copyApiUrl} className="h-9 px-3 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5">
                    {copied ? <><Check className="w-3.5 h-3.5 text-[#22C55E]" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Security' && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-medium text-foreground mb-1">Security</h3>
              <p className="text-xs text-muted-foreground">Security settings coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
