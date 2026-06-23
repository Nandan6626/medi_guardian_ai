import type { ReactNode } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Calendar, FileText, Activity, 
  Users, UserPlus, Video, Bell, Phone, HeartPulse, ShieldAlert, User, Settings, Check, X, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItem {
  icon: any;
  label: string;
  path: string;
}

interface ToastNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  priority: string;
}

// Pure Web Audio API Synthesizer Chime
const playChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (err) {
    console.error('Audio play error:', err);
  }
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeToasts, setActiveToasts] = useState<ToastNotification[]>([]);
  const [activeAlarm, setActiveAlarm] = useState<ToastNotification | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  // Client-side Alarm checking & Audio Play states
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const triggeredAlarmsRef = useRef<Set<string>>(new Set());
  const [medSchedules, setMedSchedules] = useState<any[]>([]);
  const [selfReminders, setSelfReminders] = useState<any[]>([]);

  // 1. Play/Stop the custom vintage alarm sound when an active alarm is shown/hidden
  useEffect(() => {
    if (activeAlarm) {
      // Create and play audio loop
      try {
        const audio = new Audio('/mixkit-vintage-warning-alarm-990.wav');
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch(err => {
          console.warn("Autoplay block: user must interact first. Fallback to click-triggered sound.", err);
        });
        alarmAudioRef.current = audio;
      } catch (err) {
        console.error("Failed to initialize alarm audio:", err);
      }
    } else {
      // Stop and clean up audio
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current = null;
      }
    }
    return () => {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
      }
    };
  }, [activeAlarm]);

  // Coordinate dismissing of alarms via custom event
  useEffect(() => {
    const handleDismissAlarms = () => {
      setActiveAlarm(null);
    };
    window.addEventListener('dismiss-medication-alarm', handleDismissAlarms);
    return () => {
      window.removeEventListener('dismiss-medication-alarm', handleDismissAlarms);
    };
  }, []);

  // 2. Fetch active medicine schedules and self-reminders periodic loader
  const fetchSchedulesAndReminders = async () => {
    if (!user?.id || user.role !== 'patient') return;
    try {
      const { data: schedules } = await supabase
        .from('medicine_schedules')
        .select('*')
        .eq('patient_id', user.id)
        .eq('status', 'ACTIVE');
      setMedSchedules(schedules || []);

      const { data: reminders } = await supabase
        .from('reminders')
        .select('*')
        .eq('patient_id', user.id);
      setSelfReminders(reminders || []);
    } catch (err) {
      console.error("Error loading schedules/reminders for alarms:", err);
    }
  };

  useEffect(() => {
    fetchSchedulesAndReminders();
    const interval = setInterval(fetchSchedulesAndReminders, 45000); // refresh list every 45s
    return () => clearInterval(interval);
  }, [user?.id]);

  // 3. Periodic alarm checker loop (runs every 10 seconds)
  useEffect(() => {
    if (!user?.id || user.role !== 'patient') return;

    const checkAlarms = async () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const timeStr24 = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      
      const todayStr = now.toISOString().split('T')[0];

      const triggerAlarm = async (medId: string, medName: string, dosage: string, timeVal: string) => {
        const alarmKey = `${medId}-${timeVal}-${todayStr}`;
        if (triggeredAlarmsRef.current.has(alarmKey)) return;
        triggeredAlarmsRef.current.add(alarmKey);

        const bodyText = `⏰ It is time to take your ${medName} (${dosage})!`;
        
        console.log(`[Alarm Trigger] Medicine: ${medName} due at: ${timeVal}`);

        // Insert notification row in database so it is recorded/synced
        try {
          const { data } = await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              type: 'SYSTEM',
              title: 'Medication Alarm',
              body: bodyText,
              priority: 'MEDIUM',
              is_read: false
            })
            .select();

          const newNotifId = data && data[0] ? data[0].id : medId;

          // Open active alarm modal on UI
          setActiveAlarm({
            id: newNotifId,
            title: 'Medication Alarm',
            body: bodyText,
            type: 'SYSTEM',
            priority: 'MEDIUM'
          });
        } catch (err) {
          console.error("Failed to save alarm notification:", err);
          // Local fallback to ensure patient gets alerted regardless
          setActiveAlarm({
            id: medId,
            title: 'Medication Alarm',
            body: bodyText,
            type: 'SYSTEM',
            priority: 'MEDIUM'
          });
        }
      };

      // Check Doctor-Prescribed Schedules
      for (const sched of medSchedules) {
        let slots: string[] = [];
        try {
          if (Array.isArray(sched.timing_slots)) {
            slots = sched.timing_slots;
          } else if (typeof sched.timing_slots === 'string') {
            slots = JSON.parse(sched.timing_slots);
          }
        } catch (e) {
          slots = [sched.timing_slots];
        }

        for (const slot of slots) {
          if (!slot) continue;
          const slotHHMM = String(slot).slice(0, 5); // "HH:MM"
          if (slotHHMM === timeStr24) {
            await triggerAlarm(sched.id, sched.medicine_name, sched.dosage, slotHHMM);
          }
        }
      }

      // Check Self Reminders
      for (const rem of selfReminders) {
        if (!rem.reminder_time) continue;
        const remHHMM = String(rem.reminder_time).slice(0, 5); // "HH:MM"
        if (remHHMM === timeStr24) {
          await triggerAlarm(rem.id, rem.medicine_name, rem.dosage, remHHMM);
        }
      }
    };

    const checker = setInterval(checkAlarms, 10000);
    return () => clearInterval(checker);
  }, [medSchedules, selfReminders, user]);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  // Realtime notification subscriber
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotif = payload.new as any;
          const toast: ToastNotification = {
            id: newNotif.id,
            title: newNotif.title,
            body: newNotif.body,
            type: newNotif.type || 'SYSTEM',
            priority: newNotif.priority || 'LOW'
          };

          playChime();

          if (toast.type === 'SYSTEM' && toast.title.includes('Alarm')) {
            setActiveAlarm(toast);
          } else {
            setActiveToasts((prev) => [...prev, toast]);
            // Auto dismiss toast after 6 seconds
            setTimeout(() => {
              setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }, 6000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Log dose as taken directly from Alarm Modal
  const handleLogTaken = async () => {
    if (!user || !activeAlarm) return;
    setIsLogging(true);
    try {
      // 1. Extract medication name from the alarm message
      // e.g. "⏰ It is time to take your Lisinopril 10mg (10mg)!"
      const bodyText = activeAlarm.body;

      // Query active medicine schedules & reminders to find match
      const { data: schedules } = await supabase
        .from('medicine_schedules')
        .select('id, medicine_name')
        .eq('patient_id', user.id)
        .eq('status', 'ACTIVE');

      const { data: reminders } = await supabase
        .from('reminders')
        .select('id, medicine_name')
        .eq('patient_id', user.id);

      const schedulesList = (schedules || []).map(s => ({ ...s, isSelf: false }));
      const remindersList = (reminders || []).map(r => ({ ...r, isSelf: true }));
      const allMeds = [...schedulesList, ...remindersList];
      const match = allMeds.find(m => bodyText.toLowerCase().includes(m.medicine_name.toLowerCase()));
      
      const isSelf = match ? match.isSelf : false;
      const targetId = match?.id || activeAlarm.id;

      // 2. Insert TAKE log
      const { error: logErr } = await supabase
        .from('medicine_logs')
        .insert({
          [isSelf ? 'reminder_id' : 'schedule_id']: targetId,
          patient_id: user.id,
          scheduled_time: new Date().toISOString(),
          taken_time: new Date().toISOString(),
          status: 'TAKEN',
          logged_by: 'PATIENT'
        });

      if (logErr) throw logErr;

      // 3. Mark notification as read
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', activeAlarm.id);

      setActiveAlarm(null);
    } catch (err) {
      console.error('Error logging medication intake:', err);
      alert('Failed to log dose. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const patientLinks: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/patient' },
    { icon: Calendar, label: 'My Medicines', path: '/patient/medicines' },
    { icon: FileText, label: 'Health Timeline', path: '/patient/timeline' },
    { icon: Video, label: 'Appointments', path: '/patient/appointments' },
    { icon: Phone, label: 'Doctor Chat', path: '/patient/chat' },
    { icon: Activity, label: 'Health Reports', path: '/patient/reports' },
    { icon: UserPlus, label: 'Caretakers', path: '/patient/caretakers' },
    { icon: HeartPulse, label: 'Emergency SOS', path: '/patient/emergency' },
    { icon: User, label: 'Profile', path: '/patient/profile' },
    { icon: Settings, label: 'Settings', path: '/patient/settings' },
  ];

  const doctorLinks: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor' },
    { icon: Users, label: 'Patient Management', path: '/doctor/patients' },
    { icon: ShieldAlert, label: 'Emergency Monitoring', path: '/doctor/alerts' },
    { icon: Bell, label: 'Notifications', path: '/doctor/notifications' },
    { icon: Activity, label: 'Analytics', path: '/doctor/analytics' },
    { icon: Settings, label: 'Settings', path: '/doctor/settings' },
  ];

  const familyLinks: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/family' },
    { icon: Users, label: 'Connected Patients', path: '/family/patients' },
    { icon: Bell, label: 'Alerts & Notifications', path: '/family/alerts' },
  ];

  let links: SidebarItem[] = [];
  if (user?.role === 'patient') links = patientLinks;
  else if (user?.role === 'doctor') links = doctorLinks;
  else if (user?.role === 'family') links = familyLinks;

  return (
    <div className="flex h-screen overflow-hidden relative">
      
      {/* Realtime Toast Notifications List */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {activeToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`p-4 rounded-2xl border pointer-events-auto shadow-2xl flex items-start gap-3 backdrop-blur-xl ${
                toast.priority === 'CRITICAL'
                  ? 'bg-status-error/15 border-status-error/40 text-white'
                  : toast.priority === 'HIGH'
                  ? 'bg-status-warning/15 border-status-warning/40 text-white'
                  : 'bg-bg-surface/90 border-border-subtle text-white'
              }`}
            >
              <div className="p-2 rounded-xl bg-white/5 shrink-0">
                {toast.priority === 'CRITICAL' ? (
                  <HeartPulse className="text-status-error animate-pulse" size={18} />
                ) : (
                  <Bell className="text-brand-neon" size={18} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm truncate">{toast.title}</h4>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{toast.body}</p>
              </div>
              <button
                onClick={() => setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="p-1 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Medication Alarm Overlay Modal */}
      <AnimatePresence>
        {activeAlarm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="w-full max-w-md bg-bg-secondary border border-brand-neon/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,242,254,0.15)] text-center relative overflow-hidden"
            >
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-brand-neon/10 rounded-full blur-2xl"></div>
              
              <div className="w-16 h-16 bg-brand-neon/15 text-brand-neon rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-neon/20 animate-bounce">
                <Clock size={32} />
              </div>

              <h3 className="text-2xl font-extrabold text-white mb-2">{activeAlarm.title}</h3>
              <p className="text-text-secondary text-sm mb-8 leading-relaxed px-4">{activeAlarm.body}</p>

              <div className="flex gap-4">
                <button
                  onClick={() => setActiveAlarm(null)}
                  className="flex-1 py-3.5 bg-bg-surface hover:bg-white/5 border border-border-subtle hover:text-white text-text-secondary rounded-2xl font-bold transition-all text-sm"
                >
                  Dismiss
                </button>
                <button
                  disabled={isLogging}
                  onClick={handleLogTaken}
                  className="flex-1 py-3.5 bg-linear-to-r from-brand-purple to-brand-neon text-white font-extrabold rounded-2xl transition-all shadow-[0_0_20px_rgba(112,0,255,0.4)] hover:brightness-110 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isLogging ? (
                    "Logging..."
                  ) : (
                    <>
                      <Check size={18} />
                      Log Taken
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-72 hidden md:block bg-bg-sidebar border-r border-border-subtle z-10">
        <div className="flex h-full flex-col justify-between p-6">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-xl bg-linear-to-br from-brand-purple to-brand-neon purple-glow">
              <span className="font-bold">M</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-text-primary">MediGuardian</span>
          </div>

          <nav className="space-y-2">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-semibold ${
                    isActive 
                      ? 'bg-brand-purple/10 text-brand-neon border-l-2 border-brand-neon' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  <link.icon size={18} className={isActive ? 'text-brand-neon' : ''} />
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-border-subtle mt-6">
          <div className="flex items-center gap-3 mb-6 px-4">
            <div className="w-10 h-10 rounded-full bg-bg-surface overflow-hidden border border-border-subtle">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="Avatar" />
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-sm font-extrabold truncate text-text-primary">{user?.name || 'User'}</p>
              <p className="text-xs text-brand-purple capitalize font-semibold truncate">{user?.role || 'Role'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-status-error hover:text-white hover:bg-status-error/20 rounded-2xl transition-colors text-sm font-bold"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
