import { User, Activity, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight mb-1">My profile</h1>
        <p className="text-xs text-zinc-400">Health identity and registered clinical parameters.</p>
      </header>

      <div className="space-y-6">
        {/* Main Identity Card */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
               <User size={32} />
            </div>
            
            <div className="flex-1 text-center md:text-left">
               <h2 className="text-xl font-semibold text-zinc-100 mb-0.5">{user?.name || 'Alex Patel'}</h2>
               <p className="text-xs text-zinc-400 mb-3 font-mono">{user?.email || 'alex@example.com'}</p>
               
               <div className="inline-flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
                 <span className="text-xs text-zinc-400 font-normal">Patient ID:</span>
                 <span className="font-mono text-xs text-zinc-200 font-medium">MG-PAT-10458</span>
               </div>
            </div>
            
            <button className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors">
              Edit details
            </button>
          </div>
        </div>

        {/* Health Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
             <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
               <Activity size={16} className="text-sky-400" /> Basic vitals
             </h3>
             <div className="space-y-2.5 text-xs">
               <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                 <span className="text-zinc-400">Age</span>
                 <span className="text-zinc-200 font-medium">32</span>
               </div>
               <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                 <span className="text-zinc-400">Blood group</span>
                 <span className="text-zinc-200 font-medium">O+</span>
               </div>
               <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                 <span className="text-zinc-400">Weight</span>
                 <span className="text-zinc-200 font-medium">75 kg</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-zinc-400">Height</span>
                 <span className="text-zinc-200 font-medium">180 cm</span>
               </div>
             </div>
          </div>

          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
             <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
               <Shield size={16} className="text-zinc-400" /> Medical profile
             </h3>
             <div className="space-y-2 text-xs">
               <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                 <p className="text-[11px] text-zinc-500 mb-0.5">Known allergies</p>
                 <p className="text-zinc-200 font-medium">Penicillin</p>
               </div>
               <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                 <p className="text-[11px] text-zinc-500 mb-0.5">Chronic conditions</p>
                 <p className="text-zinc-200 font-medium">Hypertension</p>
               </div>
               <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                 <p className="text-[11px] text-zinc-500 mb-0.5">Emergency contact</p>
                 <p className="text-zinc-200 font-medium">+1-555-0100 (Sarah - Mom)</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
