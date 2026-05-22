import { useState, useEffect } from 'react';
import { Video, Calendar, Clock, Plus, Loader2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { BookAppointmentModal } from '../../components/BookAppointmentModal';

interface Appointment {
  id: string;
  doctor_id: string;
  appointment_time: string;
  type: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  meeting_link?: string;
  clinical_notes?: string;
  doctor_name?: string;
  specialty?: string;
}

export function Appointments() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback map since we don't know exact doctor_profiles structure
  const DOCTOR_MAP: Record<string, { name: string; spec: string }> = {
    '93b86321-f726-4043-a410-b14d1b8d1aa0': { name: "Dr. Sarah Jenkins", spec: "Cardiology" },
    '1d7196dd-501e-47f7-9896-92b8f4bbba27': { name: "Dr. Michael Chen", spec: "General Practice" }
  };

  const fetchAppointments = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user.id)
        .order('appointment_time', { ascending: false });

      if (error) throw error;
      setAppointments(data as Appointment[] || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();

      // Real-time subscription
      const channel = supabase
        .channel('appointments-patient')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'appointments', filter: `patient_id=eq.${user.id}` },
          (payload) => {
            console.log('Realtime appointment change:', payload);
            fetchAppointments(); // Re-fetch to get latest data
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const upcoming = appointments.filter(a => ['SCHEDULED', 'ACTIVE'].includes(a.status));
  const past = appointments.filter(a => ['COMPLETED', 'CANCELLED'].includes(a.status));

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen relative">
      <header className="mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">Appointments</h1>
        <p className="text-gray-400">Manage your virtual and in-person consultations.</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={40} className="animate-spin text-brand-neon" />
        </div>
      ) : (
        <>
          {/* Upcoming */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              Upcoming Consultations
              <span className="bg-brand-neon/20 text-brand-neon text-xs px-2 py-1 rounded-full">{upcoming.length}</span>
            </h2>
            
            <AnimatePresence>
              {upcoming.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-10 rounded-3xl border border-dashed border-border-subtle flex flex-col items-center justify-center text-center">
                  <Calendar size={48} className="text-text-muted mb-4" />
                  <p className="text-text-secondary">No upcoming appointments.</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map(apt => {
                    const doc = DOCTOR_MAP[apt.doctor_id] || { name: `Doctor`, spec: "Specialist" };
                    const aptDate = new Date(apt.appointment_time);
                    const isActive = apt.status === 'ACTIVE';
                    
                    return (
                      <motion.div 
                        key={apt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`glass p-8 rounded-3xl border transition-all shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6
                          ${isActive ? 'border-brand-neon/50 bg-brand-neon/5 shadow-[0_0_30px_rgba(0,240,255,0.1)]' : 'border-border-subtle bg-bg-surface'}
                        `}
                      >
                        <div className="flex gap-6 items-center">
                          <div className={`w-20 h-20 rounded-full border-2 overflow-hidden shrink-0 ${isActive ? 'border-brand-neon glow-neon' : 'border-border-subtle'}`}>
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`} alt="Doctor" />
                          </div>
                          <div>
                            <p className={`${isActive ? 'text-brand-neon font-bold animate-pulse' : 'text-text-secondary font-medium'} text-sm tracking-wider uppercase mb-1`}>
                              {isActive ? 'Live Now' : `${aptDate.toLocaleDateString()} • ${aptDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                            </p>
                            <h3 className="text-2xl font-bold text-white mb-1">{doc.name}</h3>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                              {doc.spec} • 
                              {['video','VIDEO'].includes(apt.type) ? <span className="flex items-center gap-1"><Video size={14}/> Video Consult</span> : <span className="flex items-center gap-1"><Users size={14}/> In-Person</span>}
                            </p>
                          </div>
                        </div>
                        
                        {['video','VIDEO'].includes(apt.type) && (
                          <a 
                            href={isActive && apt.meeting_link ? apt.meeting_link : '#'}
                            target={isActive && apt.meeting_link ? "_blank" : "_self"}
                            rel="noreferrer"
                            className={`px-8 py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all
                              ${isActive 
                                ? 'bg-brand-neon text-black hover:bg-brand-neon/90 glow-neon shadow-lg' 
                                : 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'}
                            `}
                            onClick={(e) => { if(!isActive) e.preventDefault(); }}
                          >
                             <Video size={20} />
                             {isActive ? 'Join Call' : 'Awaiting Doctor'}
                          </a>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Past */}
          <div>
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              Past Visits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {past.length === 0 ? (
                 <p className="text-text-muted text-sm col-span-2">No past history found.</p>
               ) : (
                 past.map(apt => {
                   const doc = DOCTOR_MAP[apt.doctor_id] || { name: `Doctor`, spec: "Specialist" };
                   const aptDate = new Date(apt.appointment_time);
                   
                   return (
                     <div key={apt.id} className="glass p-6 rounded-2xl border border-white/5 flex gap-4 items-center bg-bg-surface/50 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-gray-500">
                          {['video','VIDEO'].includes(apt.type) ? <Video size={20} /> : <Users size={20} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white">{doc.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${apt.status === 'COMPLETED' ? 'bg-status-success/20 text-status-success' : 'bg-status-error/20 text-status-error'}`}>
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-1">{doc.spec}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {aptDate.toLocaleDateString()}</p>
                        </div>
                     </div>
                   );
                 })
               )}
            </div>
          </div>
        </>
      )}

      {/* FAB */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-10 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform z-10"
      >
         <Plus size={32} />
      </button>

      <BookAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          fetchAppointments();
          // Could also show a toast here
        }}
      />
    </div>
  );
}
