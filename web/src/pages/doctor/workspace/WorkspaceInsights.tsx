import { Brain, AlertTriangle, Lightbulb, TrendingDown, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export function WorkspaceInsights({ patientId: _patientId }: { patientId: string }) {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <Brain className="text-brand-purple" /> AI Fleet Insights
        </h2>
        <p className="text-gray-400 text-sm">Predictive modeling and risk analysis for this patient.</p>
      </header>

      {/* Main Risk Alert */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-500/10 to-transparent flex items-start gap-6"
      >
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
          <AlertTriangle size={32} />
        </div>
        <div>
          <div className="inline-block px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider rounded-lg mb-2">High Risk Alert</div>
          <h3 className="text-xl font-bold text-white mb-2">Repeated Evening Non-Adherence</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            The predictive model detects an 85% probability that the patient will continue missing the 9:00 PM Lisinopril dose. This pattern strongly correlates with the recent BP spikes observed on weekends.
          </p>
          <div className="bg-[#1A1A2E] border border-white/5 p-4 rounded-xl flex gap-3">
             <Lightbulb className="text-brand-neon shrink-0 mt-0.5" size={18}/>
             <div>
               <p className="text-white font-bold text-sm mb-1">AI Recommendation</p>
               <p className="text-sm text-gray-400">Shift dosage to morning routine or enable mandatory Caregiver Voice Notifications via settings.</p>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <div className="glass p-6 rounded-3xl border border-white/5">
           <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-6 flex items-center gap-2">
             <TrendingDown size={14} className="text-brand-neon"/> Health Trajectory
           </h3>
           <div className="space-y-4">
              <div>
                 <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Adherence Stability</span>
                    <span className="text-yellow-400 font-bold">Dropping</span>
                 </div>
                 <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full w-[60%] rounded-full"></div>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Vitals Volatility</span>
                    <span className="text-green-400 font-bold">Stable</span>
                 </div>
                 <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-400 h-full w-[85%] rounded-full"></div>
                 </div>
              </div>
           </div>
        </div>

        {/* Interaction Warnings */}
        <div className="glass p-6 rounded-3xl border border-white/5">
           <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-6 flex items-center gap-2">
             <ShieldAlert size={14} className="text-orange-400"/> Known Conflicts
           </h3>
           <div className="bg-[#1A1A2E] p-4 rounded-xl border border-orange-500/20 text-orange-400">
             <p className="font-bold text-sm mb-1">Allergy Conflict: Penicillin</p>
             <p className="text-xs">Patient has a logged severe allergy. The AI prescribing assistant will automatically block prescriptions from this family.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
