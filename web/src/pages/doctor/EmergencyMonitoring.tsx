
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, PhoneCall, AlertTriangle, Pill, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EmergencyMonitoring() {
  const navigate = useNavigate();

  // In a real app, this would use a websocket for live updates
  const { data: emergencies = [], isLoading } = useQuery({
    queryKey: ['doctor_emergencies'],
    queryFn: async () => {
      const res = await api.get('/doctor/patients'); 
      return res.data.filter((p: any) => p.status === 'Critical');
    },
    refetchInterval: 5000 
  });

  const mockAlerts = [
    { id: 1, patient: 'Alex', patientId: 1, type: 'SOS', message: 'Triggered SOS Alert', time: 'Just Now', priority: 'CRITICAL', icon: ShieldAlert, color: 'text-status-error', bg: 'bg-status-error/10 border-status-error/20' },
    { id: 2, patient: 'John Doe', patientId: 2, type: 'Medicine', message: 'Missed heart medication (Amlodipine)', time: '10 mins ago', priority: 'CRITICAL', icon: Pill, color: 'text-status-error', bg: 'bg-status-error/10 border-status-error/20' },
    { id: 3, patient: 'Emma Watson', patientId: 3, type: 'Warning', message: 'Missed 3 doses this week', time: '2 hours ago', priority: 'MEDIUM', icon: AlertTriangle, color: 'text-status-warning', bg: 'bg-status-warning/10 border-status-warning/20' },
  ];

  const alertsToDisplay = emergencies.length > 0 ? emergencies.map((p: any) => ({
    id: p.id,
    patient: p.name,
    patientId: p.id,
    type: 'SOS',
    message: 'Triggered SOS Alert',
    time: 'Just Now',
    priority: 'CRITICAL',
    icon: ShieldAlert,
    color: 'text-status-error',
    bg: 'bg-status-error/10 border-status-error/20'
  })) : mockAlerts;

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 mb-1 tracking-tight flex items-center gap-2">
             <ShieldAlert size={24} className="text-red-400" />
             Emergency monitoring
          </h1>
          <p className="text-red-400 text-xs font-normal">
             {alertsToDisplay.length} active emergency alerts
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="text-center py-20 text-zinc-500 text-xs">Initializing emergency link...</div>
      ) : alertsToDisplay.length === 0 ? (
        <div className="rounded-xl p-8 text-center border border-zinc-800 bg-zinc-900">
          <div className="w-12 h-12 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
             <CheckCircle size={24} />
          </div>
          <h2 className="text-base font-semibold text-zinc-100 mb-1">All clear</h2>
          <p className="text-zinc-400 text-xs">No active emergency SOS alerts from monitored patients.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {alertsToDisplay.map((alert: any, i: number) => (
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                     key={alert.id}
                     className={`rounded-xl p-5 border bg-zinc-900 ${alert.priority === 'CRITICAL' ? 'border-red-900/50' : 'border-zinc-800'}`}
                   >
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-red-950/40 text-red-400 border border-red-900/40">
                              <alert.icon size={20} />
                           </div>
                           <div>
                              <p className="text-xs text-red-400 mb-0.5">{alert.priority.toLowerCase()} · {alert.time}</p>
                              <h3 className="text-sm font-semibold text-zinc-100"><span className="text-zinc-400 mr-1.5 font-normal">{alert.patient}</span> {alert.message}</h3>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-3 pt-3 border-t border-zinc-800 mt-2">
                        <button className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 rounded-lg font-medium text-xs flex justify-center items-center gap-1.5 text-zinc-300 border border-zinc-700 transition-colors">
                           <PhoneCall size={14}/> Contact caregiver
                        </button>
                        <button 
                           onClick={() => navigate(`/doctor/patients/${alert.patientId}`)}
                           className="flex-1 py-2 rounded-lg font-medium text-xs flex justify-center items-center gap-1.5 text-white bg-sky-700 hover:bg-sky-700 transition-colors"
                        >
                           <span>View workspace</span>
                           <ArrowRight size={14}/>
                        </button>
                     </div>
                   </motion.div>
                ))}
              </AnimatePresence>
           </div>

           <div className="space-y-6">
              <div className="glass-panel rounded-3xl p-8 text-center flex flex-col items-center">
                 <div className="w-20 h-20 bg-bg-surface border border-border-subtle rounded-full flex items-center justify-center mb-6">
                   <ShieldAlert size={40} className="text-text-muted" />
                 </div>
                 <h3 className="text-xl font-extrabold text-white mb-3">Escalation Protocol</h3>
                 <p className="text-text-secondary text-sm font-medium leading-relaxed mb-8 px-4">If an SOS alert remains unacknowledged for more than 5 minutes, it will automatically escalate to local emergency services.</p>
                 <button className="w-full py-3.5 bg-bg-surface text-white rounded-xl hover:bg-white/10 transition-colors font-bold text-sm border border-border-subtle">Review Protocols</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
