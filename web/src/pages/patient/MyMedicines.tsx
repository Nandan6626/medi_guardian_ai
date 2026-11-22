import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { AnimatedMedicineStack } from '../../components/AnimatedMedicineStack';
import { Clock, TrendingUp, Mic, CheckCircle2 } from 'lucide-react';
import { AddMedicineModal } from '../../components/AddMedicineModal';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export function MyMedicines() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('doctor');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selfReminders, setSelfReminders] = useState<any[]>([]);
  const [doctorMeds, setDoctorMeds] = useState<any[]>([]);
  const [isDoctorLoading, setIsDoctorLoading] = useState(true);

  const fetchDoctorMeds = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('medicine_schedules')
        .select('*')
        .eq('patient_id', user.id)
        .eq('is_self_reminder', false);

      if (error) throw error;

      const formatted = (data || []).map(r => ({
        id: r.id,
        name: r.medicine_name,
        dosage: r.dosage,
        timing: r.timing_slots ? JSON.stringify(r.timing_slots) : '',
        duration: r.frequency,
        is_self_reminder: false,
        food_instruction: r.instructions,
      }));
      setDoctorMeds(formatted);
    } catch (err) {
      console.error('Error fetching doctor medicines:', err);
    } finally {
      setIsDoctorLoading(false);
    }
  };

  const fetchSelfReminders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('patient_id', user.id)
        .order('reminder_time', { ascending: true });
        
      if (error) throw error;
      
      // Map to AnimatedMedicineStack format
      const formatted = (data || []).map(r => ({
        id: r.id,
        name: r.medicine_name,
        dosage: r.dosage,
        timing: r.reminder_time ? r.reminder_time.slice(0, 5) : '', // e.g. "08:00:00" -> "08:00"
        duration: r.frequency,
        is_self_reminder: true,
      }));
      setSelfReminders(formatted);
    } catch (err) {
      console.error('Error fetching self reminders:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSelfReminders();
      fetchDoctorMeds();

      const channelReminders = supabase
        .channel('reminders-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reminders', filter: `patient_id=eq.${user.id}` },
          () => {
            fetchSelfReminders();
          }
        )
        .subscribe();

      const channelSchedules = supabase
        .channel('schedules-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'medicine_schedules', filter: `patient_id=eq.${user.id}` },
          () => {
            fetchDoctorMeds();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channelReminders);
        supabase.removeChannel(channelSchedules);
      };
    }
  }, [user]);

  const handleMedicineTaken = async (medicine: any) => {
    if (!user) return;

    const today = new Date().toDateString();
    const todayStart = new Date(today).toISOString();
    const todayEnd = new Date(new Date(today).getTime() + 86400000).toISOString();

    const { data: existingLog, error: checkError } = await supabase
      .from('medicine_logs')
      .select('id')
      .eq(medicine.is_self_reminder ? 'reminder_id' : 'schedule_id', medicine.id)
      .eq('patient_id', user.id)
      .gte('scheduled_time', todayStart)
      .lt('scheduled_time', todayEnd)
      .limit(1);

    if (checkError) {
      console.error('Failed to check existing logs:', checkError);
      alert('Error: Could not save. Please try again.');
      return;
    }

    if (existingLog && existingLog.length > 0) {
      alert(`Already marked ${medicine.name} as taken today.`);
      return;
    }

    const { error: logError } = await supabase.from('medicine_logs').insert({
      [medicine.is_self_reminder ? 'reminder_id' : 'schedule_id']: medicine.id,
      patient_id: user.id,
      scheduled_time: new Date().toISOString(),
      taken_time: new Date().toISOString(),
      status: 'TAKEN',
      logged_by: 'PATIENT'
    });

    if (logError) {
      console.error('Failed to log medicine intake:', logError);
      alert('Error logging medicine. Please try again.');
      return;
    }

    window.dispatchEvent(new CustomEvent('dismiss-medication-alarm'));
    fetchDoctorMeds();
    fetchSelfReminders();

    const notificationsToInsert: any[] = [];
    if (medicine.is_self_reminder) {
      notificationsToInsert.push({
        user_id: user.id,
        type: 'SYSTEM',
        title: `Medicine Taken`,
        body: `You marked ${medicine.name} as taken. Great job!`,
        priority: 'LOW',
        is_read: false,
        created_at: new Date().toISOString()
      });
    } else {
      const { data: doctors, error: doctorError } = await supabase
        .from('patient_connections')
        .select('connected_user_id')
        .eq('patient_id', user.id)
        .eq('connection_type', 'DOCTOR')
        .eq('status', 'ACTIVE');

      if (doctorError) {
        console.error('Failed to fetch connected doctor:', doctorError);
      } else if (doctors && doctors.length > 0) {
        const patientName = user.name || 'Your patient';
        doctors.forEach((connection: any) => {
          if (connection.connected_user_id) {
            notificationsToInsert.push({
              user_id: connection.connected_user_id,
              type: 'SYSTEM',
              title: `Patient took medicine`,
              body: `${patientName} has taken ${medicine.name}.`,
              priority: 'MEDIUM',
              is_read: false,
              created_at: new Date().toISOString()
            });
          }
        });
      }
    }

    if (notificationsToInsert.length > 0) {
      const { error: notificationError } = await supabase.from('notifications').insert(notificationsToInsert);
      if (notificationError) {
        console.error('Failed to send taken notifications:', notificationError);
      }
    }
  };

  const selfMeds = selfReminders;

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 mb-1 tracking-tight">My medicines</h1>
          <p className="text-zinc-400 font-normal text-xs">Manage your clinical prescriptions and personal reminders.</p>
        </div>
        <div className="flex flex-col gap-3 items-start sm:items-end">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button className="flex items-center gap-2 bg-zinc-900 text-zinc-200 border border-zinc-800 px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-zinc-850 transition-colors">
              <Mic size={14} className="text-zinc-400" />
              <span>Voice reminder</span>
            </button>
          </div>
        </div>
      </header>

      {/* Adherence & Stats - Equal cards equal padding */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 text-sky-400 flex items-center justify-center font-semibold text-base shrink-0">
            92%
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Adherence</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Target met (+4% vs last week)</p>
          </div>
        </div>
        
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">12-day streak</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Continuous intake verified</p>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">{doctorMeds.length + selfMeds.length} total</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Active prescriptions today</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('doctor')} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors border ${activeTab === 'doctor' ? 'bg-zinc-800 text-sky-400 border-zinc-700' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'}`}>Clinical prescriptions</button>
        <button onClick={() => setActiveTab('self')} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors border ${activeTab === 'self' ? 'bg-zinc-800 text-sky-400 border-zinc-700' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'}`}>Self reminders</button>
      </div>

      {/* Stacked Cards Area */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 min-h-100 relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h2 className="text-2xl font-extrabold flex items-center gap-3 text-white">
             <Clock className="text-brand-neon" /> 
             {activeTab === 'doctor' ? 'Doctor Scheduled Medicines' : 'Personal Reminders'}
          </h2>
          {activeTab === 'self' && (
             <button 
               onClick={() => setIsModalOpen(true)}
               className="bg-brand-purple hover:bg-brand-purple/80 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-[0_0_15px_rgba(112,0,255,0.4)]"
             >
               + Create Reminder
             </button>
          )}
        </div>

        <div className="mt-8 relative z-10">
           <AnimatedMedicineStack 
             medicines={activeTab === 'doctor' ? doctorMeds : selfMeds}
             isLoading={activeTab === 'doctor' ? isDoctorLoading : false}
             onTakeMedicine={(id) => {
                const targetMedicine = (activeTab === 'doctor' ? doctorMeds : selfMeds).find((med) => med.id === id);
                if (targetMedicine) {
                  handleMedicineTaken(targetMedicine);
                }
             }}
           />
        </div>
      </motion.div>
      <AddMedicineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isSelfReminder={true} />
    </div>
  );
}
