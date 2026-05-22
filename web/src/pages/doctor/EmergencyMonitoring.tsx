
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
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight flex items-center gap-3">
             <ShieldAlert size={36} className="text-status-error animate-pulse" />
             Emergency Monitoring
          </h1>
          <p className="text-status-error font-bold bg-status-error/10 inline-block px-3 py-1 rounded-full border border-status-error/20">
             LIVE: {alertsToDisplay.length} Active Alerts
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="text-center py-20 text-text-muted">Initializing emergency link...</div>
      ) : alertsToDisplay.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-status-success/20">
          <div className="w-20 h-20 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">All Clear</h2>
          <p className="text-text-secondary">No active emergency SOS alerts from your patients.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {alertsToDisplay.map((alert: any, i: number) => (
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                     key={alert.id}
                     className={`glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all ${alert.priority === 'CRITICAL' ? 'border border-status-error/50 shadow-[0_0_30px_rgba(244,63,94,0.1)]' : ''}`}
                   >
                     {alert.priority === 'CRITICAL' && <div className="absolute top-0 right-0 w-32 h-32 bg-status-error/20 blur-3xl rounded-full animate-pulse"></div>}

                     <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-5">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${alert.bg} ${alert.color}`}>
                              <alert.icon size={28} />
                           </div>
                           <div>
                              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${alert.color}`}>{alert.priority} • {alert.time}</p>
                              <h3 className="text-xl font-bold text-white mb-1"><span className="text-text-secondary mr-2 font-medium">{alert.patient}</span> {alert.message}</h3>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-4 pt-4 border-t border-border-subtle mt-2 relative z-10">
                        <button className="flex-1 py-3.5 bg-bg-surface hover:bg-white/5 rounded-xl font-bold transition-colors text-sm flex justify-center items-center gap-2 text-white border border-border-subtle">
                           <PhoneCall size={18}/> Contact Caregiver
                        </button>
                        <button 
                           onClick={() => navigate(`/doctor/patients/${alert.patientId}`)}
                           className={`flex-1 py-3.5 rounded-xl font-bold transition-colors text-sm flex justify-center items-center gap-2 text-white shadow-sm ${alert.priority === 'CRITICAL' ? 'bg-status-error hover:bg-status-error/80 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-brand-purple hover:bg-brand-purple/80 shadow-[0_0_15px_rgba(112,0,255,0.4)]'}`}
                        >
                           View Workspace <ArrowRight size={18}/>
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
