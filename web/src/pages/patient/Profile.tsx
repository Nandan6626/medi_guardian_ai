import { User, Activity, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <header className="mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-neon to-brand-purple mb-2">My Profile</h1>
        <p className="text-gray-400">View and manage your health identity and connections.</p>
      </header>

      <div className="space-y-8">
        {/* Main Identity Card */}
        <div className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-purple/20 blur-[100px] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-full border-4 border-brand-purple/30 bg-brand-purple/10 flex items-center justify-center shadow-[0_0_30px_rgba(112,0,255,0.2)]">
               <User size={64} className="text-brand-purple" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
               <h2 className="text-3xl font-bold text-white mb-2">{user?.name || 'Alex'}</h2>
               <p className="text-gray-400 mb-4">{user?.email || 'alex@example.com'}</p>
               
               <div className="inline-flex flex-col items-center md:items-start bg-[#1A1A2E] p-4 rounded-2xl border border-brand-neon/20">
                 <p className="text-xs text-brand-neon font-bold uppercase tracking-widest mb-1">Unique Patient ID</p>
                 <p className="font-mono text-2xl text-white tracking-wider">MG-PAT-10458</p>
               </div>
            </div>
            
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors">
              Edit Details
            </button>
          </div>
        </div>

        {/* Health Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-3xl border border-white/5">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity size={20} className="text-brand-neon" /> Basic Vitals</h3>
             <div className="space-y-4">
               <div className="flex justify-between items-center border-b border-white/5 pb-4">
                 <span className="text-gray-400">Age</span>
                 <span className="text-white font-bold">32</span>
               </div>
               <div className="flex justify-between items-center border-b border-white/5 pb-4">
                 <span className="text-gray-400">Blood Group</span>
                 <span className="text-white font-bold">O+</span>
               </div>
               <div className="flex justify-between items-center border-b border-white/5 pb-4">
                 <span className="text-gray-400">Weight</span>
                 <span className="text-white font-bold">75 kg</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-400">Height</span>
                 <span className="text-white font-bold">180 cm</span>
               </div>
             </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Shield size={20} className="text-orange-400" /> Medical Profile</h3>
             <div className="space-y-4">
               <div className="bg-[#1A1A2E] p-4 rounded-xl border border-white/5">
                 <p className="text-xs text-gray-500 uppercase font-bold mb-1">Known Allergies</p>
                 <p className="text-white font-medium">Penicillin</p>
               </div>
               <div className="bg-[#1A1A2E] p-4 rounded-xl border border-white/5">
                 <p className="text-xs text-gray-500 uppercase font-bold mb-1">Chronic Conditions</p>
                 <p className="text-white font-medium">Hypertension</p>
               </div>
               <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
                 <p className="text-xs text-orange-400 uppercase font-bold mb-1">Emergency Contact</p>
                 <p className="text-white font-medium">+1-555-0100 (Sarah - Mom)</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
