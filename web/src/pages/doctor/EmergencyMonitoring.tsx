import { ShieldAlert, PhoneCall, AlertTriangle, ArrowRight, Pill } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function EmergencyMonitoring() {
  const navigate = useNavigate();

  const alerts = [
    { id: 1, patient: 'Alex', patientId: 1, type: 'SOS', message: 'Triggered SOS Alert', time: 'Just Now', priority: 'CRITICAL', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/20' },
    { id: 2, patient: 'John Doe', patientId: 2, type: 'Medicine', message: 'Missed heart medication (Amlodipine)', time: '10 mins ago', priority: 'CRITICAL', icon: Pill, color: 'text-red-400', bg: 'bg-red-500/20' },
    { id: 3, patient: 'Emma Watson', patientId: 3, type: 'Warning', message: 'Missed 3 doses this week', time: '2 hours ago', priority: 'MEDIUM', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600 mb-2 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div> Emergency Command Center
          </h1>
          <p className="text-gray-400">Global real-time monitoring of all connected high-risk patients.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              2 ACTIVE ALERTS
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            {alerts.map((alert, i) => (
               <motion.div 
                 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                 key={alert.id}
                 className={`glass p-6 rounded-3xl border relative overflow-hidden group hover:border-white/30 transition-all ${alert.priority === 'CRITICAL' ? 'border-red-500/30 bg-gradient-to-r from-red-500/5 to-transparent' : 'border-white/5'}`}
               >
                 <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${alert.bg} ${alert.color}`}>
                          <alert.icon size={24} />
                       </div>
                       <div>
                          <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${alert.color}`}>{alert.priority} • {alert.time}</p>
                          <h3 className="text-xl font-bold text-white mb-1"><span className="text-gray-400 mr-2">{alert.patient}</span> {alert.message}</h3>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4 border-t border-white/5">
                    <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors text-sm flex justify-center items-center gap-2">
                       <PhoneCall size={16}/> Contact Caregiver
                    </button>
                    <button 
                       onClick={() => navigate(`/doctor/patients/${alert.patientId}`)}
                       className={`flex-1 py-3 rounded-xl font-bold transition-colors text-sm flex justify-center items-center gap-2 text-black ${alert.priority === 'CRITICAL' ? 'bg-red-400 hover:bg-red-500' : 'bg-white hover:bg-gray-200'}`}
                    >
                       View Patient Workspace <ArrowRight size={16}/>
                    </button>
                 </div>
               </motion.div>
            ))}
         </div>

         <div className="space-y-6">
            <div className="glass p-8 rounded-3xl border border-white/5 text-center">
               <ShieldAlert size={48} className="mx-auto text-gray-500 mb-4 opacity-50" />
               <h3 className="text-xl font-bold text-white mb-2">Escalation Protocol</h3>
               <p className="text-gray-400 text-sm leading-relaxed mb-6">If an SOS alert remains unacknowledged for more than 5 minutes, it will automatically escalate to local emergency services.</p>
               <button className="w-full py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-bold text-sm">Review Protocols</button>
            </div>
         </div>
      </div>
    </div>
  );
}
