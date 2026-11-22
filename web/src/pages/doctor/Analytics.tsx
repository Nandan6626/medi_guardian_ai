import { Activity, FileText, Download } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function Analytics() {
  // Realistic adherence telemetry (not artificially uphill)
  const chartData = [
    { name: 'Mon', adherence: 84 },
    { name: 'Tue', adherence: 86 },
    { name: 'Wed', adherence: 82 },
    { name: 'Thu', adherence: 88 },
    { name: 'Fri', adherence: 85 },
    { name: 'Sat', adherence: 79 },
    { name: 'Sun', adherence: 81 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Global analytics</h1>
          <p className="text-sm text-zinc-400 mt-1 font-normal">Operational metrics and adherence telemetry across all monitored patients.</p>
        </div>
        <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-800 transition-colors flex items-center gap-2">
          <Download size={15} /> Export PDF
        </button>
      </header>

      {/* Top Metrics - Equal cards equal padding on 4-pixel grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
          <p className="text-xs font-normal text-zinc-400 mb-1">Total patients</p>
          <p className="text-2xl font-semibold text-zinc-100">128</p>
          <p className="text-[11px] text-zinc-500 mt-1">+8 vs last month</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
          <p className="text-xs font-normal text-zinc-400 mb-1">Average adherence</p>
          <p className="text-2xl font-semibold text-zinc-100">82.4%</p>
          <p className="text-[11px] text-zinc-500 mt-1">vs 80.0% fleet target</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
          <p className="text-xs font-normal text-zinc-400 mb-1">Weekly consultations</p>
          <p className="text-2xl font-semibold text-zinc-100">45</p>
          <p className="text-[11px] text-zinc-500 mt-1">-3 vs previous week</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
          <p className="text-xs font-normal text-zinc-400 mb-1">Emergency cases</p>
          <p className="text-2xl font-semibold text-red-400">3</p>
          <p className="text-[11px] text-zinc-500 mt-1">active this week</p>
        </div>
      </div>

      {/* Varied card widths: Spotlight Chart (8 cols) + Secondary Insights (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Spotlight Chart: One highlight color per chart, clean grid */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-zinc-800 bg-zinc-900 h-[420px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <Activity size={18} className="text-sky-400"/> 7-day fleet adherence
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Daily confirmation percentage across prescribed timetables</p>
              </div>
              <span className="text-xs text-zinc-400 font-mono">Benchmark: 80%</span>
            </div>
          </div>

          <div className="flex-1 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }} 
                  itemStyle={{ color: '#f4f4f5' }}
                  formatter={(value: any) => [`${value}%`, 'Adherence']}
                />
                <Area 
                  type="monotone" 
                  dataKey="adherence" 
                  stroke="#0284c7" 
                  strokeWidth={2} 
                  fill="#0284c7" 
                  fillOpacity={0.15} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>Aggregated from 128 registered patient profiles</span>
            <span>Last synched: 5 min ago</span>
          </div>
        </div>

        {/* Secondary Insights Column (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-zinc-400"/> Operational insights
            </h2>
            <div className="space-y-3">
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                <p className="text-xs font-medium text-zinc-300 mb-1">Weekend night doses</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Most missed medicines across your fleet occur during weekend night schedules. Enabling automated caregiver alerts on weekends is advised.
                </p>
              </div>
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                <p className="text-xs font-medium text-zinc-300 mb-1">Voice reminder impact</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Adherence rates average 20% higher for patients who have enabled automated voice notifications.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-500">
            Review recommendations with clinical staff.
          </div>
        </div>
      </div>
    </div>
  );
}
