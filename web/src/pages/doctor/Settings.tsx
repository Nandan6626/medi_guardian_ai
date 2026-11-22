import { useState, useEffect } from 'react';
import { User, Bell, Shield, CalendarClock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

interface DoctorSettings {
  consultation_available: boolean;
  emergency_pager: boolean;
  push_notifications: boolean;
}

export function Settings() {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<DoctorSettings>({
    consultation_available: true,
    emergency_pager: true,
    push_notifications: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Default mock ID if auth store uses string or user is not a real doctor UUID yet
  // In a real app, this should strictly be the doctor's authenticated UUID.
  const isUuid = (id: any) => typeof id === 'string' && id.length === 36 && id.includes('-');
  const doctorId = isUuid(user?.id) ? user?.id : '93b86321-f726-4043-a410-b14d1b8d1aa0'; 

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel('doctor-settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'doctor_settings', filter: `doctor_id=eq.${doctorId}` },
        (payload: any) => {
          if (payload.new) {
            setSettings({
              consultation_available: payload.new.consultation_available,
              emergency_pager: payload.new.emergency_pager,
              push_notifications: payload.new.push_notifications,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorId]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctor_settings')
        .select('*')
        .eq('doctor_id', doctorId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error; // PGRST116 means no rows found, which is fine initially
      }

      if (data) {
        setSettings({
          consultation_available: data.consultation_available,
          emergency_pager: data.emergency_pager,
          push_notifications: data.push_notifications,
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = async (key: keyof DoctorSettings) => {
    const newValue = !settings[key];
    
    // Optimistic UI update
    setSettings((prev) => ({ ...prev, [key]: newValue }));
    
    try {
      const { error } = await supabase
        .from('doctor_settings')
        .upsert({
          doctor_id: doctorId,
          consultation_available: key === 'consultation_available' ? newValue : settings.consultation_available,
          emergency_pager: key === 'emergency_pager' ? newValue : settings.emergency_pager,
          push_notifications: key === 'push_notifications' ? newValue : settings.push_notifications,
          updated_at: new Date().toISOString()
        }, { onConflict: 'doctor_id' });

      if (error) throw error;
      showToast('Setting updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update setting:', err);
      // Revert optimistic update
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
      showToast('Failed to update setting', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-brand-neon" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen relative">
      
      {/* Toast Notification */}
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-bold shadow-lg ${
            toast.type === 'success' ? 'bg-status-success/20 text-status-success border border-status-success/50' : 'bg-status-error/20 text-status-error border border-status-error/50'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight mb-1">Operational settings</h1>
        <p className="text-xs text-zinc-400">Manage professional profile and consultation availability.</p>
      </header>

      <div className="space-y-4">
        {/* Profile */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-lg border border-zinc-700 flex items-center justify-center text-zinc-300 bg-zinc-800">
               <User size={24} />
             </div>
             <div>
               <h3 className="font-semibold text-zinc-100 text-base">{user?.name || 'Dr. Sarah Jenkins'}</h3>
               <p className="text-xs text-zinc-400 mt-0.5">Cardiologist · City General Hospital</p>
               <p className="text-xs text-zinc-500 mt-0.5 font-mono">{user?.email || 'sarah.jenkins@hospital.com'}</p>
             </div>
           </div>
           <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg transition-colors text-xs font-medium border border-zinc-700">Edit profile</button>
        </div>

        {/* Global Configuration */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-6">
           
           <div className="flex justify-between items-center">
             <div className="flex gap-3">
               <div className="mt-0.5 text-zinc-400"><CalendarClock size={20}/></div>
               <div>
                 <h4 className="font-medium text-zinc-200 text-sm">Consultation availability</h4>
                 <p className="text-xs text-zinc-400">Allow patients to request video consults during working hours.</p>
               </div>
             </div>
             <button 
               onClick={() => handleToggle('consultation_available')}
               className={`w-11 h-6 rounded-full relative flex items-center px-1 transition-colors ${settings.consultation_available ? 'bg-sky-700' : 'bg-zinc-700'}`}
             >
               <motion.div 
                 layout 
                 className={`w-4 h-4 rounded-full ${settings.consultation_available ? 'ml-auto bg-white' : 'bg-zinc-400'}`}
               />
             </button>
           </div>

           <div className="w-full h-px bg-white/5"></div>

           <div className="flex justify-between items-center">
             <div className="flex gap-4">
               <div className="mt-1 text-red-400"><Shield size={24}/></div>
               <div>
                 <h4 className="font-bold text-white text-lg">Emergency Pager</h4>
                 <p className="text-sm text-gray-400">Receive SMS notifications immediately when an SOS is triggered.</p>
               </div>
             </div>
             <button 
               onClick={() => handleToggle('emergency_pager')}
               className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors shadow-inner ${settings.emergency_pager ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-gray-700'}`}
             >
               <motion.div 
                 layout 
                 className={`w-4 h-4 rounded-full ${settings.emergency_pager ? 'ml-auto bg-white' : 'bg-gray-400'}`}
               />
             </button>
           </div>

           <div className="w-full h-px bg-white/5"></div>

           <div className="flex justify-between items-center">
             <div className="flex gap-4">
               <div className="mt-1 text-gray-400"><Bell size={24}/></div>
               <div>
                 <h4 className="font-bold text-white text-lg">Push Notifications</h4>
                 <p className="text-sm text-gray-400">Standard notifications for reports and requests.</p>
               </div>
             </div>
             <button 
               onClick={() => handleToggle('push_notifications')}
               className={`w-11 h-6 rounded-full relative flex items-center px-1 transition-colors ${settings.push_notifications ? 'bg-sky-700' : 'bg-zinc-700'}`}
             >
               <motion.div 
                 layout 
                 className={`w-4 h-4 rounded-full ${settings.push_notifications ? 'ml-auto bg-white' : 'bg-gray-400'}`}
               />
             </button>
           </div>

        </div>

      </div>
    </div>
  );
}
