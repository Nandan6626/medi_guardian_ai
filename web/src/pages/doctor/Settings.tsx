import { User, Bell, Shield, CalendarClock } from 'lucide-react';

export function Settings() {
  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <header className="mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">Operational Settings</h1>
        <p className="text-gray-400">Manage your professional profile and global availability preferences.</p>
      </header>

      <div className="space-y-6">
        {/* Profile */}
        <div className="glass p-8 rounded-3xl border border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-6">
             <div className="w-20 h-20 rounded-full border-2 border-brand-purple flex items-center justify-center text-brand-purple bg-[#1A1A2E]">
               <User size={36} />
             </div>
             <div>
               <h3 className="font-bold text-white text-2xl">Dr. Sarah Jenkins</h3>
               <p className="text-brand-purple font-bold">Cardiologist • City General Hospital</p>
               <p className="text-sm text-gray-400 mt-1">sarah.jenkins@hospital.com</p>
             </div>
           </div>
           <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-bold">Edit Profile</button>
        </div>

        {/* Global Configuration */}
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-8">
           
           <div className="flex justify-between items-center">
             <div className="flex gap-4">
               <div className="mt-1 text-brand-neon"><CalendarClock size={24}/></div>
               <div>
                 <h4 className="font-bold text-white text-lg">Consultation Availability</h4>
                 <p className="text-sm text-gray-400">Allow patients to request video consults during working hours.</p>
               </div>
             </div>
             <div className="w-12 h-6 bg-brand-neon rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.3)]">
               <div className="absolute right-1 top-1 bottom-1 w-4 bg-[#141423] rounded-full"></div>
             </div>
           </div>

           <div className="w-full h-px bg-white/5"></div>

           <div className="flex justify-between items-center">
             <div className="flex gap-4">
               <div className="mt-1 text-red-400"><Shield size={24}/></div>
               <div>
                 <h4 className="font-bold text-white text-lg">Emergency Pager</h4>
                 <p className="text-sm text-gray-400">Receive SMS notifications immediately when an SOS is triggered.</p>
               </div>
             </div>
             <div className="w-12 h-6 bg-red-500 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.3)]">
               <div className="absolute right-1 top-1 bottom-1 w-4 bg-[#141423] rounded-full"></div>
             </div>
           </div>

           <div className="w-full h-px bg-white/5"></div>

           <div className="flex justify-between items-center">
             <div className="flex gap-4">
               <div className="mt-1 text-gray-400"><Bell size={24}/></div>
               <div>
                 <h4 className="font-bold text-white text-lg">Push Notifications</h4>
                 <p className="text-sm text-gray-400">Standard notifications for reports and requests.</p>
               </div>
             </div>
             <div className="w-12 h-6 bg-gray-600 rounded-full relative cursor-pointer">
               <div className="absolute left-1 top-1 bottom-1 w-4 bg-white rounded-full"></div>
             </div>
           </div>

        </div>

        <button className="w-full py-4 bg-brand-purple text-white font-bold rounded-xl glow-purple hover:bg-brand-purple/80 transition-all">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
