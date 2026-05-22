import { User, Bell, Shield, Smartphone } from 'lucide-react';

export function Settings() {
  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <header className="mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">Settings</h1>
        <p className="text-gray-400">Manage your profile and application preferences.</p>
      </header>

      <div className="space-y-6">
        {/* Profile */}
        <div className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple">
               <User size={32} />
             </div>
             <div>
               <h3 className="font-bold text-white text-lg">Alex (Patient)</h3>
               <p className="text-sm text-gray-400">alex@example.com</p>
             </div>
           </div>
           <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-bold">Edit Profile</button>
        </div>

        {/* Toggles */}
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
      </div>
    </div>
  );
}
