import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Activity, Calendar, Pill, FileText, Brain, ShieldAlert } from 'lucide-react';

import { WorkspaceMedications } from './workspace/WorkspaceMedications';
import { WorkspaceOverview } from './workspace/WorkspaceOverview';
import { WorkspaceHistory } from './workspace/WorkspaceHistory';
import { WorkspaceInsights } from './workspace/WorkspaceInsights';
import { WorkspaceAppointments } from './workspace/WorkspaceAppointments';

export function PatientWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: patientDetails, isLoading } = useQuery({
    queryKey: ['doctor_patient_details', id],
    queryFn: async () => {
      const res = await api.get(`/doctor/patients/${id}`);
      return res.data;
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'history', label: 'Medical History', icon: FileText },
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'emergency', label: 'Emergency Logs', icon: ShieldAlert },
  ];

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center h-full text-brand-neon">Loading Workspace...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#141423]">
      {/* Persistent Header */}
      <header className="glass border-b border-white/5 p-6 shrink-0 z-10">
        <div className="flex items-center gap-6 max-w-7xl mx-auto w-full">
          <button 
            onClick={() => navigate('/doctor/patients')}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="w-14 h-14 rounded-full border-2 border-brand-purple overflow-hidden shrink-0 bg-[#1A1A2E]">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patientDetails?.name}`} alt="Avatar" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{patientDetails?.name || 'Unknown Patient'}</h1>
              <span className="px-3 py-1 bg-brand-neon/10 border border-brand-neon/30 text-brand-neon rounded-lg font-mono text-xs font-bold tracking-widest">
                MG-PAT-{10450 + Number(id)}
              </span>
              <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Stable
              </span>
            </div>
            <div className="text-sm text-gray-400 mt-1 flex gap-4">
              <span>{patientDetails?.age || 'N/A'} yrs • {patientDetails?.blood_group || 'N/A'}</span>
              <span>Allergies: <strong className="text-red-400">{patientDetails?.allergies || 'None'}</strong></span>
            </div>
          </div>

          <div className="flex gap-4 shrink-0">
             <div className="text-right">
               <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Adherence Score</p>
               <p className="text-2xl font-bold text-brand-neon">{patientDetails?.adherence_score || 0}%</p>
             </div>
          </div>
        </div>
      </header>

      {/* Tabs Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Vertical Tab Navigation */}
        <div className="w-64 border-r border-white/5 bg-[#1A1A2E]/50 p-4 space-y-2 shrink-0 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                activeTab === tab.id 
                  ? 'bg-brand-purple text-white shadow-[0_0_15px_rgba(112,0,255,0.2)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : ''} />
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
                {activeTab === 'medications' && <WorkspaceMedications patientId={id || ''} />}
                {activeTab === 'appointments' && <WorkspaceAppointments patientId={id || ''} />}
                {activeTab === 'history' && <WorkspaceHistory patientId={id || ''} />}
                {activeTab === 'insights' && <WorkspaceInsights patientId={id || ''} />}
                {activeTab === 'reports' && <div className="text-center py-20 text-gray-500">Reports Uploads Module (Coming Soon)</div>}
                {activeTab === 'emergency' && <div className="text-center py-20 text-gray-500">Emergency Escalation History (Coming Soon)</div>}
              </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
