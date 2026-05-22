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
      const { data, error } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        id: data.id,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Unnamed Patient',
        mg_pat_id: data.mg_pat_id,
        age: data.date_of_birth ? new Date().getFullYear() - new Date(data.date_of_birth).getFullYear() : 30,
        blood_group: data.blood_group || 'O+',
        allergies: Array.isArray(data.allergies) ? data.allergies.join(', ') : (data.allergies || 'None'),
        chronic_conditions: Array.isArray(data.chronic_conditions) ? data.chronic_conditions.join(', ') : (data.chronic_conditions || 'None'),
        adherence_score: data.adherence_score || 85
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
              <h1 className="text-2xl font-extrabold text-white">{patientDetails?.name || 'Unknown Patient'}</h1>
              <span className="px-3 py-1 bg-brand-purple/10 text-brand-neon border border-brand-purple/20 rounded-xl font-mono text-xs font-bold tracking-widest shadow-sm">
                {patientDetails?.mg_pat_id || (patientDetails?.id ? 'MG-PAT-' + patientDetails.id.slice(0, 5) : 'N/A')}
              </span>
              <span className="px-3 py-1 bg-status-success/10 text-status-success border border-status-success/20 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                <span className="w-2 h-2 bg-status-success rounded-full animate-pulse"></span> Stable
              </span>
            </div>
            <div className="text-sm text-text-secondary mt-1 flex gap-4 font-medium">
              <span>{patientDetails?.age || 'N/A'} yrs • {patientDetails?.blood_group || 'N/A'}</span>
              <span>Allergies: <strong className="text-status-error">{patientDetails?.allergies || 'None'}</strong></span>
            </div>
          </div>

          <div className="flex gap-4 shrink-0 bg-bg-surface px-5 py-3 rounded-2xl border border-border-subtle shadow-inner">
             <div className="text-right">
               <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Adherence Score</p>
               <p className="text-2xl font-extrabold text-brand-neon">{patientDetails?.adherence_score || 0}%</p>
             </div>
          </div>
        </div>
      </header>

      {/* Tabs Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Vertical Tab Navigation */}
        <div className="w-64 border-r border-border-subtle bg-bg-sidebar p-6 space-y-2 shrink-0 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm border ${
                activeTab === tab.id 
                  ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/50 shadow-[inset_0_0_10px_rgba(112,0,255,0.1)]' 
                  : 'text-text-secondary border-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-brand-neon' : ''} />
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
