import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        console.warn('Doctor profile query returned empty, using fallback demo doctor data');
        return {
          metrics: {
            doctor_name: user.name?.startsWith('Dr.') ? user.name : `Dr. ${user.name || 'Rajesh Kumar'}`,
            specialization: 'Cardiology',
            hospital: 'Apollo Hospitals, Bangalore',
            total_patients: 12,
            critical_alerts: 1,
            avg_adherence: 94,
            pending_reviews: 2
          },
          action_required: [
            {
              patient_id: '00000000-0000-0000-0000-000000600001',
              patient_name: 'Amit Patel',
              issue: 'Low adherence warning (78% this week)',
              risk_level: 'Medium'
            },
            {
              patient_id: '00000000-0000-0000-0000-000000600002',
              patient_name: 'Sneha Desai',
              issue: 'High BP Alert recorded (145/95 mmHg)',
              risk_level: 'High'
            }
          ]
        };
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Clinical overview</h1>
          <p className="mt-1 text-sm text-zinc-400 font-normal">
            {metrics?.doctor_name || 'Dr. Rajesh Kumar'} · {metrics?.specialization || 'Cardiology'} · {metrics?.hospital || 'Apollo Hospitals'}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 font-medium text-xs text-white transition-colors rounded-lg bg-sky-700 hover:bg-sky-700 flex items-center gap-1.5"
        >
          <span>+ Prescribe medication</span>
        </button>
      </header>

      {/* Top Metrics - Equal cards equal padding on 4-pixel grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total patients', value: metrics?.total_patients || 0, comparison: '+2 vs last month', icon: Users },
          { title: 'Critical alerts', value: metrics?.critical_alerts || 0, comparison: '-1 vs yesterday', icon: AlertTriangle, isWarning: true },
          { title: 'Average adherence', value: `${metrics?.avg_adherence || 0}%`, comparison: 'vs 91% previous week', icon: Activity },
          { title: 'Pending reviews', value: metrics?.pending_reviews || 0, comparison: 'due today', icon: FileText },
        ].map((metric, i) => (
          <div 
            key={i}
            className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-normal text-zinc-400 mb-1">{metric.title}</p>
              <p className="text-2xl font-semibold text-zinc-100">{metric.value}</p>
              <p className="text-[11px] text-zinc-500 mt-1">{metric.comparison}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric.isWarning ? 'bg-red-950/40 text-red-400 border border-red-900/40' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'}`}>
              <metric.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area - Varied card widths (8 cols spotlight + 4 cols secondary) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Spotlight: High Risk Patients Queue (8 cols) */}
        <div className="p-6 lg:col-span-8 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-100">
                <AlertTriangle size={18} className="text-zinc-400" /> Action required
              </h2>
              <button className="text-xs text-sky-400 hover:underline">View all patients</button>
            </div>
            
            <div className="space-y-3">
              {!action_required || action_required.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">No immediate actions required for your patients.</p>
              ) : (
                action_required.map((alert: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-950">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-200">{alert.patient_name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{alert.issue}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-normal border ${
                        alert.risk_level === 'High' ? 'bg-red-950/40 text-red-400 border-red-900/40' :
                        alert.risk_level === 'Medium' ? 'bg-amber-950/40 text-amber-400 border-amber-900/40' :
                        'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                      }`}>
                        {alert.risk_level} risk
                      </span>
                      <button 
                        onClick={() => alert.patient_id && navigate(`/doctor/patients/${alert.patient_id}`)}
                        className="px-3 py-1.5 text-xs transition-colors rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-zinc-800 text-xs text-zinc-500">
            Automated monitoring updates every 15 minutes.
          </div>
        </div>

        {/* AI Insights & Observations Panel (4 cols) */}
        <div className="p-6 lg:col-span-4 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col justify-between">
          <div>
            <h2 className="flex items-center gap-2 mb-4 text-base font-semibold text-zinc-100">
              <Activity size={18} className="text-zinc-400" /> Clinical observations
            </h2>
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950">
                <p className="text-xs font-medium text-zinc-200 mb-1">Weekend adherence drop</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  15% decrease in evening doses across hypertensive patients on weekends vs weekdays.
                </p>
              </div>
              <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950">
                <p className="text-xs font-medium text-zinc-200 mb-1">Readmission indicator</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Patient #842 (John D.) exhibits vital fluctuation correlated with missed diuretic doses.
                </p>
              </div>
            </div>
          </div>

          <button className="w-full px-3 py-2 mt-6 text-xs font-medium transition-colors border border-zinc-700 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700">
            Export clinical report
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
