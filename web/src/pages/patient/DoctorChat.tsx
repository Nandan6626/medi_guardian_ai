import { Phone, Video, Paperclip, Send, Mic, ShieldAlert } from 'lucide-react';

export function DoctorChat() {
  return (
    <div className="flex h-screen max-w-7xl mx-auto p-4 gap-4">
      {/* Sidebar */}
      <div className="w-1/3 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-100">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer">
            <div className="flex justify-between items-start mb-0.5">
              <h4 className="font-medium text-xs text-zinc-100">Dr. Sarah Jenkins</h4>
              <span className="text-[10px] text-zinc-500 font-mono">10:42 AM</span>
            </div>
            <p className="text-xs text-zinc-400 truncate">Your new prescription has been updated.</p>
          </div>
          <div className="p-3 rounded-lg hover:bg-zinc-900/60 border border-transparent cursor-pointer transition-colors">
            <div className="flex justify-between items-start mb-0.5">
              <h4 className="font-medium text-xs text-zinc-300">Dr. Mike Ross</h4>
              <span className="text-[10px] text-zinc-500 font-mono">Yesterday</span>
            </div>
            <p className="text-xs text-zinc-500 truncate">Please schedule a follow up next week.</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-full border border-zinc-700 overflow-hidden bg-zinc-800">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=drjenkins`} alt="Doctor" />
             </div>
             <div>
               <h3 className="text-sm font-semibold text-zinc-100">Dr. Sarah Jenkins</h3>
               <p className="text-xs text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online</p>
             </div>
          </div>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-lg bg-zinc-850 border border-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-800"><Phone size={14}/></button>
            <button className="w-8 h-8 rounded-lg bg-zinc-850 border border-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-800"><Video size={14}/></button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           <div className="flex gap-3">
             <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 shrink-0"></div>
             <div className="bg-zinc-900 p-3.5 rounded-lg rounded-tl-none border border-zinc-800 max-w-[80%]">
               <p className="text-xs text-zinc-300 leading-relaxed font-normal">Hello Alex, I've updated your Metformin prescription based on your latest reports. Please make sure to take it after food.</p>
             </div>
           </div>

           <div className="flex gap-3 flex-row-reverse">
             <div className="w-7 h-7 rounded-full bg-sky-700 shrink-0"></div>
             <div className="bg-sky-700 p-3.5 rounded-lg rounded-tr-none text-white max-w-[80%]">
               <p className="text-xs leading-relaxed font-normal">Thank you doctor. Should I continue the Lisinopril at the same time?</p>
             </div>
           </div>
           
           <div className="flex gap-3">
             <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 shrink-0"></div>
             <div className="bg-zinc-900 p-3.5 rounded-lg rounded-tl-none border border-zinc-800 max-w-[80%]">
               <p className="text-xs text-zinc-300 leading-relaxed font-normal">Yes, keep the morning schedule for Lisinopril.</p>
             </div>
           </div>
        </div>

        {/* Priority Toggle */}
        <div className="px-4 py-2 bg-red-950/20 border-t border-red-900/30 flex items-center gap-2 cursor-pointer hover:bg-red-950/40 transition-colors text-red-400">
           <ShieldAlert size={14} />
           <span className="text-xs font-normal">Mark as emergency priority</span>
        </div>

        {/* Input Area */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2 items-center">
           <button className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"><Paperclip size={16}/></button>
           <input 
             placeholder="Type a message" 
             className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-sky-500 placeholder:text-zinc-600"
           />
           <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors shrink-0"><Mic size={16}/></button>
           <button className="p-2 bg-sky-700 text-white rounded-lg hover:bg-sky-500 transition-colors shrink-0"><Send size={16}/></button>
        </div>
      </div>
    </div>
  );
}
