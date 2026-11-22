import { Activity, HeartPulse, ShieldAlert, Droplet, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';

export function WorkspaceOverview({ patientId: _patientId }: { patientId: string }) {
  const chartData = [
    { name: 'Mon', bp: 120 },
    { name: 'Tue', bp: 118 },
    { name: 'Wed', bp: 122 },
    { name: 'Thu', bp: 124 },
    { name: 'Fri', bp: 119 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Clinical Summary Banner */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-sky-400 shrink-0">
          <Activity size={18} />
        </div>
        <div>
          <h3 className="font-medium text-zinc-100 text-sm mb-0.5">Clinical observation summary</h3>
          <p className="text-zinc-400 text-xs leading-relaxed font-normal">
            Patient demonstrates stable blood pressure trends over the last 5 days. Adherence improved by 12% vs the previous consultation period. Blood sugar remained in normal range (95 mg/dL).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Vitals Column: 4 Columns */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
            <h3 className="text-zinc-400 font-medium text-xs mb-2 flex items-center gap-1.5">
              <HeartPulse size={14} className="text-zinc-400"/> Blood pressure
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-zinc-100">120/80</span>
              <span className="text-xs font-medium text-emerald-400">Stable vs baseline</span>
            </div>
          </div>
          
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
            <h3 className="text-zinc-400 font-medium text-xs mb-2 flex items-center gap-1.5">
              <Droplet size={14} className="text-zinc-400"/> Blood sugar
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-zinc-100">95 <span className="text-xs text-zinc-500 font-normal">mg/dL</span></span>
              <span className="text-xs font-medium text-emerald-400">-2% vs yesterday</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-red-900/40 bg-red-950/20">
            <h3 className="text-red-400 font-medium text-xs mb-2 flex items-center gap-1.5">
              <ShieldAlert size={14}/> Recent alerts
            </h3>
            <div className="text-xs border-l-2 border-red-500 pl-3 py-0.5">
              <p className="text-zinc-200 font-medium">Missed Lisinopril</p>
              <p className="text-zinc-400 text-[11px] mt-0.5">Yesterday, 21:00</p>
            </div>
          </div>
        </div>

        {/* Charts & Timeline Column: 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 h-[280px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-zinc-300 font-medium text-xs">5-day systolic vitals trend (mmHg)</h3>
              <span className="text-[11px] text-zinc-500">Benchmark: 120 mmHg</span>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
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

          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
            <h3 className="text-zinc-300 font-medium text-xs mb-3">Upcoming schedule</h3>
            <div className="space-y-2">
              {[
                { time: '14:00', title: 'Video consultation', type: 'consult' },
                { time: '21:00', title: 'Lisinopril 10mg', type: 'med' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-xs">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-zinc-900 text-zinc-400 border border-zinc-800">
                    <Clock size={15} />
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-200">{item.title}</h4>
                    <p className="text-[11px] text-zinc-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
