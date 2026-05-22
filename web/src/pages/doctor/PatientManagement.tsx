import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Filter, AlertTriangle, ArrowRight, X, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PatientManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['doctor_patients'],
    queryFn: async () => {
      const res = await api.get('/doctor/patients');
      return res.data;
    }
  });

  const filters = ['All', 'Critical', 'Stable'];

  const filteredPatients = patients.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          `MG-PAT-${10450 + p.id}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || p.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdInput) return;
    alert(`Connection request sent to ${patientIdInput}! Waiting for patient approval.`);
    setIsConnectModalOpen(false);
    setPatientIdInput('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-neon to-brand-purple mb-2">Patient Management</h1>
          <p className="text-gray-400">Manage and monitor your connected patients in real-time.</p>
        </div>
        <button 
          onClick={() => setIsConnectModalOpen(true)}
          className="px-6 py-2 bg-brand-purple text-white font-bold rounded-xl shadow-[0_0_15px_rgba(112,0,255,0.3)] hover:bg-brand-purple/80 transition-colors"
        >
          + Add New Patient
        </button>
      </header>

      {/* Controls */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search patients by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1A1A2E] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-neon transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeFilter === f ? 'bg-white text-black' : 'bg-[#1A1A2E] text-gray-400 border border-white/5 hover:border-white/20'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading patients...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No patients found matching your criteria.</div>
        ) : (
          filteredPatients.map((p: any) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={p.id}
              onClick={() => navigate(`/doctor/patients/${p.id}`)}
              className="glass p-6 rounded-3xl border border-white/5 hover:border-brand-neon/30 transition-all cursor-pointer group relative overflow-hidden"
            >
              {p.status === 'Critical' && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/20 blur-xl rounded-full"></div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-brand-purple/30 bg-[#1A1A2E] overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt="Avatar" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg group-hover:text-brand-neon transition-colors">{p.name}</h3>
                    <p className="text-xs text-gray-400 font-mono tracking-widest">MG-PAT-{10450 + p.id}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${p.status === 'Critical' ? 'bg-red-500 text-red-500' : 'bg-green-500 text-green-500'}`}></div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                  <span className="text-gray-400">Condition</span>
                  <span className="text-white font-medium truncate max-w-[120px]">Hypertension</span>
                </div>
                <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                  <span className="text-gray-400">Adherence</span>
                  <span className="text-brand-neon font-bold">85%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Last Active</span>
                  <span className="text-white font-medium">2 hours ago</span>
                </div>
              </div>

              {p.status === 'Critical' && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-2 items-center text-red-400 text-xs font-bold">
                  <AlertTriangle size={14} /> Needs attention (Missed Dose)
                </div>
              )}

              <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors flex items-center justify-center gap-2 text-sm">
                Open Workspace <ArrowRight size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Connect Patient Modal */}
      <AnimatePresence>
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-8 rounded-3xl border border-white/10 w-full max-w-md relative"
            >
              <button 
                onClick={() => setIsConnectModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-brand-purple/20 rounded-full flex items-center justify-center text-brand-purple mb-6">
                <UserPlus size={32} />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Connect Patient</h2>
              <p className="text-gray-400 text-sm mb-6">Enter the patient's unique MG-PAT ID to send a monitoring request.</p>

              <form onSubmit={handleConnect}>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Patient ID</label>
                <input 
                  type="text" 
                  required
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value.toUpperCase())}
                  placeholder="e.g. MG-PAT-10458" 
                  className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none mb-6 font-mono tracking-wider"
                />

                <button type="submit" className="w-full py-4 bg-brand-purple text-white font-bold rounded-xl glow-purple hover:bg-brand-purple/80 transition-all flex items-center justify-center gap-2">
                  Send Request
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
