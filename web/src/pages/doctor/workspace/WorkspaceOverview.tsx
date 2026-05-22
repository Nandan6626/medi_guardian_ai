import { Activity, HeartPulse, ShieldAlert, Droplet, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

export function WorkspaceOverview({ patientId: _patientId }: { patientId: string }) {
  const chartData = [
    { name: 'Mon', bp: 120, sugar: 95 },
    { name: 'Tue', bp: 118, sugar: 98 },
    { name: 'Wed', bp: 122, sugar: 92 },
    { name: 'Thu', bp: 125, sugar: 105 },
    { name: 'Fri', bp: 119, sugar: 90 },
  ];

  return (
    <div className="space-y-6">
      
      {/* AI Summary Banner */}
      <div className="glass p-6 rounded-3xl border border-brand-neon/30 bg-gradient-to-r from-brand-neon/10 to-transparent flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-neon/20 flex items-center justify-center text-brand-neon shrink-0">
          <Activity size={24} />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg mb-1">AI Health Summary</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Patient shows stable blood pressure trends over the last 5 days. Adherence has improved by 12% since the last consultation. Recommended to review the recent slight spike in blood sugar on Thursday.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vitals Column */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/5">
            <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2"><HeartPulse size={14} className="text-red-400"/> Blood Pressure</h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-white">120/80</span>
              <span className="text-sm font-bold text-green-400 mb-1">Stable</span>
            </div>
          </div>
          
          <div className="glass p-6 rounded-3xl border border-white/5">
            <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2"><Droplet size={14} className="text-blue-400"/> Blood Sugar</h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-white">95 <span className="text-lg text-gray-500 font-normal">mg/dL</span></span>
              <span className="text-sm font-bold text-green-400 mb-1">-2%</span>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-red-500/20 bg-red-500/5">
            <h3 className="text-red-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2"><ShieldAlert size={14}/> Recent Alerts</h3>
            <div className="space-y-3">
              <div className="text-sm border-l-2 border-red-500 pl-3">
                <p className="text-white font-medium">Missed Lisinopril</p>
                <p className="text-gray-400 text-xs">Yesterday, 9:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Timeline Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/5 h-[280px] flex flex-col">
            <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-4">5-Day Vitals Trend</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7000FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7000FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="bp" stroke="#7000FF" strokeWidth={3} fillOpacity={1} fill="url(#colorBp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5">
            <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-4">Upcoming Schedule</h3>
            <div className="space-y-3">
              {[
                { time: '14:00 PM', title: 'Video Consultation', type: 'consult', icon: Activity, color: 'text-brand-neon', bg: 'bg-brand-neon/10' },
                { time: '21:00 PM', title: 'Lisinopril 10mg', type: 'med', icon: Clock, color: 'text-brand-purple', bg: 'bg-brand-purple/10' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-[#1A1A2E] p-3 rounded-2xl border border-white/5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-400">{item.time}</p>
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
