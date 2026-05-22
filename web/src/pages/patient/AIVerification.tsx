import { motion } from 'framer-motion';
import { Scan, ShieldAlert, AlertTriangle, FileText, UploadCloud, Info } from 'lucide-react';

export function AIVerification() {
  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-neon to-brand-purple mb-2">AI Verification</h1>
        <p className="text-gray-400">Scan prescriptions and check medicine safety with AI.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Area */}
        <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col justify-center items-center relative overflow-hidden min-h-[500px] group cursor-pointer hover:border-brand-neon/30 transition-all">
          <div className="absolute inset-0 bg-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 rounded-full bg-brand-neon/10 text-brand-neon flex items-center justify-center mx-auto mb-6 relative">
               <Scan size={40} />
               <motion.div 
                 animate={{ y: [-30, 30, -30] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="absolute w-20 h-0.5 bg-brand-neon shadow-[0_0_10px_#00F0FF] rounded-full"
               />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Upload or Scan</h3>
            <p className="text-gray-400 max-w-xs mx-auto mb-6">Take a photo of your medicine strip, bottle, or prescription to verify safety.</p>
            <button className="px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 mx-auto hover:bg-gray-200 transition-colors">
              <UploadCloud size={20} />
              Choose File
            </button>
          </div>
        </div>

        {/* Results Mockup */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/5">
            <h3 className="font-bold text-gray-400 mb-4 uppercase tracking-wider text-sm">Last Scan Result</h3>
            <div className="flex gap-4 mb-6">
              <div className="w-20 h-20 bg-[#1A1A2E] rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                <FileText size={32} className="text-gray-500" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-1">Metformin 500mg</h4>
                <p className="text-sm text-green-400 flex items-center gap-1 font-bold mb-2"><ShieldAlert size={14} /> Verified Genuine</p>
                <p className="text-xs text-gray-400">Exp: 12/2026</p>
              </div>
            </div>

            {/* AI Warning */}
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex gap-3 items-start">
              <AlertTriangle className="shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold mb-1 text-sm">Drug Interaction Alert</p>
                <p className="text-xs leading-relaxed">This medicine may interact with your active prescription of <strong>Aspirin</strong>. Please consult your doctor before taking them simultaneously.</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5">
             <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Info size={18} className="text-brand-purple" /> AI Explanation</h3>
             <p className="text-sm text-gray-400 leading-relaxed">
               Metformin is used with a proper diet and exercise program to control high blood sugar. It is used in patients with type 2 diabetes. Controlling high blood sugar helps prevent kidney damage, blindness, nerve problems, loss of limbs, and sexual function problems.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
