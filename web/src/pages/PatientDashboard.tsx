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
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 mb-1 tracking-tight">
            Patient overview
          </h1>
          <p className="text-zinc-400 font-normal text-sm">
            Active medication schedule and health monitoring for {user?.name || 'Alex Patel'}.
          </p>
        </div>
        <Link to="/patient/emergency" className="hidden md:flex items-center gap-2 bg-red-950/20 text-red-400 px-4 py-2 rounded-lg border border-red-900/40 hover:bg-red-950/40 transition-colors text-xs font-medium">
          <HeartPulse size={16} />
          Emergency SOS
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Action Banner: Spotlight Card (8 cols) */}
        <Link to="/patient/medicines" className="md:col-span-8 p-6 rounded-xl border border-zinc-800 bg-zinc-900 group flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">Medication schedule</h2>
            <p className="text-zinc-400 mb-6 max-w-md font-normal text-sm leading-relaxed">
              {medicinesCount} active prescription{medicinesCount === 1 ? '' : 's'} scheduled for today. Confirm dose times and log adherence in your timeline.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sky-400 font-medium text-xs">
            <span>Open schedule</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        {/* AI Health Score Card (4 cols) */}
        <Link to="/patient/reports" className="md:col-span-4 p-6 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col justify-center items-center text-center hover:border-zinc-700 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-3 text-sky-400">
            <Activity size={22} />
          </div>
          <h3 className="text-3xl font-semibold text-zinc-100 mb-1">92</h3>
          <p className="text-xs font-medium text-zinc-400">Health score · +4 vs last month</p>
        </Link>

        {/* Appointments Quick Link (7 cols) */}
        <Link to="/patient/appointments" className="md:col-span-7 p-6 rounded-xl border border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center mb-4">
              <Activity size={20} />
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mb-1">Upcoming consultations</h3>
            <p className="text-zinc-400 text-xs mb-6 font-normal">Review scheduled telemedicine appointments with your physician.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
            <span>View appointments</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        {/* Caretaker Booking Quick Link (5 cols) */}
        <Link to="/patient/caretakers" className="md:col-span-5 p-6 rounded-xl border border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center mb-4">
              <PhoneCall size={20} />
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mb-1">Caregiver network</h3>
            <p className="text-zinc-400 text-xs mb-6 font-normal">Emergency caretaker contacts and fast support dispatch.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
            <span>Manage caregivers</span>
            <ArrowRight size={14} />
          </div>
        </Link>
      </div>

      {/* Monitored Peers Panel */}
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <Heart size={18} className="text-zinc-400" /> Monitored family and peers
        </h2>
        {isLoadingPeers ? (
          <div className="text-center py-6 text-zinc-500 text-xs">Loading records...</div>
        ) : monitoredPeers.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs">
            No connected family members. Go to <Link to="/patient/settings" className="text-sky-400 hover:underline">Settings</Link> to connect.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monitoredPeers.map((peer: any) => (
              <div 
                key={peer.id}
                onClick={() => setSelectedPeer(peer)}
                className="bg-zinc-950 p-5 rounded-lg border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${peer.first_name}`} alt="Avatar" />
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-100 text-sm">{peer.first_name} {peer.last_name}</h4>
                      <p className="text-xs text-zinc-500 font-mono">{peer.mg_pat_id}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs py-1.5 border-b border-zinc-800">
                    <span className="text-zinc-400">Adherence</span>
                    <span className="text-zinc-200 font-medium">{peer.adherence_score}% (vs 90% avg)</span>
                  </div>
                  <div className="flex justify-between text-xs py-1.5">
                    <span className="text-zinc-400">Status</span>
                    <span className={`font-medium ${peer.health_status === 'CRITICAL' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {peer.health_status === 'CRITICAL' ? 'Critical' : 'Stable'}
                    </span>
                  </div>
                </div>
                <button className="w-full mt-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium hover:bg-zinc-800 transition-colors">
                  View medication timeline
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compliance Timeline Modal */}
      <AnimatePresence>
        {selectedPeer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 p-6 w-full max-w-lg relative rounded-xl shadow-lg"
            >
              <button 
                onClick={() => setSelectedPeer(null)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-900 p-1.5 rounded-md border border-zinc-800"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-zinc-800">
                <div className="w-12 h-12 rounded-full border border-zinc-700 overflow-hidden bg-zinc-800">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPeer.first_name}`} alt="Avatar" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100">{selectedPeer.first_name} {selectedPeer.last_name}</h3>
                  <p className="text-xs text-zinc-400 font-mono">{selectedPeer.mg_pat_id} · Adherence: <strong className="text-zinc-200">{selectedPeer.adherence_score}%</strong></p>
                </div>
              </div>

              <h4 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
                <Pill size={16} className="text-sky-400" /> Prescribed medication compliance
              </h4>

              {isLoadingSchedule ? (
                <div className="text-center py-6 text-zinc-500 text-xs">Loading compliance data...</div>
              ) : peerSchedule.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">No scheduled prescriptions found for today.</div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {peerSchedule.map((item: any) => (
                    <div key={item.id} className="bg-zinc-900 p-3.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h5 className="font-medium text-zinc-200 text-xs">{item.name}</h5>
                          <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">{item.dosage}</span>
                        </div>
                        <p className="text-xs text-zinc-500 flex items-center gap-1"><Clock size={11} className="text-zinc-400" /> {item.timing}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{item.instructions}</p>
                      </div>
                      
                      <div>
                        {item.isTaken ? (
                          <div className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-medium flex items-center gap-1">
                            <ShieldCheck size={12} /> Taken at {item.takenAt}
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium">
                            Pending
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
