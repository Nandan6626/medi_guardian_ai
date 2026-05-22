import { Video, Calendar, Clock, Edit } from 'lucide-react';

export function WorkspaceAppointments({ patientId }: { patientId: string }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Appointments</h2>
          <p className="text-gray-400 text-sm">Manage consultations and follow-ups.</p>
        </div>
        <button className="px-6 py-2 bg-white text-black font-bold rounded-xl shadow-lg hover:bg-gray-200 transition-colors">
          + Schedule New
        </button>
      </div>

      <div>
        <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-4">Upcoming</h3>
        <div className="glass p-6 rounded-3xl border border-brand-neon/30 bg-gradient-to-r from-brand-neon/10 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-brand-neon/20 rounded-2xl flex items-center justify-center text-brand-neon shrink-0">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-brand-neon text-xs font-bold uppercase tracking-widest mb-1">Today, 14:00 PM</p>
                <h3 className="text-xl font-bold text-white">Video Consultation</h3>
                <p className="text-sm text-gray-400">Routine follow-up on recent BP spikes.</p>
              </div>
           </div>
           <div className="flex gap-3 w-full md:w-auto">
             <button className="flex-1 md:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-sm">Reschedule</button>
             <button className="flex-1 md:flex-none px-6 py-3 bg-brand-neon text-black font-bold rounded-xl hover:bg-brand-neon/80 transition-colors text-sm flex justify-center items-center gap-2">
               <Video size={18}/> Join Call
             </button>
           </div>
        </div>
      </div>

      <div>
        <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-4">Past History</h3>
        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Notes</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center gap-2"><Clock size={14} className="text-brand-purple"/> Oct 10, 2026</td>
                <td className="p-4"><span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">Video</span></td>
                <td className="p-4">Reported mild nausea. Adjusted Metformin.</td>
                <td className="p-4 text-right"><button className="text-gray-500 hover:text-white"><Edit size={16}/></button></td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center gap-2"><Clock size={14} className="text-brand-purple"/> Sep 15, 2026</td>
                <td className="p-4"><span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-bold">In-Person</span></td>
                <td className="p-4">Initial diagnostic. Prescribed Amlodipine.</td>
                <td className="p-4 text-right"><button className="text-gray-500 hover:text-white"><Edit size={16}/></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
