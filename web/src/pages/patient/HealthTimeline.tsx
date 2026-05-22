import { Clock, Activity, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export function HealthTimeline() {
  const events = [
    { type: 'appointment', date: 'Today, 10:00 AM', title: 'Cardiology Review', desc: 'Dr. Sarah Jenkins', color: 'blue' },
    { type: 'medicine', date: 'Yesterday', title: 'Prescription Updated', desc: 'Added Metformin 500mg', color: 'purple' },
    { type: 'alert', date: 'Oct 12, 2026', title: 'High BP Alert', desc: '145/95 mmHg recorded. Doctor notified.', color: 'red' },
    { type: 'health', date: 'Oct 01, 2026', title: 'Monthly Report Generated', desc: 'Overall health score improved by 5%.', color: 'green' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <header className="mb-12">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">Health Timeline</h1>
        <p className="text-gray-400">Your interactive healthcare journey.</p>
      </header>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-white/10"></div>
        
        <div className="space-y-8">
          {events.map((event, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="flex gap-8 relative"
            >
              <div className="w-16 flex-shrink-0 flex justify-center z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-[#141423] ${
                  event.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                  event.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                  event.color === 'red' ? 'bg-red-500/20 text-red-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {event.type === 'appointment' && <Calendar size={20} />}
                  {event.type === 'medicine' && <FileText size={20} />}
                  {event.type === 'alert' && <Activity size={20} />}
                  {event.type === 'health' && <Clock size={20} />}
                </div>
              </div>
              
              <div className="glass flex-1 p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-colors">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">{event.date}</p>
                <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                <p className="text-sm text-gray-400">{event.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
