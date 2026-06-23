import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Activity, HeartPulse, ArrowRight, ShieldCheck, Heart, Pill, Clock, X, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function PatientDashboard() {
  const { user } = useAuthStore();
  const [selectedPeer, setSelectedPeer] = useState<any | null>(null);

  // 1. Fetch total medicines count
  const { data: medicinesCount = 0 } = useQuery({
    queryKey: ['patient_medicines_count', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user) return 0;
      const { count: countSelf } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user.id);
      
      const { count: countSchedules } = await supabase
        .from('medicine_schedules')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user.id);

      return (countSelf || 0) + (countSchedules || 0);
    }
  });

  // 2. Fetch monitored peers (other patients we have connection with as CAREGIVER and status ACTIVE)
  const { data: monitoredPeers = [], isLoading: isLoadingPeers } = useQuery({
    queryKey: ['monitored_peers', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user) return [];

      const { data: myProf } = await supabase
        .from('patient_profiles')
        .select('user_id')
        .eq('id', user.id)
        .single();
      
      if (!myProf || !myProf.user_id) return [];

      const { data: connections } = await supabase
        .from('patient_connections')
        .select('patient_id')
        .eq('connected_user_id', myProf.user_id)
        .eq('connection_type', 'CAREGIVER')
        .eq('status', 'ACTIVE');

      if (!connections || connections.length === 0) return [];
      const peerPatientIds = connections.map(c => c.patient_id).filter(Boolean);

      const { data: peers } = await supabase
        .from('patient_profiles')
        .select('*')
        .in('id', peerPatientIds);

      return peers || [];
    }
  });

  // 3. Fetch selected peer's schedules and logs for today
  const { data: peerSchedule = [], isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['peer_schedule', selectedPeer?.id],
    enabled: !!selectedPeer?.id,
    queryFn: async () => {
      if (!selectedPeer) return [];

      // Fetch medicine schedules
      const { data: schedules, error: schedErr } = await supabase
        .from('medicine_schedules')
        .select('*')
        .eq('patient_id', selectedPeer.id);

      if (schedErr || !schedules) return [];

      // Fetch logs of today
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);
      const todayEnd = new Date();
      todayEnd.setHours(23,59,59,999);

      const { data: logs } = await supabase
        .from('medicine_logs')
        .select('*')
        .eq('patient_id', selectedPeer.id)
        .gte('taken_time', todayStart.toISOString())
        .lte('taken_time', todayEnd.toISOString());

      return schedules.map(s => {
        const takenLog = (logs || []).find(l => l.schedule_id === s.id && l.status === 'TAKEN');
        return {
          id: s.id,
          name: s.medicine_name,
          dosage: s.dosage,
          timing: s.timing_slots ? s.timing_slots.join(', ') : 'N/A',
          instructions: s.instructions || 'No special instructions',
          isTaken: !!takenLog,
          takenAt: takenLog ? new Date(takenLog.taken_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
        };
      });
    }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex justify-between items-end mb-12">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold text-text-primary mb-2 tracking-tight"
          >
            Welcome back, {user?.name?.split(' ')[0] || 'Alex'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary font-semibold text-lg"
          >
            Your AI healthcare assistant is monitoring your vitals.
          </motion.p>
        </div>
        <Link to="/patient/emergency" className="hidden md:flex items-center gap-2 bg-status-error/10 text-status-error px-6 py-3 rounded-2xl border border-status-error/20 hover:bg-status-error/20 transition-all font-bold shadow-[0_0_20px_rgba(244,63,94,0.15)] group">
          <HeartPulse size={20} className="group-hover:animate-ping" />
          Emergency SOS
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Main Action Banner */}
        <Link to="/patient/medicines" className="md:col-span-8 glass-panel p-8 rounded-3xl group relative overflow-hidden flex flex-col justify-center min-h-60 hover:border-white/20 transition-all">
           <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-purple/20 rounded-full blur-[60px] group-hover:bg-brand-neon/20 transition-colors duration-700"></div>
           <div className="relative z-10">
             <h2 className="text-3xl font-extrabold text-white mb-3">My Medicines</h2>
             <p className="text-text-secondary mb-8 max-w-md font-medium text-lg">
               You have {medicinesCount} medicine{medicinesCount === 1 ? '' : 's'} scheduled in your profile. View your timeline to mark them as taken.
             </p>
             <div className="inline-flex items-center gap-2 text-brand-neon font-bold bg-brand-neon/10 border border-brand-neon/20 px-5 py-2.5 rounded-xl group-hover:bg-brand-neon/20 transition-colors">
                Open Scheduler <ArrowRight size={18} />
             </div>
           </div>
        </Link>

        {/* AI Health Score */}
        <Link to="/patient/reports" className="md:col-span-4 glass-panel p-8 rounded-3xl flex flex-col justify-center items-center text-center group hover:border-white/20 transition-all">
           <div className="w-20 h-20 rounded-full bg-linear-to-br from-brand-purple to-brand-neon flex items-center justify-center mb-6 ai-glow relative">
             <div className="absolute inset-1 bg-bg-surface rounded-full flex items-center justify-center">
               <Activity size={28} className="text-brand-neon" />
             </div>
           </div>
           <h3 className="text-5xl font-extrabold text-white mb-2">92</h3>
           <p className="text-sm font-bold text-text-muted uppercase tracking-widest">AI Health Score</p>
        </Link>

        {/* Appointments Quick Link */}
        <Link to="/patient/appointments" className="md:col-span-6 glass-panel p-8 rounded-3xl transition-all group hover:border-brand-purple/30 hover:bg-brand-purple/5">
           <div className="w-14 h-14 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mb-6 border border-brand-purple/20 shadow-inner">
             <Activity size={28} />
           </div>
           <h3 className="text-2xl font-bold text-white mb-3">Upcoming Consults</h3>
           <p className="text-text-secondary mb-8 font-medium">Check scheduled video consultations with your doctor.</p>
           <div className="flex items-center gap-2 text-brand-purple font-bold group-hover:translate-x-2 transition-transform">
               View Details <ArrowRight size={18} />
           </div>
        </Link>

        {/* Caretaker Booking Quick Link */}
        <Link to="/patient/caretakers" className="md:col-span-6 glass-panel p-8 rounded-3xl transition-all group hover:border-brand-neon/30 hover:bg-brand-neon/5">
           <div className="w-14 h-14 rounded-2xl bg-brand-neon/10 text-brand-neon flex items-center justify-center mb-6 border border-brand-neon/20 shadow-inner">
             <PhoneCall size={28} />
           </div>
           <h3 className="text-2xl font-bold text-white mb-3">Book Caretaker</h3>
           <p className="text-text-secondary mb-8 font-medium">Call an emergency caretaker immediately when you need quick support.</p>
           <div className="flex items-center gap-2 text-brand-neon font-bold group-hover:translate-x-2 transition-transform">
               Connect Now <ArrowRight size={18} />
           </div>
        </Link>
      </div>

      {/* Monitored Peers Panel */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Heart className="text-red-400" /> Monitored Peers & Loved Ones
        </h2>
        {isLoadingPeers ? (
          <div className="text-center py-8 text-gray-500">Loading peers...</div>
        ) : monitoredPeers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No monitored peers. Go to <Link to="/patient/settings" className="text-brand-neon underline hover:text-white">Settings</Link> to connect and monitor family members or friends.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monitoredPeers.map((peer: any) => (
              <div 
                key={peer.id}
                onClick={() => setSelectedPeer(peer)}
                className="bg-[#1A1A2E]/50 p-6 rounded-3xl border border-white/5 hover:border-brand-purple/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full border border-white/10 bg-[#141425] overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${peer.first_name}`} alt="Avatar" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-base">{peer.first_name} {peer.last_name}</h4>
                      <p className="text-xs text-brand-neon font-mono mt-0.5">{peer.mg_pat_id}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-white/5">
                    <span className="text-gray-400">Adherence Score</span>
                    <span className="text-white font-bold">{peer.adherence_score}%</span>
                  </div>
                  <div className="flex justify-between text-sm py-2">
                    <span className="text-gray-400">Status</span>
                    <span className={`font-bold ${peer.health_status === 'CRITICAL' ? 'text-status-error animate-pulse' : 'text-status-success'}`}>{peer.health_status}</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2.5 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 text-xs font-bold transition-all hover:bg-brand-purple/20 hover:text-brand-neon">
                  Monitor Medicines
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compliance Timeline Modal */}
      <AnimatePresence>
        {selectedPeer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-deep p-8 w-full max-w-lg relative rounded-3xl"
            >
              <button 
                onClick={() => setSelectedPeer(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                <div className="w-14 h-14 rounded-full border border-white/10 overflow-hidden bg-[#141425]">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPeer.first_name}`} alt="Avatar" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white">{selectedPeer.first_name} {selectedPeer.last_name}</h3>
                  <p className="text-xs text-text-secondary mt-1 font-mono">{selectedPeer.mg_pat_id} • Adherence Score: <strong className="text-brand-neon">{selectedPeer.adherence_score}%</strong></p>
                </div>
              </div>

              <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Pill size={18} className="text-brand-neon" /> Today's Medicine Intake Compliance
              </h4>

              {isLoadingSchedule ? (
                <div className="text-center py-8 text-gray-500">Loading compliance data...</div>
              ) : peerSchedule.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No scheduled clinical prescriptions found for today.</div>
              ) : (
                <div className="space-y-4 max-h-87.5 overflow-y-auto pr-1">
                  {peerSchedule.map((item: any) => (
                    <div key={item.id} className="bg-[#1A1A2E]/80 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-extrabold text-white text-sm">{item.name}</h5>
                          <span className="text-[10px] text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded font-bold">{item.dosage}</span>
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} className="text-brand-neon" /> {item.timing}</p>
                        <p className="text-[11px] text-gray-500 mt-1 italic">{item.instructions}</p>
                      </div>
                      
                      <div>
                        {item.isTaken ? (
                          <div className="px-3 py-1.5 rounded-xl bg-status-success/15 border border-status-success/30 text-status-success text-xs font-bold flex items-center gap-1.5">
                            <ShieldCheck size={14} /> Taken at {item.takenAt}
                          </div>
                        ) : (
                          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-bold">
                            Not Taken Yet
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
