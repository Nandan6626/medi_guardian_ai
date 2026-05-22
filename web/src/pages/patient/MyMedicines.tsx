import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import { AnimatedMedicineStack } from '../../components/AnimatedMedicineStack';
import { Clock, TrendingUp, Mic, CheckCircle2, BellRing } from 'lucide-react';
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
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [reminderToast, setReminderToast] = useState<{ title: string; message: string; medicine: any } | null>(null);
  const notificationTimersRef = useRef<number[]>([]);
  const toastTimerRef = useRef<number | null>(null);
  const reminderAudioRef = useRef<AudioContext | null>(null);

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

  const getNotificationPermissionStatus = async () => {
    if (typeof Notification === 'undefined') return 'denied';

    if ('permissions' in navigator && (navigator as any).permissions?.query) {
      try {
        const status = await (navigator as any).permissions.query({ name: 'notifications' });
        return status.state as NotificationPermission;
      } catch (err) {
        console.warn('Notification permission query failed:', err);
      }
    }

    return Notification.permission;
  };

  useEffect(() => {
    const initNotificationStatus = async () => {
      const permission = await getNotificationPermissionStatus();
      setNotificationStatus(permission);
      setNotificationMessage(
        permission === 'granted'
          ? 'Browser medicine reminders are enabled.'
          : 'Enable browser notifications to receive medicine alerts at the scheduled time.'
      );
    };

    initNotificationStatus();
  }, []);

  useEffect(() => {
    const activeTimers = notificationTimersRef.current;
    activeTimers.forEach(window.clearTimeout);
    notificationTimersRef.current = [];

    const triggerMedicineReminder = (medicine: any) => {
      const title = `Time for ${medicine.name}`;
      const body = `Please take ${medicine.dosage} now.${medicine.food_instruction ? ` ${medicine.food_instruction}` : ''}`;
      setReminderToast({ title, message: body, medicine });
      sendWebNotification(title, body);

      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = window.setTimeout(() => setReminderToast(null), 60000);

      playReminderSound();
    };

    const scheduleReminder = (medicine: any, timeValue: string) => {
      const [hourStr, minuteStr] = timeValue.split(':');
      const hour = Number(hourStr);
      const minute = Number(minuteStr);
      if (Number.isNaN(hour) || Number.isNaN(minute)) return;

      const nextRun = getNextTriggerTime(hour, minute);
      const delay = nextRun.getTime() - Date.now();
      if (delay < 0) return;

      console.debug('Scheduling medicine reminder:', medicine.name, timeValue, 'nextRun=', nextRun.toLocaleString(), 'delay=', delay);

      const timerId = window.setTimeout(() => {
        console.debug('Triggering reminder for', medicine.name, 'scheduled at', timeValue);
        triggerMedicineReminder(medicine);
        scheduleReminder(medicine, timeValue);
      }, delay);

      notificationTimersRef.current.push(timerId);
    };

    const allMeds = [...doctorMeds, ...selfReminders];
    allMeds.forEach(med => {
      const timings = parseMedicineTimings(med.timing);
      timings.forEach(timeValue => scheduleReminder(med, timeValue));
    });
  }, [doctorMeds, selfReminders, notificationStatus]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') {
      setNotificationMessage('Browser notifications are not available.');
      return;
    }

    if (Notification.permission === 'denied') {
      setNotificationMessage('Browser notifications are blocked. Open your browser settings and allow notifications for this site.');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);

    if (permission === 'granted') {
      setNotificationMessage('Browser medicine reminders are enabled.');
    } else if (permission === 'default') {
      setNotificationMessage('Notification permission is pending or dismissed. Please allow notifications to receive alerts.');
    } else {
      setNotificationMessage('Notifications denied. You will not receive scheduled alerts.');
    }
  };

  const getNextTriggerTime = (hour: number, minute: number) => {
    const now = new Date();
    const target = new Date(now);
    target.setHours(hour, minute, 0, 0);

    const delta = target.getTime() - now.getTime();
    // If the time is within the last minute, treat it as the current target so it can fire immediately.
    if (delta <= 0 && delta > -60_000) {
      return target;
    }

    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target;
  };

  const parseMedicineTimings = (timing: string) => {
    if (!timing) return [];
    try {
      const parsed = JSON.parse(timing);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [String(parsed)];
    } catch {
      return [timing];
    }
  };

  const playReminderSound = () => {
    try {
      const AudioCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtor) {
        console.debug('Web Audio API not available');
        return;
      }

      let audioCtx = reminderAudioRef.current;
      if (!audioCtx) {
        audioCtx = new AudioCtor();
        reminderAudioRef.current = audioCtx;
      }
      if (!audioCtx) return;

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch((e) => console.debug('Audio resume failed:', e));
      }

      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 1);
      
      console.debug('Reminder sound triggered');
    } catch (err) {
      console.debug('Reminder sound error (non-blocking):', err);
    }
  };

  const sendWebNotification = (title: string, body: string) => {
    if (typeof Notification === 'undefined') return;

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          silent: false,
        });
      } catch (err) {
        console.warn('Browser notification failed:', err);
      }
    }
  };


  const handleMedicineTaken = async (medicine: any) => {
    if (!user) return;

    // Immediately clear the toast for UI feedback
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setReminderToast(null);

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
      setNotificationMessage(`Error: Could not save. Please try again.`);
      return;
    }

    if (existingLog && existingLog.length > 0) {
      console.log('Medicine already logged for today');
      setNotificationMessage(`Already marked ${medicine.name} as taken today.`);
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
      setNotificationMessage(`Error logging medicine. Please try again.`);
      return;
    }

    setNotificationMessage(`✓ Marked ${medicine.name} as taken.`);
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
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="flex items-center gap-2 bg-white/10 text-white border border-white/10 px-5 py-3 rounded-2xl font-bold shadow-sm hover:bg-white/15 transition-colors"
            >
              <BellRing size={18} />
              {notificationStatus === 'granted' ? 'Notifications Enabled' : 'Enable Alerts'}
            </button>
          </div>
          <div className="rounded-3xl border border-border-subtle bg-[#090A10]/90 px-4 py-3 text-sm text-text-secondary flex items-center gap-2 max-w-xl">
            <BellRing size={16} className="text-brand-neon" />
            <span>{notificationMessage}</span>
          </div>
        </div>
      </header>

      {reminderToast && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm">
          <div className="rounded-3xl border border-brand-neon/20 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-neon font-semibold mb-2">Medicine Reminder</p>
            <h2 className="text-lg font-bold text-white leading-tight">{reminderToast.title}</h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">{reminderToast.message}</p>
            <button
              onClick={() => reminderToast?.medicine && handleMedicineTaken(reminderToast.medicine)}
              className="mt-4 rounded-3xl bg-brand-neon px-4 py-2 text-sm font-semibold text-black hover:bg-brand-neon/90 transition"
            >
              I've taken it
            </button>
          </div>
        </div>
      )}

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
