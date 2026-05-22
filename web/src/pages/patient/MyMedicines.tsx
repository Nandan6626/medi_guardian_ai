import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatedMedicineStack } from '../../components/AnimatedMedicineStack';
import api from '../../../lib/api';
import { Clock, TrendingUp, Mic, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

export function MyMedicines() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('today');

  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const res = await api.get('/medicines/');
      return res.data;
    }
  });

  const takeMedicineMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post(`/medicines/${id}/take`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">My Medicines</h1>
          <p className="text-gray-400">Manage your daily intake and active prescriptions.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-brand-purple/20 text-brand-neon px-4 py-2 rounded-xl border border-brand-purple/30 hover:bg-brand-purple/40 transition-colors">
            <Mic size={18} />
            Voice Reminder
          </button>
        </div>
      </header>

      {/* Adherence & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-3xl flex items-center gap-6 relative overflow-hidden border border-white/5 hover:border-brand-purple/30 transition-all">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-brand-neon/10 rounded-full blur-2xl"></div>
          <div className="w-20 h-20 rounded-full border-4 border-brand-purple flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-white">85%</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Adherence</h3>
            <p className="text-sm text-brand-neon">Great job! Keep it up.</p>
          </div>
        </div>
        
        <div className="glass p-6 rounded-3xl flex items-center gap-6 border border-white/5 hover:border-brand-purple/30 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">12 Day Streak</h3>
            <p className="text-sm text-gray-400">Perfect intake record.</p>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex items-center gap-6 border border-white/5 hover:border-brand-purple/30 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">4 Remaining</h3>
            <p className="text-sm text-gray-400">Medicines left today.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('today')} className={`px-6 py-2.5 rounded-full font-bold transition-all ${activeTab === 'today' ? 'bg-white text-black' : 'glass text-gray-400 hover:text-white'}`}>Today's Schedule</button>
        <button onClick={() => setActiveTab('active')} className={`px-6 py-2.5 rounded-full font-bold transition-all ${activeTab === 'active' ? 'bg-white text-black' : 'glass text-gray-400 hover:text-white'}`}>Active Prescriptions</button>
      </div>

      {/* Stacked Cards Area */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 border border-white/5 min-h-[400px]"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
             <Clock className="text-brand-neon" /> 
             {activeTab === 'today' ? 'Up Next' : 'All Prescriptions'}
          </h2>
          <span className="text-sm bg-white/10 px-3 py-1 rounded-full text-gray-300">Auto-cycling enabled</span>
        </div>

        <div className="mt-8">
           <AnimatedMedicineStack 
             medicines={medicines}
             isLoading={isLoading}
             onTakeMedicine={(id) => takeMedicineMutation.mutate(id)}
           />
        </div>
      </motion.div>
    </div>
  );
}
