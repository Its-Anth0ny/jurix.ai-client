'use client';

import Link from 'next/link';
import {
  FileText, Zap, CheckCircle, Clock, Scale, Building2,
  Search, BarChart2, ClipboardList, GitBranch, Shield,
  Users, Server, ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-xs font-bold text-white">J</div>
            <span className="font-semibold text-foreground">Jurix.ai</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#trust" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</a>
            <a href="#workflow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors">Sign in</Link>
            <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium">Book Demo</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(79,70,229,0.15) 0%, transparent 60%)' }} />

        <div className="flex flex-col items-center gap-6 max-w-4xl">
          <span className="animate-fade-in-up inline-flex items-center gap-2 bg-accent border border-primary/20 text-primary text-xs px-3 py-1.5 rounded-full font-medium" style={{ animationDelay: '0ms' }}>
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            AI-powered · Government-ready · Enterprise-grade
          </span>

          <h1 className="animate-fade-in-up text-5xl md:text-7xl font-bold tracking-tight text-foreground" style={{ animationDelay: '100ms' }}>
            Court judgment intelligence
            <br />
            for government departments
          </h1>

          <p className="animate-fade-in-up text-lg text-muted-foreground max-w-xl mx-auto" style={{ animationDelay: '200ms' }}>
            Upload any court order. Jurix extracts deadlines, generates action plans, and routes work to the right department, in seconds.
          </p>

          <div className="animate-fade-in-up flex items-center gap-4 flex-wrap justify-center" style={{ animationDelay: '300ms' }}>
            <Link href="/signup" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">Get Started Free</Link>
            <Link href="/login" className="border border-border text-foreground px-6 py-3 rounded-lg hover:bg-secondary transition-colors">Sign in</Link>
          </div>

          <div className="animate-fade-in-up bg-card border border-border rounded-xl mt-12 mx-auto max-w-4xl w-full overflow-hidden shadow-2xl shadow-primary/10" style={{ animationDelay: '400ms' }}>
            <div className="h-10 bg-secondary border-b border-border flex items-center gap-2 px-4">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]/60" />
              <div className="w-3 h-3 rounded-full bg-[#22C55E]/60" />
              <span className="ml-3 text-xs text-muted-foreground">Jurix Dashboard</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Judgments Loaded', value: '142', color: 'text-primary' },
                  { label: 'Pending Review', value: '8', color: 'text-[#F59E0B]' },
                  { label: 'Completed', value: '127', color: 'text-[#22C55E]' },
                  { label: 'Departments', value: '4', color: 'text-foreground' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-secondary rounded-lg p-3 border border-border">
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-4 gap-px bg-border text-xs text-muted-foreground">
                  {['Case ID', 'Department', 'Deadline', 'Status'].map((col) => (
                    <div key={col} className="bg-secondary px-3 py-2 font-medium">{col}</div>
                  ))}
                </div>
                {[
                  ['HC-2024-0891', 'Revenue', 'Jun 15, 2025', 'In Review'],
                  ['SC-2024-1204', 'PWD', 'Jun 22, 2025', 'Pending'],
                  ['HC-2024-0744', 'Urban Dev', 'Jul 01, 2025', 'Assigned'],
                ].map(([id, dept, dl, status]) => (
                  <div key={id} className="grid grid-cols-4 gap-px bg-border">
                    {[id, dept, dl, status].map((cell, i) => (
                      <div key={i} className="bg-card px-3 py-2 text-xs text-muted-foreground">{cell}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">THE PROBLEM</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 text-foreground">The old way is broken</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '📄', title: 'Manual judgment reading', desc: 'Lawyers spend hours parsing dense legal text to extract action items.' },
              { icon: '⏰', title: 'Missed compliance deadlines', desc: 'Critical court-mandated dates slip through the cracks without automated tracking.' },
              { icon: '🔀', title: 'Wrong department assignments', desc: 'Orders land on the wrong desk, causing delays and accountability gaps.' },
              { icon: '🎲', title: 'Blind appeal decisions', desc: 'Without precedent analysis, appeal recommendations are guesswork.' },
              { icon: '📋', title: 'Zero audit trail', desc: 'No record of who read what, when, or what action was taken on any judgment.' },
            ].map((item) => (
              <div key={item.title} className="bg-card border border-border rounded-xl p-6">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Workflow */}
      <section id="workflow" className="py-24 px-6 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">THE SOLUTION</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 text-foreground">How Jurix works</h2>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {[
              { step: '01', icon: '📤', title: 'Upload PDF', desc: 'Drop any court order or judgment document.' },
              { step: '02', icon: '🤖', title: 'AI Analysis', desc: 'NLP extracts parties, orders, and deadlines.' },
              { step: '03', icon: '📝', title: 'Action Plan', desc: 'Structured compliance tasks auto-generated.' },
              { step: '04', icon: '👁️', title: 'Human Review', desc: 'Officers verify and approve extracted data.' },
              { step: '05', icon: '🏢', title: 'Department Assignment', desc: 'Tasks routed to the right team instantly.' },
            ].map((item, idx) => (
              <div key={item.step} className="flex md:flex-col items-center md:items-start gap-3 md:gap-0 flex-1">
                <div className="bg-card border border-border rounded-xl p-5 flex-1 w-full">
                  <div className="text-xs font-mono text-primary mb-2">{item.step}</div>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-foreground text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
                {/* {idx < 4 && <ArrowRight className="w-5 h-5 text-primary shrink-0 hidden md:block md:self-center md:-mt-4 md:mx-1" />} */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">CAPABILITIES</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 text-foreground">Everything you need</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { Icon: FileText, title: 'Judgment Summarization', desc: 'Instant plain-language summaries' },
              { Icon: Zap, title: 'AI Action Plans', desc: 'Auto-generated compliance tasks' },
              { Icon: CheckCircle, title: 'Compliance Tracking', desc: 'Real-time status across orders' },
              { Icon: Clock, title: 'Deadline Detection', desc: 'Never miss a court-imposed date' },
              { Icon: Scale, title: 'Appeal Recommendation', desc: 'Precedent-backed appeal guidance' },
              { Icon: Building2, title: 'Department Assignment', desc: 'Smart routing to right teams' },
              { Icon: Search, title: 'AI Search', desc: 'Semantic search across all cases' },
              { Icon: BarChart2, title: 'Analytics', desc: 'Compliance metrics and trends' },
              { Icon: ClipboardList, title: 'Audit Logs', desc: 'Full immutable activity trail' },
              { Icon: GitBranch, title: 'Workflow Management', desc: 'Custom approval flows' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6 hover:-translate-y-0.5 transition-transform cursor-default">
                <Icon className="w-5 h-5 text-primary mb-3" />
                <div className="text-sm font-medium text-foreground">{title}</div>
                <div className="text-xs text-muted-foreground mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Trust */}
      <section id="trust" className="py-24 px-6 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">TRUST</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 text-foreground">Enterprise-grade security</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { Icon: Shield, title: 'Security', desc: 'End-to-end encryption for all documents and data at rest and in transit.' },
              { Icon: ClipboardList, title: 'Audit Logs', desc: 'Every action is immutably logged with timestamps and user attribution.' },
              { Icon: Users, title: 'Role-Based Access', desc: 'Granular permissions ensure officers only see what they need to.' },
              { Icon: Building2, title: 'Government Ready', desc: 'Designed for public sector compliance requirements and data residency.' },
              { Icon: Server, title: 'Scalable Architecture', desc: 'Handles thousands of concurrent judgments without performance degradation.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6 flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm mb-1">{title}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to modernise your department?</h2>
          <p className="text-muted-foreground mb-8">Bring AI-powered judgment processing to your department — from upload to action plan in seconds.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">Book Demo</Link>
            <Link href="/login" className="border border-border text-foreground px-6 py-3 rounded-lg hover:bg-secondary transition-colors">Try Platform</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-xs font-bold text-white">J</div>
            <span className="font-semibold text-foreground">Jurix.ai</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 Jurix.ai. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
