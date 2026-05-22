import { Video, Calendar, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export function Appointments() {
  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen relative">
      <header className="mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">Appointments</h1>
        <p className="text-gray-400">Manage your virtual and in-person consultations.</p>
      </header>

      {/* Upcoming */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6 text-white">Upcoming Consultations</h2>
        
        <motion.div whileHover={{ y: -5 }} className="glass p-8 rounded-3xl border border-brand-neon/30 bg-gradient-to-br from-[#1A1A2E] to-brand-purple/10 flex justify-between items-center shadow-[0_10px_40px_rgba(0,240,255,0.05)]">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 rounded-full border-2 border-brand-neon overflow-hidden shrink-0">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=drjenkins`} alt="Doctor" />
            </div>
            <div>
              <p className="text-brand-neon text-sm font-bold tracking-wider uppercase mb-1">Today • 14:00 PM</p>
              <h3 className="text-2xl font-bold text-white mb-1">Dr. Sarah Jenkins</h3>
              <p className="text-gray-400 text-sm">Cardiology • Video Consult</p>
            </div>
          </div>
          <button className="bg-brand-neon text-black font-bold px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-brand-neon/90 transition-all glow-neon shadow-lg">
             <Video size={20} />
             Join Call
          </button>
        </motion.div>
      </div>

      {/* Past */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-white">Past Visits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {[1,2,3].map((i) => (
             <div key={i} className="glass p-6 rounded-2xl border border-white/5 flex gap-4 items-center">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-gray-500">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Dr. Mike Ross</h4>
                  <p className="text-sm text-gray-400 mb-1">General Physician</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> Oct 10, 2026</p>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform">
         <Plus size={32} />
      </button>
    </div>
  );
}
