import { Activity, Droplet, HeartPulse, Moon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'Mon', bp: 120 },
  { name: 'Tue', bp: 118 },
  { name: 'Wed', bp: 122 },
  { name: 'Thu', bp: 124 },
  { name: 'Fri', bp: 119 },
  { name: 'Sat', bp: 116 },
  { name: 'Sun', bp: 120 },
];

export function HealthReports() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight mb-1">Health analytics</h1>
        <p className="text-xs text-zinc-400">Vital signs and biometric telemetry trends.</p>
      </header>

      {/* Main Stats - Equal cards equal padding on 4-pixel grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
          <HeartPulse className="text-zinc-400 mb-3" size={20} />
          <h3 className="text-zinc-400 text-xs mb-1 font-normal">Blood pressure</h3>
          <p className="text-2xl font-semibold text-zinc-100">120/80</p>
          <p className="text-[11px] text-zinc-500 mt-1">Stable vs baseline</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
          <Droplet className="text-zinc-400 mb-3" size={20} />
          <h3 className="text-zinc-400 text-xs mb-1 font-normal">Blood sugar</h3>
          <p className="text-2xl font-semibold text-zinc-100">95 <span className="text-xs font-normal text-zinc-500">mg/dL</span></p>
          <p className="text-[11px] text-zinc-500 mt-1">-2% vs yesterday</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
          <Moon className="text-zinc-400 mb-3" size={20} />
          <h3 className="text-zinc-400 text-xs mb-1 font-normal">Average sleep</h3>
          <p className="text-2xl font-semibold text-zinc-100">7h 20m</p>
          <p className="text-[11px] text-zinc-500 mt-1">+30m vs last week</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
          <Activity className="text-sky-400 mb-3" size={20} />
          <h3 className="text-zinc-400 text-xs mb-1 font-normal">Health score</h3>
          <p className="text-2xl font-semibold text-zinc-100">92</p>
          <p className="text-[11px] text-zinc-500 mt-1">+4 vs last month</p>
        </div>
      </div>

      {/* Spotlight Chart: One highlight color per chart */}
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">7-day systolic vitals trend (mmHg)</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Recorded measurements against clinical target</p>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Target: 120 mmHg</span>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#f4f4f5' }}
                formatter={(val: any) => [`${val} mmHg`, 'Systolic BP']}
              />
              <Area type="monotone" dataKey="bp" stroke="#0284c7" strokeWidth={2} fill="#0284c7" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
