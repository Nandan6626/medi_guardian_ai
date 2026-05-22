import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, Activity, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PrescribeMedicineModal } from '../components/PrescribeMedicineModal';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

export function DoctorDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['doctor', 'dashboard', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user) return null;

      // 1. Get doctor profile details
      const { data: doctorProf, error: docErr } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (docErr || !doctorProf) {
        console.error('Error fetching doctor profile:', docErr);
        return null;
      }

      // 2. Fetch connected patients
      const { data: connections, error: connErr } = await supabase
        .from('patient_connections')
        .select('patient_id')
        .eq('connected_user_id', doctorProf.user_id);

      if (connErr) {
        console.error('Error fetching connections:', connErr);
      }

      const patientIds = connections ? connections.map(c => c.patient_id).filter(Boolean) : [];
      
      let profiles: any[] = [];
      if (patientIds.length > 0) {
        const { data: profs, error: profErr } = await supabase
          .from('patient_profiles')
          .select('*')
          .in('id', patientIds);
        
        if (profErr) console.error('Error fetching patient profiles:', profErr);
        else profiles = profs || [];
      }

      const totalPatients = profiles.length;
      const criticalPatients = profiles.filter(p => p.health_status === 'CRITICAL');
      const avgAdherence = profiles.length > 0
        ? Math.round(profiles.reduce((acc, p) => acc + Number(p.adherence_score || 0), 0) / profiles.length)
        : 100;

      const actionRequired = profiles
        .filter(p => p.health_status === 'CRITICAL' || Number(p.adherence_score || 0) < 85)
        .map(p => ({
          patient_id: p.id,
          patient_name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unnamed Patient',
          issue: p.health_status === 'CRITICAL' ? 'Critical condition / Alert' : 'Low adherence warning',
          risk_level: p.health_status === 'CRITICAL' ? 'High' : 'Medium'
        }));

      return {
        metrics: {
          doctor_name: `${doctorProf.first_name || ''} ${doctorProf.last_name || ''}`.trim() ? `Dr. ${doctorProf.first_name} ${doctorProf.last_name}` : user.name,
          specialization: doctorProf.specialization || 'Cardiology',
          hospital: doctorProf.hospital_affiliation || 'Global Health Clinic',
          total_patients: totalPatients,
          critical_alerts: criticalPatients.length,
          avg_adherence: avgAdherence,
          pending_reviews: 2
        },
        action_required: actionRequired
      };
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-text-muted">Loading Doctor Portal...</div>;
  }

  const { metrics, action_required } = data || {};

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white">{metrics?.doctor_name || 'Doctor'} 🩺</h1>
          <p className="mt-2 text-brand-purple font-medium">{metrics?.specialization || 'General'} • {metrics?.hospital}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 font-bold text-white transition-all rounded-xl bg-brand-purple shadow-[0_0_15px_rgba(112,0,255,0.4)] hover:bg-brand-purple/80"
        >
          + New Prescription
        </button>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-4">
        {[
          { title: 'Total Patients', value: metrics?.total_patients || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { title: 'Critical Alerts', value: metrics?.critical_alerts || 0, icon: AlertTriangle, color: 'text-status-error', bg: 'bg-status-error/10' },
          { title: 'Avg Adherence', value: `${metrics?.avg_adherence || 0}%`, icon: Activity, color: 'text-brand-neon', bg: 'bg-brand-neon/10' },
          { title: 'Pending Reviews', value: metrics?.pending_reviews || 0, icon: FileText, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
        ].map((metric, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-6 glass-panel rounded-3xl"
          >
            <div>
              <p className="mb-1 text-sm text-text-secondary">{metric.title}</p>
              <p className="text-3xl font-bold text-white">{metric.value}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${metric.bg} ${metric.color}`}>
              <metric.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* High Risk Patients */}
        <div className="p-8 lg:col-span-2 glass-panel rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <AlertTriangle className="text-status-error" /> Action Required
            </h2>
            <button className="text-sm transition-colors text-brand-neon hover:text-white">View All</button>
          </div>
          
          <div className="space-y-4">
            {!action_required || action_required.length === 0 ? (
              <p className="text-text-muted">No immediate actions required for your patients.</p>
            ) : (
              action_required.map((alert: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-6 border bg-bg-surface rounded-2xl border-border-subtle">
                  <div>
                    <h3 className="text-lg font-bold text-white">{alert.patient_name}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{alert.issue}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      alert.risk_level === 'High' ? 'bg-status-error/20 text-status-error' :
                      alert.risk_level === 'Medium' ? 'bg-status-warning/20 text-status-warning' :
                      'bg-status-success/20 text-status-success'
                    }`}>
                      {alert.risk_level} Risk
                    </span>
                    <button 
                      onClick={() => alert.patient_id && navigate(`/doctor/patients/${alert.patient_id}`)}
                      className="px-4 py-2 text-sm transition-colors rounded-lg bg-white/5 hover:bg-white/10 text-white border border-border-subtle"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="p-8 border-t-4 glass-panel rounded-3xl border-t-brand-neon">
          <h2 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
            <Activity className="text-brand-neon" /> AI Fleet Insights
          </h2>
          <div className="space-y-6">
            <div className="p-4 border bg-brand-neon/5 rounded-xl border-brand-neon/20">
              <p className="text-sm text-text-secondary">
                <strong className="text-brand-neon">Trend Detected:</strong> 15% drop in evening medication adherence across hypertensive patients during weekends.
              </p>
            </div>
            <div className="p-4 border bg-brand-purple/5 rounded-xl border-brand-purple/20">
              <p className="text-sm text-text-secondary">
                <strong className="text-brand-purple">Predictive Alert:</strong> Patient #842 (John D.) has a 80% probability of readmission based on recent erratic vital patterns.
              </p>
            </div>
          </div>
          <button className="w-full px-4 py-3 mt-8 text-sm font-bold transition-all border border-border-subtle text-white rounded-xl hover:bg-white/5">
            Generate Full AI Report
          </button>
        </div>

      </div>

      <PrescribeMedicineModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
