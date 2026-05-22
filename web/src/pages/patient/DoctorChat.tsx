import { Phone, Video, Paperclip, Send, Mic, ShieldAlert } from 'lucide-react';

export function DoctorChat() {
  return (
    <div className="flex h-screen max-w-7xl mx-auto p-4 gap-4">
      {/* Sidebar */}
      <div className="w-1/3 glass rounded-3xl border border-white/5 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-[#141423]">
          <h2 className="text-2xl font-bold text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="p-4 rounded-2xl bg-brand-purple/20 border border-brand-purple/30 cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-white">Dr. Sarah Jenkins</h4>
              <span className="text-xs text-brand-neon">10:42 AM</span>
            </div>
            <p className="text-sm text-gray-300 truncate">Your new prescription has been updated.</p>
          </div>
          <div className="p-4 rounded-2xl hover:bg-white/5 border border-transparent cursor-pointer transition-colors">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-white">Dr. Mike Ross</h4>
              <span className="text-xs text-gray-500">Yesterday</span>
            </div>
            <p className="text-sm text-gray-500 truncate">Please schedule a follow up next week.</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass rounded-3xl border border-white/5 flex flex-col overflow-hidden relative">
        <div className="p-6 border-b border-white/5 bg-[#141423] flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=drjenkins`} alt="Doctor" />
             </div>
             <div>
               <h3 className="font-bold text-white">Dr. Sarah Jenkins</h3>
               <p className="text-xs text-brand-neon flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-neon"></span> Online</p>
             </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10"><Phone size={18}/></button>
            <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10"><Video size={18}/></button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
           <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-white/10 shrink-0"></div>
             <div className="glass p-4 rounded-2xl rounded-tl-none border border-white/5 max-w-[80%]">
               <p className="text-sm text-gray-300">Hello Alex, I've updated your Metformin prescription based on your latest reports. Please make sure to take it after food.</p>
             </div>
           </div>

           <div className="flex gap-4 flex-row-reverse">
             <div className="w-8 h-8 rounded-full bg-brand-purple shrink-0"></div>
             <div className="bg-brand-purple p-4 rounded-2xl rounded-tr-none text-white max-w-[80%] shadow-[0_5px_20px_rgba(112,0,255,0.2)]">
               <p className="text-sm">Thank you doctor. Should I continue the Lisinopril at the same time?</p>
             </div>
           </div>
           
           <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-white/10 shrink-0"></div>
             <div className="glass p-4 rounded-2xl rounded-tl-none border border-white/5 max-w-[80%]">
               <p className="text-sm text-gray-300">Yes, keep the morning schedule for Lisinopril.</p>
             </div>
           </div>
        </div>

        {/* Priority Toggle */}
        <div className="px-6 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center gap-2 cursor-pointer hover:bg-red-500/20 transition-colors text-red-400">
           <ShieldAlert size={14} />
           <span className="text-xs font-bold uppercase tracking-wide">Mark as Emergency Priority</span>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#141423] border-t border-white/5 flex gap-2 items-end">
           <button className="p-3 text-gray-400 hover:text-white transition-colors shrink-0"><Paperclip size={20}/></button>
           <textarea 
             placeholder="Type a message..." 
             className="flex-1 bg-[#0F0F1A] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white resize-none outline-none focus:border-brand-purple h-[50px] min-h-[50px] max-h-[120px]"
           />
           <button className="p-3 bg-white/5 text-gray-400 hover:text-white rounded-xl transition-colors shrink-0"><Mic size={20}/></button>
           <button className="p-3 bg-brand-purple text-white rounded-xl hover:bg-brand-purple/80 glow-purple transition-colors shrink-0"><Send size={20}/></button>
        </div>
      </div>
    </div>
  );
}
