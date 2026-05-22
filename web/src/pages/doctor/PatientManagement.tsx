import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, ArrowRight, X, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';

export function PatientManagement() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');

  // 1. Query Active Patients (status = 'ACTIVE')
  const { data: patients = [], isLoading, refetch: refetchPatients } = useQuery({
    queryKey: ['doctor_patients', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user) return [];

      const { data: doctorProf, error: docErr } = await supabase
        .from('doctor_profiles')
        .select('user_id')
        .eq('id', user.id)
        .single();
      
      if (docErr || !doctorProf) {
        console.error('Error fetching doctor user_id:', docErr);
        return [];
      }

      const { data: connections, error: connErr } = await supabase
        .from('patient_connections')
        .select('patient_id')
        .eq('connected_user_id', doctorProf.user_id)
        .eq('status', 'ACTIVE');

      if (connErr || !connections) {
        console.error('Error fetching connections:', connErr);
        return [];
      }

      const patientIds = connections.map(c => c.patient_id).filter(Boolean);
      if (patientIds.length === 0) return [];

      const { data: profiles, error: profErr } = await supabase
        .from('patient_profiles')
        .select('*')
        .in('id', patientIds);

      if (profErr || !profiles) {
        console.error('Error fetching patient profiles:', profErr);
        return [];
      }

      return profiles.map(p => ({
        id: p.id,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unnamed Patient',
        mg_pat_id: p.mg_pat_id,
        status: p.health_status === 'CRITICAL' ? 'Critical' : 'Stable',
        alerts: p.health_status === 'CRITICAL' ? 1 : 0,
        blood_group: p.blood_group || 'O+',
        age: p.date_of_birth ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear() : 30,
        adherence_score: p.adherence_score || 85,
        allergies: Array.isArray(p.allergies) ? p.allergies.join(', ') : (p.allergies || 'None')
      }));
    }
  });

  // 2. Query Pending Requests (status = 'PENDING')
  const { data: pendingRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['doctor_pending_requests', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user) return [];

      const { data: doctorProf } = await supabase
        .from('doctor_profiles')
        .select('user_id')
        .eq('id', user.id)
        .single();
      
      if (!doctorProf) return [];

      const { data: connections } = await supabase
        .from('patient_connections')
        .select('id, patient_id, created_at')
        .eq('connected_user_id', doctorProf.user_id)
        .eq('connection_type', 'DOCTOR')
        .eq('status', 'PENDING');

      if (!connections || connections.length === 0) return [];
      const patientIds = connections.map(c => c.patient_id).filter(Boolean);

      const { data: profiles } = await supabase
        .from('patient_profiles')
        .select('*')
        .in('id', patientIds);

      if (!profiles) return [];

      return connections.map(c => {
        const p = profiles.find(prof => prof.id === c.patient_id);
        return {
          connectionId: c.id,
          patientId: p?.id,
          name: `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || 'Unnamed Patient',
          mg_pat_id: p?.mg_pat_id,
          created_at: c.created_at
        };
      });
    }
  });

  // Realtime subscription for connections
  useEffect(() => {
    if (user?.id) {
      const setupSubscription = async () => {
        const { data: doctorProf } = await supabase
          .from('doctor_profiles')
          .select('user_id')
          .eq('id', user.id)
          .single();
        
        if (!doctorProf) return;

        const channel = supabase
          .channel('doctor-connections-channel')
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'patient_connections', 
              filter: `connected_user_id=eq.${doctorProf.user_id}` 
            },
            () => {
              refetchPatients();
              refetchRequests();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      };
      
      setupSubscription();
    }
  }, [user?.id]);

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('patient_connections')
        .update({ status: 'ACTIVE' })
        .eq('id', connectionId);

      if (error) throw error;
      alert('Patient request accepted!');
      refetchRequests();
      refetchPatients();
    } catch (err: any) {
      console.error(err);
      alert('Failed to accept request: ' + err.message);
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('patient_connections')
        .update({ status: 'REJECTED' })
        .eq('id', connectionId);

      if (error) throw error;
      alert('Patient request declined.');
      refetchRequests();
    } catch (err: any) {
      console.error(err);
      alert('Failed to decline request: ' + err.message);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdInput || !user) return;

    try {
      const { data: patientProfile, error: patErr } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('mg_pat_id', patientIdInput.trim())
        .single();

      if (patErr || !patientProfile) {
        alert(`Patient with ID ${patientIdInput} not found.`);
        return;
      }

      const { data: doctorProf, error: docErr } = await supabase
        .from('doctor_profiles')
        .select('user_id')
        .eq('id', user.id)
        .single();
      
      if (docErr || !doctorProf) {
        alert('Could not find doctor profile.');
        return;
      }

      const { error: insertErr } = await supabase
        .from('patient_connections')
        .insert({
          patient_id: patientProfile.id,
          connected_user_id: doctorProf.user_id,
          connection_type: 'DOCTOR',
          status: 'ACTIVE', // Standard override to connect immediately
          created_at: new Date().toISOString()
        });

      if (insertErr) throw insertErr;

      alert(`Successfully connected to patient ${patientIdInput}!`);
      setIsConnectModalOpen(false);
      setPatientIdInput('');
      refetchPatients();
    } catch (err: any) {
      console.error(err);
      alert('Failed to connect to patient: ' + (err.message || 'unknown error'));
    }
  };

  const filters = ['All', 'Critical', 'Stable'];

  const filteredPatients = patients.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.mg_pat_id && p.mg_pat_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = activeFilter === 'All' || p.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Patient Management</h1>
          <p className="text-text-secondary font-medium">Manage and monitor your connected patients in real-time.</p>
        </div>
        <button 
          onClick={() => setIsConnectModalOpen(true)}
          className="bg-brand-purple hover:bg-brand-purple/80 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(112,0,255,0.4)] transition-colors"
        >
          <UserPlus size={20} /> Add New Patient
        </button>
      </header>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="mb-10 glass-panel p-6 rounded-3xl border border-orange-500/20 bg-orange-500/5">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            Incoming Connection Requests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((req: any) => (
              <div key={req.connectionId} className="bg-[#1A1A2E]/80 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm">{req.name}</h4>
                  <p className="text-xs text-brand-neon font-mono mt-1">{req.mg_pat_id}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleRejectRequest(req.connectionId)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white hover:bg-red-500/20 transition-colors"
                  >
                    Decline
                  </button>
                  <button 
                    onClick={() => handleAcceptRequest(req.connectionId)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-purple text-white hover:bg-brand-neon hover:text-black transition-colors"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-3.5 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search patients by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full enterprise-input py-3 pl-12 pr-4 text-white font-medium"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap border ${activeFilter === f ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/50' : 'bg-bg-surface text-text-secondary border-border-subtle hover:bg-white/5 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-text-muted font-medium">Loading patients...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-full text-center py-12 text-text-muted font-medium">No patients found matching your criteria.</div>
        ) : (
          filteredPatients.map((p: any) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={p.id}
              onClick={() => navigate(`/doctor/patients/${p.id}`)}
              className="glass-panel rounded-3xl p-6 cursor-pointer group relative overflow-hidden hover:border-brand-purple/30 transition-all"
            >
              {p.status === 'Critical' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-status-error/20 blur-2xl rounded-full"></div>
              )}
              
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full border-2 border-border-subtle shadow-sm bg-bg-base overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt="Avatar" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg group-hover:text-brand-neon transition-colors">{p.name}</h3>
                    <p className="text-xs text-text-secondary font-mono font-bold tracking-widest">{p.mg_pat_id || ('MG-PAT-' + p.id.slice(0, 5))}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full shadow-sm ${p.status === 'Critical' ? 'bg-status-error ai-glow' : 'bg-status-success'}`}></div>
              </div>

              <div className="space-y-4 mb-6 relative z-10">
                <div className="flex justify-between text-sm border-b border-border-subtle pb-3">
                  <span className="text-text-secondary font-medium">Condition</span>
                  <span className="text-white font-bold truncate max-w-[120px]">Hypertension</span>
                </div>
                <div className="flex justify-between text-sm border-b border-border-subtle pb-3">
                  <span className="text-text-secondary font-medium">Adherence</span>
                  <span className="text-brand-neon font-bold">85%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary font-medium">Last Active</span>
                  <span className="text-white font-bold">2 hours ago</span>
                </div>
              </div>

              {p.status === 'Critical' && (
                <div className="mb-6 p-3 rounded-xl bg-status-error/10 border border-status-error/20 flex gap-2 items-center text-status-error text-xs font-bold relative z-10">
                  <AlertTriangle size={16} /> Needs attention (Missed Dose)
                </div>
              )}

              <button className="w-full py-3 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 font-bold transition-colors flex items-center justify-center gap-2 text-sm group-hover:bg-brand-purple/20 group-hover:text-brand-neon">
                Open Workspace <ArrowRight size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Connect Patient Modal */}
      <AnimatePresence>
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel-deep p-8 w-full max-w-md relative rounded-3xl"
            >
              <button 
                onClick={() => setIsConnectModalOpen(false)}
                className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors bg-white/5 p-2 rounded-full"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-brand-neon rounded-2xl flex items-center justify-center text-white mb-6 shadow-md purple-glow">
                <UserPlus size={32} />
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-2">Connect Patient</h2>
              <p className="text-text-secondary font-medium text-sm mb-8">Enter the patient's unique MG-PAT ID to send a monitoring request.</p>

              <form onSubmit={handleConnect}>
                <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">Patient ID</label>
                <input 
                  type="text" 
                  required
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value.toUpperCase())}
                  placeholder="e.g. MG-PAT-10458" 
                  className="w-full enterprise-input px-4 py-4 text-white mb-8 font-mono tracking-wider text-lg"
                />

                <button type="submit" className="w-full bg-brand-purple hover:bg-brand-purple/80 text-white rounded-xl py-4 flex items-center justify-center gap-2 text-lg font-bold shadow-[0_0_15px_rgba(112,0,255,0.4)] transition-colors">
                  Send Request <ArrowRight size={20} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
