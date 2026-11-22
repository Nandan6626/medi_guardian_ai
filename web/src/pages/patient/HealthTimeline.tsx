import { Clock, Activity, Calendar, FileText } from 'lucide-react';

export function HealthTimeline() {
  const events = [
    { type: 'appointment', date: 'Today, 10:00 AM', title: 'Cardiology review', desc: 'Dr. Sarah Jenkins' },
    { type: 'medicine', date: 'Yesterday', title: 'Prescription updated', desc: 'Added Metformin 500mg' },
    { type: 'alert', date: 'Oct 12, 2026', title: 'Elevated BP recorded', desc: '145/95 mmHg recorded. Physician notified.' },
    { type: 'health', date: 'Oct 01, 2026', title: 'Monthly report generated', desc: 'Overall health score improved by 5% vs previous month.' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight mb-1">Health timeline</h1>
        <p className="text-xs text-zinc-400">Chronological history of appointments, prescriptions, and biometric alerts.</p>
      </header>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800"></div>
        
        <div className="space-y-4">
          {events.map((event, i) => (
            <div 
              key={i} 
              className="flex gap-4 relative"
            >
              <div className="w-12 flex-shrink-0 flex justify-center z-10">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-700 text-zinc-300">
                  {event.type === 'appointment' && <Calendar size={14} />}
                  {event.type === 'medicine' && <FileText size={14} />}
                  {event.type === 'alert' && <Activity size={14} />}
                  {event.type === 'health' && <Clock size={14} />}
                </div>
              </div>
              
              <div className="flex-1 p-4 rounded-xl border border-zinc-800 bg-zinc-900">
                <p className="text-xs text-zinc-500 mb-1">{event.date}</p>
                <h3 className="text-sm font-semibold text-zinc-100 mb-0.5">{event.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
