import { useState, useEffect } from 'react';
import { User, Bell, Shield, Smartphone, Search, UserPlus, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';

export function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'connections'>('profile');
  
  // Profile state
  const [myProfile, setMyProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Connections state
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [activeConnections, setActiveConnections] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'doctor' | 'patient'>('doctor');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch Patient Profile details
  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setMyProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch incoming requests and active connections
  const fetchConnectionsData = async () => {
    if (!user) return;
    try {
      // 1. Fetch Incoming Requests (where patient_id = user.id and status = 'PENDING')
      const { data: incoming, error: incErr } = await supabase
        .from('patient_connections')
        .select('*')
        .eq('patient_id', user.id)
        .eq('status', 'PENDING');

      if (incErr) throw incErr;

      // Map incoming requests to fetch names
      const incomingDetails = await Promise.all(
        (incoming || []).map(async (conn) => {
          if (conn.connection_type === 'DOCTOR') {
            // Find doctor
            const { data: doc } = await supabase
              .from('doctor_profiles')
              .select('first_name, last_name, specialization')
              .eq('user_id', conn.connected_user_id)
              .single();
            return {
              id: conn.id,
              type: 'DOCTOR',
              senderName: doc ? `Dr. ${doc.first_name} ${doc.last_name}` : 'Unknown Doctor',
              description: doc?.specialization || 'General Health Partner',
            };
          } else {
            // Find patient/caregiver who wants to monitor us
            const { data: pat } = await supabase
              .from('patient_profiles')
              .select('first_name, last_name')
              .eq('user_id', conn.connected_user_id)
              .single();
            return {
              id: conn.id,
              type: 'CAREGIVER',
              senderName: pat ? `${pat.first_name} ${pat.last_name}` : 'Care Partner',
              description: 'Wants to monitor your medicine adherence.',
            };
          }
        })
      );
      setIncomingRequests(incomingDetails);

      // 2. Fetch Active Connections
      // Active Doctor connections: patient_id = user.id, status = 'ACTIVE'
      const { data: docConns } = await supabase
        .from('patient_connections')
        .select('*')
        .eq('patient_id', user.id)
        .eq('status', 'ACTIVE');

      const activeDoctorDetails = await Promise.all(
        (docConns || []).map(async (conn) => {
          const { data: doc } = await supabase
            .from('doctor_profiles')
            .select('first_name, last_name, specialization')
            .eq('user_id', conn.connected_user_id)
            .single();
          return {
            id: conn.id,
            name: doc ? `Dr. ${doc.first_name} ${doc.last_name}` : 'Unknown Doctor',
            role: 'Doctor',
            details: doc?.specialization || 'Specialist',
          };
        })
      );

      // Active Peer/Caregiver connections: where connected_user_id = my core user_id OR patient_id = user.id, status = 'ACTIVE'
      // To keep it simple, query connections where we are either being monitored (patient_id = user.id, type = CAREGIVER)
      // or we are monitoring someone else (connected_user_id = myProfile.user_id, type = CAREGIVER)
      const myCoreUserId = myProfile?.user_id;
      const peerActiveDetails: any[] = [];

      if (myCoreUserId) {
        // We are monitoring them:
        const { data: monitoringConns } = await supabase
          .from('patient_connections')
          .select('*')
          .eq('connected_user_id', myCoreUserId)
          .eq('connection_type', 'CAREGIVER')
          .eq('status', 'ACTIVE');

        if (monitoringConns) {
          const details = await Promise.all(
            monitoringConns.map(async (conn) => {
              const { data: pat } = await supabase
                .from('patient_profiles')
                .select('first_name, last_name, mg_pat_id')
                .eq('id', conn.patient_id)
                .single();
              return {
                id: conn.id,
                name: pat ? `${pat.first_name} ${pat.last_name}` : 'Loved One',
                role: 'Monitored Peer',
                details: pat ? `ID: ${pat.mg_pat_id}` : '',
              };
            })
          );
          peerActiveDetails.push(...details);
        }

        // They are monitoring us:
        const { data: monitoredConns } = await supabase
          .from('patient_connections')
          .select('*')
          .eq('patient_id', user.id)
          .eq('connection_type', 'CAREGIVER')
          .eq('status', 'ACTIVE');

        if (monitoredConns) {
          const details = await Promise.all(
            monitoredConns.map(async (conn) => {
              const { data: pat } = await supabase
                .from('patient_profiles')
                .select('first_name, last_name')
                .eq('user_id', conn.connected_user_id)
                .single();
              return {
                id: conn.id,
                name: pat ? `${pat.first_name} ${pat.last_name}` : 'Care Monitor',
                role: 'Viewer (Caregiver)',
                details: 'Has permission to view adherence.',
              };
            })
          );
          peerActiveDetails.push(...details);
        }
      }

      setActiveConnections([...activeDoctorDetails, ...peerActiveDetails]);
    } catch (err) {
      console.error('Error fetching connections details:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (myProfile) {
      fetchConnectionsData();
    }
  }, [myProfile]);

  // Handle Search Doctors or Patients
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      if (searchType === 'doctor') {
        const { data, error } = await supabase
          .from('doctor_profiles')
          .select('*');
        
        if (error) throw error;
        
        const term = searchTerm.toLowerCase().trim();
        const filtered = (data || []).filter(d => {
          if (!d.user_id) return false;
          const fullName = `${d.first_name || ''} ${d.last_name || ''}`.toLowerCase();
          const specialization = (d.specialization || '').toLowerCase();
          return fullName.includes(term) || specialization.includes(term);
        });
        setSearchResults(filtered);
      } else {
        // Search patients, excluding self
        const { data, error } = await supabase
          .from('patient_profiles')
          .select('*')
          .neq('id', user?.id);
        
        if (error) throw error;
        
        const term = searchTerm.toLowerCase().trim();
        const filtered = (data || []).filter(p => {
          if (!p.user_id) return false;
          const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
          const patId = (p.mg_pat_id || '').toLowerCase();
          return fullName.includes(term) || patId.includes(term);
        });
        setSearchResults(filtered);
      }
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Realtime subscription for connections center
  useEffect(() => {
    if (user?.id) {
      const channel = supabase
        .channel('patient-connections-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'patient_connections',
            filter: `patient_id=eq.${user.id}`
          },
          () => {
            fetchConnectionsData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  // Action handlers
  const handleConnectDoctor = async (doctorUserId: string) => {
    if (!user || isActionLoading) return;
    setIsActionLoading(true);
    try {
      // Check if connection already exists
      const { data: existing } = await supabase
        .from('patient_connections')
        .select('*')
        .eq('patient_id', user.id)
        .eq('connected_user_id', doctorUserId)
        .single();

      if (existing) {
        alert('A connection request or active link already exists with this doctor.');
        return;
      }

      const { error } = await supabase
        .from('patient_connections')
        .insert({
          patient_id: user.id,
          connected_user_id: doctorUserId,
          connection_type: 'DOCTOR',
          status: 'PENDING',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Request sent to doctor successfully!');
      setSearchResults([]);
      setSearchTerm('');
    } catch (err: any) {
      console.error(err);
      alert('Failed to send request: ' + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConnectPatient = async (targetPatientProfileId: string) => {
    if (!myProfile || isActionLoading) return;
    setIsActionLoading(true);
    try {
      // Check if connection already exists
      const { data: existing } = await supabase
        .from('patient_connections')
        .select('*')
        .eq('patient_id', targetPatientProfileId)
        .eq('connected_user_id', myProfile.user_id)
        .single();

      if (existing) {
        alert('A connection request or active link already exists with this patient.');
        return;
      }

      const { error } = await supabase
        .from('patient_connections')
        .insert({
          patient_id: targetPatientProfileId,
          connected_user_id: myProfile.user_id,
          connection_type: 'CAREGIVER',
          status: 'PENDING',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Monitor request sent to patient successfully!');
      setSearchResults([]);
      setSearchTerm('');
    } catch (err: any) {
      console.error(err);
      alert('Failed to send request: ' + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    setIsActionLoading(true);
    try {
      const { error } = await supabase
        .from('patient_connections')
        .update({ status: 'ACTIVE' })
        .eq('id', id);

      if (error) throw error;
      alert('Connection accepted!');
      fetchConnectionsData();
    } catch (err: any) {
      console.error(err);
      alert('Error accepting: ' + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeclineRequest = async (id: string) => {
    setIsActionLoading(true);
    try {
      const { error } = await supabase
        .from('patient_connections')
        .update({ status: 'REJECTED' })
        .eq('id', id);

      if (error) throw error;
      alert('Connection declined.');
      fetchConnectionsData();
    } catch (err: any) {
      console.error(err);
      alert('Error declining: ' + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRevokeConnection = async (id: string) => {
    if (!confirm('Are you sure you want to end this connection?')) return;
    setIsActionLoading(true);
    try {
      const { error } = await supabase
        .from('patient_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Connection terminated.');
      fetchConnectionsData();
    } catch (err: any) {
      console.error(err);
      alert('Error removing connection: ' + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <header className="mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">Settings</h1>
        <p className="text-gray-400">Manage your profile, account connections, and healthcare preferences.</p>
      </header>

      {/* Tabs Selection */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${activeTab === 'profile' ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/50' : 'bg-bg-surface text-text-secondary border-border-subtle hover:text-white'}`}
        >
          General Settings
        </button>
        <button 
          onClick={() => setActiveTab('connections')} 
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${activeTab === 'connections' ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/50' : 'bg-bg-surface text-text-secondary border-border-subtle hover:text-white'}`}
        >
          Connections Center
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === 'profile' && (
          <>
            {/* Profile Dynamic Information */}
            <div className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple border border-brand-purple/30">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{user?.name || 'Patient'}</h3>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                  <div className="mt-2 inline-block px-3 py-1 bg-brand-neon/10 border border-brand-neon/30 text-brand-neon rounded-lg font-mono text-sm tracking-widest font-bold">
                    ID: {loadingProfile ? 'Loading...' : (myProfile?.mg_pat_id || 'Not Assigned')}
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-bold">Edit Profile</button>
            </div>

            {/* Static Settings Toggles */}
            <div className="glass p-8 rounded-3xl border border-white/5 space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="mt-1 text-brand-neon"><Bell size={24}/></div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Push Notifications</h4>
                    <p className="text-sm text-gray-400">Receive alerts for medicines and appointments.</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-brand-neon rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                  <div className="absolute right-1 top-1 bottom-1 w-4 bg-[#141423] rounded-full"></div>
                </div>
              </div>

              <div className="w-full h-px bg-white/5"></div>

              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="mt-1 text-brand-purple"><Shield size={24}/></div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Caregiver Access</h4>
                    <p className="text-sm text-gray-400">Allow linked family members to view your health data.</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-brand-purple rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(112,0,255,0.3)]">
                  <div className="absolute right-1 top-1 bottom-1 w-4 bg-[#141423] rounded-full"></div>
                </div>
              </div>

              <div className="w-full h-px bg-white/5"></div>

              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="mt-1 text-gray-400"><Smartphone size={24}/></div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Dark Mode</h4>
                    <p className="text-sm text-gray-400">Use the futuristic dark theme.</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 bottom-1 w-4 bg-[#141423] rounded-full"></div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'connections' && (
          <div className="space-y-6">
            
            {/* Pending Requests */}
            {incomingRequests.length > 0 && (
              <div className="glass p-6 rounded-3xl border border-orange-500/20 bg-orange-500/5">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-orange-400 animate-pulse" /> Pending Connection Requests
                </h2>
                <div className="space-y-3">
                  {incomingRequests.map((req) => (
                    <div key={req.id} className="bg-[#1A1A2E]/80 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-sm">{req.senderName}</p>
                        <p className="text-xs text-gray-400 mt-1">{req.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          disabled={isActionLoading}
                          onClick={() => handleDeclineRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-red-500/25 transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button 
                          disabled={isActionLoading}
                          onClick={() => handleAcceptRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-purple text-white hover:bg-brand-neon hover:text-black transition-colors disabled:opacity-50"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connections Search & Add Panel */}
            <div className="glass p-6 rounded-3xl border border-white/5">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-brand-purple" /> Connect to Doctor or Peer
              </h2>
              <p className="text-sm text-gray-400 mb-6">Search doctors to manage prescriptions or search other patients to monitor their medication compliance.</p>

              <form onSubmit={handleSearch} className="space-y-4 mb-6">
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => { setSearchType('doctor'); setSearchResults([]); }}
                    className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${searchType === 'doctor' ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/50' : 'bg-[#1A1A2E] text-text-secondary border-border-subtle hover:text-white'}`}
                  >
                    Find Doctor
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setSearchType('patient'); setSearchResults([]); }}
                    className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${searchType === 'patient' ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/50' : 'bg-[#1A1A2E] text-text-secondary border-border-subtle hover:text-white'}`}
                  >
                    Find Peer Patient
                  </button>
                </div>

                <div className="relative">
                  <Search size={20} className="absolute left-4 top-3.5 text-text-muted" />
                  <input 
                    type="text" 
                    required
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchType === 'doctor' ? "Search doctors by name or specialization..." : "Search patients by name or Patient ID..."} 
                    className="w-full enterprise-input py-3.5 pl-12 pr-24 text-white text-sm"
                  />
                  <button 
                    type="submit" 
                    className="absolute right-2 top-2 bottom-2 px-4 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Search Results */}
              {isSearching ? (
                <div className="text-center py-6 text-text-muted text-sm font-bold">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {searchResults.map((res) => (
                    <div key={res.id} className="bg-[#1A1A2E]/50 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {searchType === 'doctor' ? `Dr. ${res.first_name} ${res.last_name}` : `${res.first_name} ${res.last_name}`}
                        </h4>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {searchType === 'doctor' ? res.specialization || 'Clinical Specialist' : `ID: ${res.mg_pat_id}`}
                        </p>
                      </div>
                      <button 
                        disabled={isActionLoading}
                        onClick={() => searchType === 'doctor' ? handleConnectDoctor(res.user_id) : handleConnectPatient(res.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-neon/10 border border-brand-neon/20 text-brand-neon hover:bg-brand-neon hover:text-black transition-all flex items-center gap-1"
                      >
                        <UserPlus size={14} /> Send Request
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchTerm && !isSearching && (
                <div className="text-center py-6 text-text-muted text-sm font-bold">No matches found.</div>
              )}
            </div>

            {/* Active Connections */}
            <div className="glass p-6 rounded-3xl border border-white/5">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield size={20} className="text-brand-neon" /> Active Connections Center
              </h2>
              
              {activeConnections.length === 0 ? (
                <p className="text-center py-8 text-text-muted text-sm font-medium">No active connections. Search above to connect to healthcare partners.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeConnections.map((conn) => (
                    <div key={conn.id} className="bg-[#1A1A2E] p-4 rounded-2xl border border-white/5 flex justify-between items-center relative overflow-hidden group">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-neon bg-brand-neon/10 px-2 py-0.5 rounded-md mb-2 inline-block">
                          {conn.role}
                        </span>
                        <h4 className="font-extrabold text-white text-sm">{conn.name}</h4>
                        <p className="text-xs text-gray-400 mt-1 font-medium">{conn.details}</p>
                      </div>
                      <button 
                        disabled={isActionLoading}
                        onClick={() => handleRevokeConnection(conn.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-status-error hover:bg-status-error/15 transition-all text-xs font-bold"
                        title="Remove Connection"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
