import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Calendar, Pill, FileText, Brain, ShieldAlert, CheckSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

import { WorkspaceMedications } from './workspace/WorkspaceMedications';
import { WorkspaceOverview } from './workspace/WorkspaceOverview';
import { WorkspaceHistory } from './workspace/WorkspaceHistory';
import { WorkspaceInsights } from './workspace/WorkspaceInsights';
import { WorkspaceAppointments } from './workspace/WorkspaceAppointments';
import { WorkspaceCompliance } from './workspace/WorkspaceCompliance';

export function PatientWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: patientDetails, isLoading } = useQuery({
    queryKey: ['doctor_patient_details', id],
    enabled: !!id,
    queryFn: async () => {
      let profileData: any = null;
      try {
        const { data, error } = await supabase
          .from('patient_profiles')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) profileData = data;
      } catch (err) {
        console.warn('Patient profile fetch error, fallback to demo patient details:', err);
      }

      if (!profileData) {
        return {
          id: id || '00000000-0000-0000-0000-000000600001',
          name: 'Amit Patel',
          mg_pat_id: 'MG-PAT-1001',
          age: 58,
          blood_group: 'O+',
          allergies: 'Penicillin, Dust',
          chronic_conditions: 'Hypertension',
          adherence_score: 92
        };
      }

      return {
        id: profileData.id,
        name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Unnamed Patient',
        mg_pat_id: profileData.mg_pat_id || 'MG-PAT-1001',
        age: profileData.date_of_birth ? new Date().getFullYear() - new Date(profileData.date_of_birth).getFullYear() : 58,
        blood_group: profileData.blood_group || 'O+',
        allergies: Array.isArray(profileData.allergies) ? profileData.allergies.join(', ') : (profileData.allergies || 'None'),
        chronic_conditions: Array.isArray(profileData.chronic_conditions) ? profileData.chronic_conditions.join(', ') : (profileData.chronic_conditions || 'None'),
        adherence_score: profileData.adherence_score || 85
      };
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'compliance', label: 'Compliance Calendar', icon: CheckSquare },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'history', label: 'Medical History', icon: FileText },
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'emergency', label: 'Emergency Logs', icon: ShieldAlert },
  ];

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center h-full text-brand-neon font-bold">Loading Workspace...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-bg-base">
      {/* Persistent Header */}
      <header className="bg-bg-secondary border-b border-border-subtle p-6 shrink-0 z-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative">
        <div className="flex items-center gap-6 max-w-7xl mx-auto w-full">
          <button 
            onClick={() => navigate('/doctor/patients')}
            className="w-10 h-10 rounded-2xl bg-bg-surface flex items-center justify-center hover:bg-white/5 text-text-secondary hover:text-white transition-colors shrink-0 border border-border-subtle shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="w-14 h-14 rounded-full border-2 border-border-subtle shadow-md bg-bg-input overflow-hidden shrink-0">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patientDetails?.name}`} alt="Avatar" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-zinc-100">{patientDetails?.name || 'Unknown Patient'}</h1>
              <span className="px-2 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-md font-mono text-xs">
                {patientDetails?.mg_pat_id || (patientDetails?.id ? 'MG-PAT-' + patientDetails.id.slice(0, 5) : 'N/A')}
              </span>
              <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded-full text-xs font-normal flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Stable
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-1 flex gap-3 font-normal">
              <span>{patientDetails?.age || 'N/A'} yrs · {patientDetails?.blood_group || 'N/A'}</span>
              <span>Allergies: <strong className="text-red-400 font-medium">{patientDetails?.allergies || 'None'}</strong></span>
            </div>
          </div>

          <div className="flex gap-4 shrink-0 bg-zinc-900 px-4 py-2.5 rounded-lg border border-zinc-800">
             <div className="text-right">
               <p className="text-[11px] text-zinc-400 font-normal mb-0.5">Adherence (vs 80% target)</p>
               <p className="text-xl font-semibold text-zinc-100">{patientDetails?.adherence_score || 0}%</p>
             </div>
          </div>
        </div>
      </header>

      {/* Tabs Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Vertical Tab Navigation */}
        <div className="w-60 border-r border-zinc-800 bg-zinc-950 p-4 space-y-1 shrink-0 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors font-medium text-xs border ${
                activeTab === tab.id 
                  ? 'bg-zinc-900 text-sky-400 border-zinc-800' 
                  : 'text-zinc-400 border-transparent hover:bg-zinc-900/50 hover:text-zinc-200'
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? 'text-sky-400' : 'text-zinc-500'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-8 overflow-y-auto relative">
           <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl mx-auto"
              >
                {activeTab === 'overview' && <WorkspaceOverview patientId={id || ''} />}
                {activeTab === 'compliance' && <WorkspaceCompliance patientId={id || ''} />}
                {activeTab === 'medications' && <WorkspaceMedications patientId={id || ''} />}
                {activeTab === 'appointments' && <WorkspaceAppointments patientId={id || ''} />}
                {activeTab === 'history' && <WorkspaceHistory patientId={id || ''} />}
                {activeTab === 'insights' && <WorkspaceInsights patientId={id || ''} />}
                {activeTab === 'reports' && <div className="text-center py-20 text-text-muted font-medium">Reports Uploads Module (Coming Soon)</div>}
                {activeTab === 'emergency' && <div className="text-center py-20 text-text-muted font-medium">Emergency Escalation History (Coming Soon)</div>}
              </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
