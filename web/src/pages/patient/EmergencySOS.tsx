import { PhoneCall, MapPin, ShieldAlert, Navigation } from 'lucide-react';

export function EmergencySOS() {
  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen flex flex-col">
      
      {/* Panic Button Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-12">
         <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-red-600 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
            <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-50 animate-ping" style={{ animationDuration: '3s' }}></div>
            
            <button className="relative w-64 h-64 bg-gradient-to-br from-red-500 to-red-800 rounded-full shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5),0_20px_50px_rgba(239,68,68,0.5)] border-4 border-red-400 flex flex-col items-center justify-center transform group-hover:scale-105 group-active:scale-95 transition-all duration-300">
               <ShieldAlert size={80} className="text-white mb-2" />
               <span className="text-3xl font-black text-white tracking-widest">SOS</span>
            </button>
         </div>
         <p className="text-red-400 mt-12 font-bold tracking-widest uppercase text-sm">Hold for 3 seconds to alert emergency contacts</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
         <div className="glass p-6 rounded-3xl border border-red-500/20 bg-red-500/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><PhoneCall size={18} className="text-red-400"/> Emergency Contacts</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-[#1A1A2E] p-4 rounded-2xl border border-white/5">
                 <div>
                   <p className="font-bold text-white">Sarah (Mom)</p>
                   <p className="text-sm text-gray-400">+1 (555) 911-0000</p>
                 </div>
                 <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-green-500/20 hover:text-green-400 transition-colors"><PhoneCall size={16}/></button>
               </div>
               <div className="flex justify-between items-center bg-[#1A1A2E] p-4 rounded-2xl border border-white/5">
                 <div>
                   <p className="font-bold text-white">Dr. Sarah Jenkins</p>
                   <p className="text-sm text-gray-400">Cardiologist</p>
                 </div>
                 <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-green-500/20 hover:text-green-400 transition-colors"><PhoneCall size={16}/></button>
               </div>
            </div>
         </div>

         <div className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/13/4093/2724.png')] opacity-20 grayscale bg-cover bg-center"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><MapPin size={18} className="text-brand-neon"/> Location Sharing Active</h3>
                <p className="text-sm text-gray-300">Your live location is ready to be broadcasted to your emergency network and nearby hospitals.</p>
              </div>
              <button className="w-full bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-3 rounded-xl backdrop-blur-md transition-colors flex items-center justify-center gap-2 mt-4">
                 <Navigation size={18} /> Find Nearby Hospitals
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}
