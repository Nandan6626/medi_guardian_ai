import { UserPlus, FileText, Calendar, Pill, Brain, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function Notifications() {
  const notifications = [
    { id: 1, type: 'Report', title: 'Alex uploaded new report', desc: 'Blood test results are available for review.', time: '10 mins ago', icon: FileText, color: 'text-blue-400', unread: true },
    { id: 2, type: 'Appointment', title: 'Emma requested appointment', desc: 'Requested a video consult for tomorrow afternoon.', time: '1 hour ago', icon: Calendar, color: 'text-green-400', unread: true },
    { id: 3, type: 'Alert', title: 'John missed BP medication', desc: 'Amlodipine 5mg was not marked as taken.', time: '3 hours ago', icon: Pill, color: 'text-red-400', unread: true },
    { id: 4, type: 'Connection', title: 'Sarah accepted request', desc: 'You are now connected to MG-PAT-10459.', time: '1 day ago', icon: UserPlus, color: 'text-brand-purple', unread: false },
    { id: 5, type: 'AI', title: 'AI Fleet Insight generated', desc: 'Weekly adherence trends report is ready.', time: '2 days ago', icon: Brain, color: 'text-brand-neon', unread: false },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight mb-1">Notifications inbox</h1>
          <p className="text-zinc-400 text-xs">Central feed for clinical alerts and schedule requests.</p>
        </div>
        <button className="text-xs font-medium text-sky-400 hover:underline transition-colors flex items-center gap-1.5">
          <CheckCircle2 size={14} /> Mark all as read
        </button>
      </header>

      <div className="space-y-3">
        {notifications.map((notif, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            key={notif.id}
            className={`p-4 rounded-xl border transition-colors flex gap-4 cursor-pointer ${notif.unread ? 'border-sky-500/30 bg-zinc-900' : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900'}`}
          >
             <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-zinc-850 border border-zinc-800 text-zinc-300">
                <notif.icon size={18} />
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-start mb-0.5">
                   <h3 className={`text-sm font-medium ${notif.unread ? 'text-zinc-100' : 'text-zinc-400'}`}>{notif.title}</h3>
                   <span className="text-xs text-zinc-500">{notif.time}</span>
                </div>
                <p className="text-xs text-zinc-400 font-normal">{notif.desc}</p>
             </div>
             {notif.unread && (
                <div className="w-3 h-3 bg-brand-neon rounded-full shrink-0 shadow-[0_0_10px_#00F0FF]"></div>
             )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
