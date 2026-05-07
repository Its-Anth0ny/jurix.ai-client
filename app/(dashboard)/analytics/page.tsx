'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';

interface Doc { _id: string; status: string; created_at?: string; }

export default function AnalyticsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = getToken(); if (!token) return;
      try { const { documents } = await api.getDocuments(token); setDocs(documents || []); }
      catch (e) { /* silent */ }
      finally { setIsLoading(false); }
    }
    load();
  }, []);

  const statusData = [
    { name: 'Completed', value: docs.filter(d => d.status === 'completed').length, color: '#22C55E' },
    { name: 'Processing', value: docs.filter(d => d.status === 'processing').length, color: '#60a5fa' },
    { name: 'Failed', value: docs.filter(d => d.status === 'failed').length, color: '#EF4444' },
    { name: 'Uploaded', value: docs.filter(d => d.status === 'uploaded').length, color: '#818cf8' },
  ].filter(d => d.value > 0);

  const monthlyData = (() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en', { month: 'short' });
      months[key] = 0;
    }
    docs.forEach(d => {
      if (!d.created_at) return;
      const date = new Date(d.created_at);
      const key = date.toLocaleString('en', { month: 'short' });
      if (key in months) months[key]++;
    });
    return Object.entries(months).map(([name, value]) => ({ name, value }));
  })();

  const complianceRate = docs.length > 0 ? Math.round((docs.filter(d => d.status === 'completed').length / docs.length) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload?.length) return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs">
        <p className="text-muted-foreground">{label}</p>
        <p className="text-foreground font-medium">{payload[0].value} documents</p>
      </div>
    );
    return null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Insights derived from your judgment data</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: docs.length, color: 'text-foreground' },
          { label: 'Compliance Rate', value: `${complianceRate}%`, color: 'text-[#22C55E]' },
          { label: 'Completed', value: docs.filter(d => d.status === 'completed').length, color: 'text-[#22C55E]' },
          { label: 'Failed', value: docs.filter(d => d.status === 'failed').length, color: 'text-[#EF4444]' },
        ].map(s => (
          isLoading ? <Skeleton key={s.label} className="h-24 rounded-xl" /> :
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Documents Processed — Last 6 Months</h2>
          {isLoading ? <Skeleton className="h-48" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,70,229,0.05)' }} />
                <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Documents by Status</h2>
          {isLoading ? <Skeleton className="h-48" /> : statusData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {statusData.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
                      <span className="text-xs text-muted-foreground">{s.name}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
