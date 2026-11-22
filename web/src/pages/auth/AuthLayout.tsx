import type { ReactNode } from 'react';
import { ShieldCheck, Activity, Clock, CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen font-sans bg-zinc-950 text-zinc-100">
      
      {/* Left Panel: Authentication Form */}
      <div className="flex flex-col justify-center flex-1 px-8 py-12 sm:px-16 lg:px-24">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center gap-2.5 mb-8">
            <img src="/logo.png" alt="MediGuardian Logo" className="w-8 h-8 rounded-lg object-contain shrink-0" />
            <span className="text-lg font-semibold tracking-tight text-zinc-100">MediGuardian</span>
          </div>

          <h1 className="mb-2 text-2xl font-semibold text-zinc-100 md:text-3xl">{title}</h1>
          <p className="mb-8 text-sm text-zinc-400 font-normal">{subtitle}</p>

          {children}
        </div>
      </div>

      {/* Right Panel: Real Product Preview (Replaces stock illustration) */}
      <div className="relative flex-col items-center justify-center hidden w-1/2 p-12 lg:flex bg-zinc-900 border-l border-zinc-800">
        <div className="w-full max-w-md space-y-4">
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-medium text-zinc-300">Live patient monitoring</span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">MG-1001</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-zinc-400" />
                  <div>
                    <p className="text-xs font-medium text-zinc-200">Atorvastatin 20mg</p>
                    <p className="text-[11px] text-zinc-400">Scheduled 20:00 · 1 tablet</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  Confirmed
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-zinc-400" />
                  <div>
                    <p className="text-xs font-medium text-zinc-200">Blood pressure telemetry</p>
                    <p className="text-[11px] text-zinc-400">120/80 mmHg · Normal</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-400">Recorded</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>Overall adherence: 94%</span>
              <span>+3% vs last week</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/70">
            <h2 className="text-sm font-semibold text-zinc-200 mb-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-sky-400" />
              Verified clinical infrastructure
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Standardized medication tracking with direct physician oversight and emergency caregiver alerting.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
