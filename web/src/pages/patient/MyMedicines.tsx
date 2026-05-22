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
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">My Medicines</h1>
          <p className="text-text-secondary font-medium">Manage your clinical prescriptions and personal reminders.</p>
        </div>
        <div className="flex flex-col gap-4 items-start sm:items-end">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button className="flex items-center gap-2 bg-brand-neon/10 text-brand-neon border border-brand-neon/20 px-5 py-3 rounded-2xl font-bold shadow-sm hover:bg-brand-neon/20 hover:text-white transition-colors group">
              <Mic size={18} className="group-hover:animate-pulse" />
              Voice Reminder
            </button>
          </div>
        </div>
      </header>

      {/* Adherence & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel rounded-3xl p-6 flex items-center gap-6 relative overflow-hidden group hover:border-brand-purple/30 transition-all">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-brand-purple/20 rounded-full blur-2xl group-hover:bg-brand-neon/20 transition-colors"></div>
          <div className="w-20 h-20 rounded-full border-4 border-brand-purple flex items-center justify-center shrink-0 shadow-inner bg-bg-base relative z-10 purple-glow">
            <span className="text-2xl font-extrabold text-white">92%</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-1">Adherence</h3>
            <p className="text-sm text-brand-neon font-bold">Great job! Keep it up.</p>
          </div>
        </div>
        
        <div className="glass-panel rounded-3xl p-6 flex items-center gap-6 group hover:border-status-warning/30 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-status-warning/10 text-status-warning flex items-center justify-center shrink-0 border border-status-warning/20 shadow-inner">
            <TrendingUp size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">12 Day Streak</h3>
            <p className="text-sm text-text-secondary font-medium">Perfect intake record.</p>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 flex items-center gap-6 group hover:border-status-success/30 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-status-success/10 text-status-success flex items-center justify-center shrink-0 border border-status-success/20 shadow-inner">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{doctorMeds.length + selfMeds.length} Total</h3>
            <p className="text-sm text-text-secondary font-medium">Medicines tracked today.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('doctor')} className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm border ${activeTab === 'doctor' ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/50' : 'bg-bg-surface text-text-secondary border-border-subtle hover:text-white hover:bg-white/5'}`}>Clinical Prescriptions</button>
        <button onClick={() => setActiveTab('self')} className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm border ${activeTab === 'self' ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/50' : 'bg-bg-surface text-text-secondary border-border-subtle hover:text-white hover:bg-white/5'}`}>Self Reminders</button>
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
