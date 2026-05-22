import { Activity, Droplet, HeartPulse, Moon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'Mon', bp: 120, sugar: 95 },
  { name: 'Tue', bp: 118, sugar: 98 },
  { name: 'Wed', bp: 122, sugar: 92 },
  { name: 'Thu', bp: 125, sugar: 105 },
  { name: 'Fri', bp: 119, sugar: 90 },
  { name: 'Sat', bp: 115, sugar: 85 },
  { name: 'Sun', bp: 121, sugar: 94 },
];

export function HealthReports() {
  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <header className="mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">Health Analytics</h1>
        <p className="text-gray-400">AI-driven insights from your vitals.</p>
      </header>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6 rounded-3xl border border-white/5">
          <HeartPulse className="text-red-400 mb-4" size={28} />
          <h3 className="text-gray-400 text-sm mb-1">Blood Pressure</h3>
          <p className="text-2xl font-bold text-white">120/80 <span className="text-sm font-normal text-green-400 ml-1">Normal</span></p>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/5">
          <Droplet className="text-blue-400 mb-4" size={28} />
          <h3 className="text-gray-400 text-sm mb-1">Blood Sugar</h3>
          <p className="text-2xl font-bold text-white">95 <span className="text-sm font-normal text-gray-500">mg/dL</span></p>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/5">
          <Moon className="text-purple-400 mb-4" size={28} />
          <h3 className="text-gray-400 text-sm mb-1">Avg Sleep</h3>
          <p className="text-2xl font-bold text-white">7h 20m</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-brand-neon/30 bg-brand-neon/5 shadow-[0_0_20px_rgba(0,240,255,0.05)]">
          <Activity className="text-brand-neon mb-4" size={28} />
          <h3 className="text-brand-neon text-sm font-bold mb-1">AI Health Score</h3>
          <p className="text-2xl font-bold text-white">92 / 100</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass p-8 rounded-3xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-6">Weekly Trends</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7000FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7000FF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A2E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="bp" stroke="#7000FF" strokeWidth={3} fillOpacity={1} fill="url(#colorBp)" />
              <Area type="monotone" dataKey="sugar" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorSugar)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
