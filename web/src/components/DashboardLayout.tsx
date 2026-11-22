import type { ReactNode } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Calendar, FileText, Activity, 
  Users, UserPlus, Video, Bell, Phone, HeartPulse, ShieldAlert, User, Settings, Check, X, Clock, Menu
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer on route transition
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
              <div className="p-2 rounded-lg bg-white/5 shrink-0">
                {toast.priority === 'CRITICAL' ? (
                  <HeartPulse className="text-status-error" size={18} />
                ) : (
                  <Bell className="text-sky-400" size={18} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{toast.title}</h4>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{toast.body}</p>
              </div>
              <button
                onClick={() => setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="p-1 rounded-md hover:bg-white/5 text-text-muted hover:text-white transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="w-full max-w-sm bg-zinc-950 border border-zinc-800 p-6 rounded-xl text-center relative shadow-sm"
            >
              <div className="w-12 h-12 bg-zinc-900 text-sky-400 rounded-lg flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                <Clock size={24} />
              </div>

              <h3 className="text-base font-semibold text-zinc-100 mb-1">{activeAlarm.title}</h3>
              <p className="text-zinc-400 text-xs mb-6 leading-relaxed">{activeAlarm.body}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setActiveAlarm(null)}
                  className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg font-medium transition-colors text-xs"
                >
                  Dismiss
                </button>
                <button
                  disabled={isLogging}
                  onClick={handleLogTaken}
                  className="flex-1 py-2 bg-sky-700 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
                >
                  {isLogging ? (
                    "Logging..."
                  ) : (
                    <>
                      <Check size={14} />
                      Log taken
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Top Header (Small Screens Only) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 text-white font-semibold text-xs rounded-md bg-sky-700">
            M
          </div>
          <span className="text-sm font-semibold text-zinc-100 tracking-tight">MediGuardian</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Backdrop & Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] h-full bg-zinc-950 border-r border-zinc-800 z-50 flex flex-col justify-between"
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-7 h-7 text-white font-semibold text-xs rounded-md bg-sky-700">
                    M
                  </div>
                  <span className="text-sm font-semibold text-zinc-100">MediGuardian</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-200"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {links.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <button
                      key={link.path}
                      onClick={() => {
                        navigate(link.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-xs font-medium text-left ${
                        isActive 
                          ? 'bg-zinc-900 text-sky-400 border border-zinc-800' 
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                      }`}
                    >
                      <link.icon size={16} className={isActive ? 'text-sky-400' : 'text-zinc-500'} />
                      <span className="truncate flex-1">{link.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-zinc-800 bg-zinc-950 space-y-2">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="Avatar" className="w-7 h-7 rounded-full border border-zinc-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-200 truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-zinc-400 capitalize truncate">{user?.role || 'Patient'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/20 rounded-lg transition-colors border border-red-900/30"
                >
                  <LogOut size={13} />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 lg:w-72 hidden md:flex flex-col h-screen bg-zinc-950 border-r border-zinc-800 z-20 shrink-0">
        {/* Brand Header */}
        <div className="p-4 lg:p-5 pb-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 text-white font-semibold text-sm rounded-lg bg-sky-700 shrink-0">
              M
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-zinc-100 block leading-tight">
                MediGuardian
              </span>
              <span className="text-[11px] text-zinc-500 font-normal block mt-0.5">
                Clinical adherence suite
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 pb-1.5 text-xs font-medium text-zinc-500">
            Navigation
          </div>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-xs lg:text-sm font-medium text-left ${
                  isActive 
                    ? 'bg-zinc-900 text-sky-400 border border-zinc-800' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
                }`}
              >
                <link.icon 
                  size={16} 
                  className={`shrink-0 ${
                    isActive ? 'text-sky-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`} 
                />
                <span className="truncate flex-1">{link.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Pinned Bottom User & Sign Out Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 mt-auto shrink-0 space-y-2">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-900"></span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium truncate text-zinc-100 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[11px] text-zinc-500 capitalize truncate mt-0.5">
                {user?.role || 'Patient'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors text-xs font-medium border border-zinc-800"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
