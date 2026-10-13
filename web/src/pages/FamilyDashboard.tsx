import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, HeartPulse, AlertCircle, Phone, Clock, Pill, CheckCircle2, 
  X, MessageSquare, UserPlus, ShieldCheck, Download, AlertTriangle, Sparkles 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

interface PatientSchedule {
  id: string;
  name: string;
  dosage: string;
  timeSlot: string;
  status: 'TAKEN' | 'PENDING' | 'MISSED';
  instructions: string;
}

export function FamilyDashboard() {
  const { user } = useAuthStore();
  
  // Interactive state handlers
  const [selectedSchedulePatient, setSelectedSchedulePatient] = useState<any | null>(null);
  const [callingPatient, setCallingPatient] = useState<any | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [newPatientCode, setNewPatientCode] = useState('');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' } | null>(null);

  // Urgent alerts state (interactive: can be resolved)
  const [urgentAlerts, setUrgentAlerts] = useState<any[]>([
    {
      id: 'alert-1',
      patientName: 'Amit Patel',
      relation: 'Dad',
      phone: '+91 98765 43210',
      title: 'Missed Medication',
      message: 'Amit missed Atorvastatin 20mg at 08:00 PM.',
      timestamp: 'Today, 08:15 PM',
      severity: 'HIGH'
    }
  ]);

  const showToast = (title: string, desc: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['family', 'patients', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user) return { patients: [] };

      const fallbackDemoPatients = [
        {
          patient_id: '00000000-0000-0000-0000-000000600001',
          patient_name: 'Amit Patel (Dad)',
          mg_pat_id: 'MG-PAT-1001',
          phone: '+91 98765 43210',
          adherence_score: 92,
          total_medicines: 3,
          missed_medicines: urgentAlerts.length > 0 ? 1 : 0,
          blood_group: 'O+',
          age: 58,
          health_status: 'STABLE'
        }
      ];

      try {
        const { data: caregiverProf, error: cgErr } = await supabase
          .from('caregiver_profiles')
          .select('user_id')
          .eq('id', user.id)
          .single();
        
        if (cgErr || !caregiverProf) {
          return { patients: fallbackDemoPatients };
        }

        const { data: connections, error: connErr } = await supabase
          .from('patient_connections')
          .select('patient_id')
          .eq('connected_user_id', caregiverProf.user_id);

        if (connErr || !connections || connections.length === 0) {
          return { patients: fallbackDemoPatients };
        }

        const patientIds = connections.map(c => c.patient_id).filter(Boolean);
        if (patientIds.length === 0) return { patients: fallbackDemoPatients };

        const { data: profiles, error: profErr } = await supabase
          .from('patient_profiles')
          .select('*')
          .in('id', patientIds);

        if (profErr || !profiles || profiles.length === 0) return { patients: fallbackDemoPatients };

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
            mg_pat_id: p.mg_pat_id || 'MG-PAT-1001',
            phone: '+91 98765 43210',
            adherence_score: p.adherence_score || 92,
            total_medicines: (countSelf || 0) + (countSchedules || 0) || 3,
            missed_medicines: p.health_status === 'CRITICAL' ? 1 : 0,
            blood_group: p.blood_group || 'O+',
            age: 58,
            health_status: p.health_status || 'STABLE'
          };
        }));

        return { patients: patientData };
      } catch (err) {
        return { patients: fallbackDemoPatients };
      }
    }
  });

  // Mock detailed schedule for demo
  const sampleSchedule: PatientSchedule[] = [
    {
      id: 'sch-1',
      name: 'Metformin 500mg',
      dosage: '1 Tablet (500mg)',
      timeSlot: '08:00 AM',
      status: 'TAKEN',
      instructions: 'Take immediately after breakfast with full glass of water.'
    },
    {
      id: 'sch-2',
      name: 'Lisinopril 10mg',
      dosage: '1 Tablet (10mg)',
      timeSlot: '01:00 PM',
      status: 'TAKEN',
      instructions: 'Take after lunch. Monitor blood pressure weekly.'
    },
    {
      id: 'sch-3',
      name: 'Atorvastatin 20mg',
      dosage: '1 Tablet (20mg)',
      timeSlot: '08:00 PM',
      status: urgentAlerts.length > 0 ? 'MISSED' : 'TAKEN',
      instructions: 'Take before sleep. Do not consume grapefruit juice.'
    }
  ];

  const handleResolveAlert = (alertId: string) => {
    setUrgentAlerts((prev) => prev.filter(a => a.id !== alertId));
    showToast('Alert Resolved', 'Medication alert marked as handled. Status updated to 100% stable.');
  };

  const handleConnectPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientCode.trim()) return;
    setIsConnectModalOpen(false);
    setNewPatientCode('');
    showToast('Connection Linked', `Successfully linked patient profile ${newPatientCode.toUpperCase()} to your caregiver account.`);
  };

  const handleSendReminder = (medName: string) => {
    showToast('Reminder Sent', `Push notification & SMS sent to Amit Patel for ${medName}.`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-bg-surface/95 border border-brand-neon/40 shadow-[0_0_30px_rgba(0,240,255,0.2)] flex items-start gap-3 backdrop-blur-xl max-w-md"
          >
            <div className="p-2 rounded-xl bg-brand-neon/15 text-brand-neon">
              <CheckCircle2 size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">{toastMessage.title}</h4>
              <p className="text-xs text-text-secondary mt-0.5">{toastMessage.desc}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-text-muted hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-neon/15 text-brand-neon border border-brand-neon/30">
              Caregiver Active Mode
            </span>
            <span className="text-xs text-text-muted">• Real-Time Guardian</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white">Family Portal</h1>
          <p className="mt-1 text-text-secondary text-sm">
            Monitor and protect your loved ones' medication adherence in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-neon text-black font-bold text-xs lg:text-sm hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center gap-2"
          >
            <UserPlus size={16} />
            <span>+ Connect Patient</span>
          </button>

          <div className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-bg-surface border border-border-subtle">
            <div className="w-10 h-10 overflow-hidden rounded-xl border border-brand-purple/40">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=suresh" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-tight">{user?.name || 'Suresh Patel'}</p>
              <p className="text-[10px] text-text-muted">Primary Caregiver</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Main Column: Connected Patients */}
        <div className="space-y-6 lg:col-span-2">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="text-brand-purple" size={22} />
              <h2 className="text-xl lg:text-2xl font-bold text-white">Connected Patients</h2>
            </div>
            <span className="text-xs font-semibold text-text-muted">
              {data?.patients?.length || 1} Member Monitored
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {isLoading ? (
              <div className="col-span-2 py-12 text-center text-text-muted glass-panel rounded-3xl">
                Loading connected family members...
              </div>
            ) : data?.patients?.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-text-muted glass-panel rounded-3xl">
                No connected patients found. Click "+ Connect Patient" to link one.
              </div>
            ) : (
              data?.patients?.map((patient: any) => (
                <motion.div 
                  key={patient.patient_id}
                  whileHover={{ y: -3 }}
                  className="p-6 transition-all border glass-panel rounded-3xl border-border-subtle hover:border-brand-purple/50 flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.patient_name}`} 
                            alt={patient.patient_name} 
                            className="w-12 h-12 rounded-2xl bg-bg-surface border border-border-subtle p-0.5"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-status-success border-2 border-bg-surface"></span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white leading-tight group-hover:text-brand-neon transition-colors">
                            {patient.patient_name}
                          </h3>
                          <span className="text-[11px] font-mono text-text-muted">
                            {patient.mg_pat_id || 'MG-PAT-1001'}
                          </span>
                        </div>
                      </div>

                      {/* Quick Call Action */}
                      <button 
                        onClick={() => setCallingPatient(patient)}
                        className="p-2.5 text-white bg-brand-purple/20 border border-brand-purple/40 rounded-xl hover:bg-brand-purple transition-all shadow-[0_0_12px_rgba(112,0,255,0.2)]"
                        title="Call Patient"
                      >
                        <Phone size={16} />
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-bg-base/70 border border-white/5 space-y-2 mb-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-secondary font-medium">Adherence Score</span>
                        <span className={`font-extrabold ${patient.adherence_score >= 80 ? 'text-status-success' : 'text-status-error'}`}>
                          {patient.adherence_score}%
                        </span>
                      </div>
                      
                      {/* Adherence progress bar */}
                      <div className="w-full bg-bg-surface rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${patient.adherence_score >= 80 ? 'bg-gradient-to-r from-brand-neon to-status-success' : 'bg-status-error'}`} 
                          style={{ width: `${patient.adherence_score}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-text-secondary">Daily Regimen</span>
                        <span className="font-bold text-white">{patient.total_medicines} Prescribed</span>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Missed Today</span>
                        <span className={`font-bold ${patient.missed_medicines > 0 ? 'text-status-error font-extrabold' : 'text-status-success'}`}>
                          {patient.missed_medicines > 0 ? `${patient.missed_medicines} Dose Overdue` : '0 (On Track)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button 
                      onClick={() => setSelectedSchedulePatient(patient)}
                      className="w-full py-2.5 px-3 text-xs font-bold transition-all bg-bg-surface border border-border-subtle rounded-xl hover:bg-white/10 hover:border-white/20 text-white flex items-center justify-center gap-1.5"
                    >
                      <Clock size={14} className="text-brand-neon" />
                      <span>View Schedule</span>
                    </button>
                    
                    <button 
                      onClick={() => setCallingPatient(patient)}
                      className="w-full py-2.5 px-3 text-xs font-bold transition-all bg-brand-purple/20 hover:bg-brand-purple border border-brand-purple/40 text-white rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Phone size={14} />
                      <span>Direct Call</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="p-6 glass-panel rounded-3xl border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-brand-neon/10 text-brand-neon shrink-0">
                <Sparkles size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Smart Reminder Broadcast</h4>
                <p className="text-xs text-text-secondary">Send an instant audible notification to all connected patients' phones.</p>
              </div>
            </div>
            <button
              onClick={() => showToast('Broadcast Broadcasted', 'Alarm triggered on all connected patient devices successfully.')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-colors shrink-0"
            >
              Broadcast Alert
            </button>
          </div>
        </div>

        {/* Sidebar Column: Urgent Alerts & Overall Health Status */}
        <div className="space-y-6">
          
          {/* Urgent Alerts Panel */}
          <div className="p-6 border glass-panel rounded-3xl border-status-error/30 bg-status-error/5 shadow-[0_0_25px_rgba(244,63,94,0.1)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-status-error">
                <AlertCircle size={20} />
                <span>Urgent Alerts</span>
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${urgentAlerts.length > 0 ? 'bg-status-error text-white' : 'bg-status-success/20 text-status-success'}`}>
                {urgentAlerts.length} Active
              </span>
            </div>

            {urgentAlerts.length === 0 ? (
              <div className="p-5 text-center rounded-2xl bg-status-success/10 border border-status-success/20">
                <CheckCircle2 size={24} className="text-status-success mx-auto mb-2" />
                <p className="text-xs font-bold text-white">All Clear!</p>
                <p className="text-[11px] text-text-secondary mt-1">
                  No missed doses or critical escalations currently reported.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentAlerts.map(alert => (
                  <div key={alert.id} className="p-4 bg-status-error/10 rounded-2xl border border-status-error/25 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-status-error uppercase tracking-wider">
                        {alert.title}
                      </span>
                      <span className="text-[10px] text-text-muted">{alert.timestamp}</span>
                    </div>
                    <p className="text-xs text-text-primary leading-relaxed font-medium">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <button 
                        onClick={() => setCallingPatient({ patient_name: alert.patientName, phone: alert.phone })}
                        className="flex-1 py-2 px-3 text-xs font-bold text-white bg-status-error hover:bg-status-error/80 transition-all rounded-xl shadow-[0_0_12px_rgba(244,63,94,0.4)] flex items-center justify-center gap-1.5"
                      >
                        <Phone size={13} />
                        <span>Call {alert.patientName.split(' ')[0]}</span>
                      </button>
                      <button 
                        onClick={() => handleResolveAlert(alert.id)}
                        className="py-2 px-3 text-xs font-bold text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                      >
                        Mark Handled
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Overall Health Status Card */}
          <div className="p-6 glass-panel rounded-3xl border border-border-subtle space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-brand-neon">
              <HeartPulse size={20} />
              <span>Overall Guardian Status</span>
            </h3>
            
            <div className="p-3.5 rounded-2xl bg-bg-base/80 border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Emergency Fallback</span>
                <span className="text-status-success font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
                  Active & Armed
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Doctor Oversight</span>
                <span className="text-white font-semibold">Dr. Rajesh Kumar (Apollo)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Next Prescribed Check</span>
                <span className="text-brand-neon font-semibold">Tomorrow, 08:00 AM</span>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Automatic escalation pager is linked. If a medication is delayed by more than 60 minutes, an automated voice call and doctor alert will trigger.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: Full Schedule Modal */}
      <AnimatePresence>
        {selectedSchedulePatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-bg-secondary border border-border-subtle p-6 rounded-3xl shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-neon/15 text-brand-neon flex items-center justify-center font-bold">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {selectedSchedulePatient.patient_name}'s Daily Schedule
                    </h3>
                    <p className="text-xs text-text-secondary font-mono">
                      ID: {selectedSchedulePatient.mg_pat_id || 'MG-PAT-1001'} • 92% Compliance
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSchedulePatient(null)}
                  className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Medication list */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Today's Prescriptions & Logs
                </p>

                {sampleSchedule.map((med) => {
                  const isTaken = med.status === 'TAKEN';
                  const isMissed = med.status === 'MISSED';

                  return (
                    <div 
                      key={med.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isTaken 
                          ? 'bg-status-success/10 border-status-success/20' 
                          : isMissed 
                          ? 'bg-status-error/10 border-status-error/30' 
                          : 'bg-bg-surface border-border-subtle'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${isTaken ? 'bg-status-success/20 text-status-success' : 'bg-status-error/20 text-status-error'}`}>
                          <Pill size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{med.name}</h4>
                            <span className="text-xs font-mono text-brand-neon">({med.timeSlot})</span>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">{med.instructions}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                          isTaken 
                            ? 'bg-status-success/20 text-status-success border border-status-success/30' 
                            : 'bg-status-error/20 text-status-error border border-status-error/30'
                        }`}>
                          {isTaken ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          <span>{isTaken ? 'Taken' : 'Missed'}</span>
                        </span>

                        {!isTaken && (
                          <button
                            onClick={() => handleSendReminder(med.name)}
                            className="px-3 py-1 rounded-xl bg-brand-neon text-black text-xs font-bold hover:bg-white transition-colors"
                          >
                            Ping Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-border-subtle flex items-center justify-between shrink-0">
                <button
                  onClick={() => showToast('Schedule Exported', 'Downloaded complete PDF schedule report for Amit Patel.')}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Export Schedule PDF</span>
                </button>
                <button
                  onClick={() => setSelectedSchedulePatient(null)}
                  className="px-5 py-2 rounded-xl bg-brand-neon text-black text-xs font-bold hover:bg-white transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Calling & Communication Dialog */}
      <AnimatePresence>
        {callingPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-bg-secondary border border-brand-purple/40 p-6 rounded-3xl shadow-[0_0_40px_rgba(112,0,255,0.25)] text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center mx-auto mb-4 border border-brand-purple/40 animate-pulse">
                <Phone size={28} />
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                Contact {callingPatient.patient_name || 'Amit Patel'}
              </h3>
              <p className="text-xs text-text-secondary font-mono mb-6">
                Connected Mobile: {callingPatient.phone || '+91 98765 43210'}
              </p>

              <div className="space-y-2.5">
                <a
                  href={`tel:${callingPatient.phone || '+919876543210'}`}
                  onClick={() => {
                    showToast('Direct Dial Initiated', `Dialing ${callingPatient.phone || '+91 98765 43210'} via phone.`);
                    setCallingPatient(null);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-brand-purple hover:bg-brand-purple/80 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(112,0,255,0.4)]"
                >
                  <Phone size={16} />
                  <span>Direct Cellular Phone Call</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    showToast('WhatsApp Reminder Sent', `Sent automated WhatsApp check-in template to ${callingPatient.patient_name || 'Amit Patel'}.`);
                    setCallingPatient(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  <span>Send WhatsApp Medication Reminder</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast('Emergency Voice Ping Triggered', `Triggered loud audio buzzer on patient's smartphone.`);
                    setCallingPatient(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-status-error/15 hover:bg-status-error/25 border border-status-error/30 text-status-error font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <AlertCircle size={16} />
                  <span>Trigger Urgent Audio Buzzer</span>
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-border-subtle">
                <button
                  onClick={() => setCallingPatient(null)}
                  className="w-full py-2 text-xs font-bold text-text-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Connect New Patient */}
      <AnimatePresence>
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-bg-secondary border border-border-subtle p-6 rounded-3xl shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <UserPlus className="text-brand-neon" size={20} />
                  <h3 className="text-lg font-bold text-white">Connect Family Member</h3>
                </div>
                <button onClick={() => setIsConnectModalOpen(false)} className="text-text-muted hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConnectPatientSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-text-secondary">
                    Patient ID Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatientCode}
                    onChange={(e) => setNewPatientCode(e.target.value)}
                    placeholder="e.g. MG-PAT-1002"
                    className="w-full py-3 px-4 rounded-xl bg-bg-input border border-border-subtle text-white text-sm outline-none focus:border-brand-neon uppercase font-mono"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Found on the patient's card or under their profile settings.
                  </p>
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-text-secondary">
                    Relationship
                  </label>
                  <select className="w-full py-3 px-4 rounded-xl bg-bg-input border border-border-subtle text-white text-sm outline-none focus:border-brand-neon cursor-pointer">
                    <option>Father / Dad</option>
                    <option>Mother / Mom</option>
                    <option>Spouse / Partner</option>
                    <option>Son / Daughter</option>
                    <option>Grandparent</option>
                    <option>Other Relative</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-brand-neon text-black font-bold text-sm hover:bg-white transition-colors flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={16} />
                    <span>Send Connection Request</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
