import { Activity, Brain, Download } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';

export function Analytics() {
  const chartData = [
    { name: 'Mon', adherence: 85, missed: 15 },
    { name: 'Tue', adherence: 88, missed: 12 },
    { name: 'Wed', adherence: 82, missed: 18 },
    { name: 'Thu', adherence: 90, missed: 10 },
    { name: 'Fri', adherence: 87, missed: 13 },
    { name: 'Sat', adherence: 75, missed: 25 },
    { name: 'Sun', adherence: 70, missed: 30 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-neon to-blue-500 mb-2">Global Analytics</h1>
          <p className="text-gray-400">High-level operational metrics across your entire patient fleet.</p>
        </div>
        <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
          <Download size={18} /> Export PDF
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6 rounded-3xl border border-white/5">
          <h3 className="text-gray-400 text-sm mb-2 font-bold uppercase">Total Patients</h3>
          <p className="text-3xl font-bold text-white">128</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/5">
          <h3 className="text-gray-400 text-sm mb-2 font-bold uppercase">Avg Adherence</h3>
          <p className="text-3xl font-bold text-brand-neon">82.4%</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/5">
          <h3 className="text-gray-400 text-sm mb-2 font-bold uppercase">Weekly Consults</h3>
          <p className="text-3xl font-bold text-white">45</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-red-500/20 bg-red-500/5">
          <h3 className="text-red-400 text-sm mb-2 font-bold uppercase">Emergency Cases</h3>
          <p className="text-3xl font-bold text-red-400">3</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/5 h-[400px] flex flex-col">
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Activity className="text-brand-neon" size={20}/> 7-Day Adherence vs Missed Doses</h2>
           <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAdh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMissed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="adherence" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorAdh)" />
                  <Area type="monotone" dataKey="missed" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorMissed)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="space-y-6">
           <div className="glass p-6 rounded-3xl border border-brand-purple/30 bg-gradient-to-br from-brand-purple/10 to-transparent">
             <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Brain className="text-brand-purple" size={20}/> Operational AI Insights</h2>
             <div className="space-y-4">
                <div className="bg-[#1A1A2E] p-4 rounded-xl border border-white/5">
                  <p className="text-sm text-gray-300">"Most missed medicines across your fleet occur during weekend night schedules. Consider enabling Caregiver Notifications for weekends."</p>
                </div>
                <div className="bg-[#1A1A2E] p-4 rounded-xl border border-white/5">
                  <p className="text-sm text-gray-300">"Adherence rates are 20% higher for patients who have enabled the Voice Reminder features."</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
