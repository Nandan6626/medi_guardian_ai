import { motion } from 'framer-motion';
import { Users, HeartPulse, AlertCircle, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

export function FamilyDashboard() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['family', 'patients', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user) return { patients: [] };

      // 1. Get caregiver profile details to find their user_id
      const { data: caregiverProf, error: cgErr } = await supabase
        .from('caregiver_profiles')
        .select('user_id')
        .eq('id', user.id)
        .single();
      
      if (cgErr || !caregiverProf) {
        console.error('Error fetching caregiver profile:', cgErr);
        return { patients: [] };
      }

      // 2. Fetch patient connections
      const { data: connections, error: connErr } = await supabase
        .from('patient_connections')
        .select('patient_id')
        .eq('connected_user_id', caregiverProf.user_id);

      if (connErr || !connections) return { patients: [] };
      const patientIds = connections.map(c => c.patient_id).filter(Boolean);
      if (patientIds.length === 0) return { patients: [] };

      // 3. Fetch patient profiles
      const { data: profiles, error: profErr } = await supabase
        .from('patient_profiles')
        .select('*')
        .in('id', patientIds);

      if (profErr || !profiles) return { patients: [] };

      // 4. Fetch medicine count and status for each patient
      const patientData = await Promise.all(profiles.map(async p => {
        const { count: countSelf } = await supabase
          .from('reminders')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', p.id);

        const { count: countSchedules } = await supabase
          .from('medicine_schedules')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', p.id);

        return {
          patient_id: p.id,
          patient_name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unnamed Patient',
          adherence_score: p.adherence_score || 85,
          total_medicines: (countSelf || 0) + (countSchedules || 0),
          missed_medicines: p.health_status === 'CRITICAL' ? 1 : 0
        };
      }));

      return { patients: patientData };
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-white">Family Portal</h1>
          <p className="mt-2 text-brand-neon font-medium">Monitor your loved ones' health in realtime.</p>
        </div>
        <div className="flex items-center justify-center w-16 h-16 overflow-hidden border-2 rounded-full border-brand-purple glass-panel shadow-[0_0_15px_rgba(112,0,255,0.4)]">
          <img src="https://i.pravatar.cc/150?img=47" alt="Profile" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-8 lg:col-span-2">
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white"><Users className="text-brand-purple"/> Connected Patients</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {isLoading ? (
              <div className="col-span-2 py-8 text-center text-text-muted glass-panel rounded-3xl">Loading patients...</div>
            ) : data?.patients?.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-text-muted glass-panel rounded-3xl">No connected patients found.</div>
            ) : (
              data?.patients?.map((patient: any) => (
                <motion.div 
                  key={patient.patient_id}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 transition-all border glass-panel rounded-3xl border-border-subtle hover:border-brand-purple/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{patient.patient_name}</h3>
                      <p className="text-sm text-text-secondary">Adherence Score: <span className={patient.adherence_score > 80 ? 'text-status-success' : 'text-status-error'}>{patient.adherence_score}%</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-white transition-colors bg-brand-purple/20 border border-brand-purple/30 rounded-xl hover:bg-brand-purple/40">
                        <Phone size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Total Medicines</span>
                      <span className="font-bold text-white">{patient.total_medicines}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Missed Doses</span>
                      <span className={`font-bold ${patient.missed_medicines > 0 ? 'text-status-error' : 'text-status-success'}`}>
                        {patient.missed_medicines}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button className="w-full py-3 text-sm font-bold transition-colors bg-bg-surface border border-border-subtle rounded-xl hover:bg-white/5 text-white">
                      View Full Schedule
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Alerts Panel */}
          <div className="p-6 border glass-panel rounded-3xl border-status-error/30 bg-status-error/5">
            <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-status-error"><AlertCircle /> Urgent Alerts</h3>
            <div className="space-y-4">
              <div className="p-4 bg-status-error/10 rounded-2xl border border-status-error/20">
                <p className="text-sm font-bold text-status-error">Missed Medication</p>
                <p className="mt-1 text-xs text-text-secondary">Alex missed Atorvastatin 20mg at 08:00 PM.</p>
                <button className="px-4 py-2 mt-3 text-xs font-bold text-white bg-status-error rounded-lg hover:bg-status-error/80 transition-colors shadow-[0_0_10px_rgba(244,63,94,0.4)]">
                  Call Alex
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 glass-panel rounded-3xl border border-border-subtle">
            <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-brand-neon"><HeartPulse /> Overall Status</h3>
            <p className="text-sm text-text-secondary">All connected patients are currently stable. No emergency escalations required at this time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
