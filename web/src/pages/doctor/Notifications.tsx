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
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">Notifications Inbox</h1>
          <p className="text-gray-400">Your central hub for operational alerts and requests.</p>
        </div>
        <button className="text-sm font-bold text-brand-neon hover:text-white transition-colors flex items-center gap-2">
          <CheckCircle2 size={16} /> Mark all as read
        </button>
      </header>

      <div className="space-y-4">
        {notifications.map((notif, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            key={notif.id}
            className={`glass p-6 rounded-3xl border transition-colors flex gap-6 cursor-pointer ${notif.unread ? 'border-brand-purple/50 bg-brand-purple/5' : 'border-white/5 hover:border-white/20'}`}
          >
             <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#1A1A2E] ${notif.color}`}>
                <notif.icon size={20} />
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                   <h3 className={`text-lg font-bold ${notif.unread ? 'text-white' : 'text-gray-300'}`}>{notif.title}</h3>
                   <span className="text-xs text-gray-500 font-bold">{notif.time}</span>
                </div>
                <p className="text-sm text-gray-400">{notif.desc}</p>
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
