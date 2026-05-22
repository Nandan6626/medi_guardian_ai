import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Activity, ShieldAlert, FileText } from 'lucide-react';

export function WorkspaceHistory({ patientId: _patientId }: { patientId: string }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const historyEvents = [
    { id: 1, type: 'Alert', title: 'Missed Night Dose', date: 'Yesterday, 9:00 PM', desc: 'Patient missed the scheduled dose for Lisinopril 10mg.', color: 'red', icon: ShieldAlert },
    { id: 2, type: 'Medicine', title: 'Prescription Updated', date: 'Oct 15, 2026', desc: 'Metformin dosage increased to 1000mg by Dr. Sarah Jenkins.', color: 'purple', icon: Pill },
    { id: 3, type: 'Consultation', title: 'Video Consult Completed', date: 'Oct 10, 2026', desc: 'Routine follow-up. Blood pressure stabilizing.', color: 'blue', icon: Activity },
    { id: 4, type: 'Report', title: 'Lab Results Uploaded', date: 'Oct 01, 2026', desc: 'Comprehensive metabolic panel and lipid profile uploaded.', color: 'green', icon: FileText },
    { id: 5, type: 'Medicine', title: 'New Prescription Added', date: 'Sep 25, 2026', desc: 'Amlodipine 5mg added to morning routine.', color: 'purple', icon: Pill },
  ];

  const filteredEvents = activeFilter === 'All' 
    ? historyEvents 
    : historyEvents.filter(e => e.type === activeFilter);

  const filters = ['All', 'Medicine', 'Consultation', 'Alert', 'Report'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Medical History</h2>
          <p className="text-gray-400 text-sm">Chronological timeline of all clinical interactions.</p>
        </div>
        <div className="flex gap-2">
           {filters.map(f => (
             <button 
               key={f}
               onClick={() => setActiveFilter(f)}
               className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeFilter === f ? 'bg-white text-black' : 'bg-[#1A1A2E] text-gray-400 border border-white/5 hover:border-white/20'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/5 relative min-h-[500px]">
        <div className="absolute left-14 top-8 bottom-8 w-px bg-white/10"></div>
        
        <div className="space-y-8">
          <AnimatePresence>
            {filteredEvents.length === 0 ? (
               <div className="text-center py-20 text-gray-500">No events found for this category.</div>
            ) : (
              filteredEvents.map((event, i) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  key={event.id} 
                  className="flex gap-8 relative z-10"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-[#141423] shrink-0 flex items-center justify-center bg-[#1A1A2E]">
                    <event.icon size={18} className={
                      event.color === 'red' ? 'text-red-400' :
                      event.color === 'purple' ? 'text-brand-purple' :
                      event.color === 'blue' ? 'text-blue-400' : 'text-green-400'
                    } />
                  </div>
                  
                  <div className="flex-1 bg-[#1A1A2E] border border-white/5 p-5 rounded-2xl hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        event.color === 'red' ? 'text-red-400' :
                        event.color === 'purple' ? 'text-brand-purple' :
                        event.color === 'blue' ? 'text-blue-400' : 'text-green-400'
                      }`}>{event.type}</span>
                      <span className="text-xs text-gray-500">{event.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                    <p className="text-gray-400 text-sm">{event.desc}</p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
