import { useAuthStore } from '../store/useAuthStore'
import { Activity, ShieldAlert, HeartPulse, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function PatientDashboard() {
  const { user } = useAuthStore()

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex justify-between items-end mb-12">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2"
          >
            Welcome back, {user?.name?.split(' ')[0] || 'Alex'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-neon text-lg"
          >
            Your AI healthcare assistant is monitoring your vitals.
          </motion.p>
        </div>
        <Link to="/patient/emergency" className="hidden md:flex items-center gap-2 bg-red-500/10 text-red-400 px-6 py-3 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all font-bold group">
          <HeartPulse size={20} className="group-hover:animate-ping" />
          Emergency SOS
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Action Banner */}
        <Link to="/patient/medicines" className="md:col-span-8 glass p-8 rounded-3xl border border-brand-purple/30 bg-gradient-to-br from-[#141423] to-brand-purple/10 group relative overflow-hidden">
           <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-purple/20 blur-[80px] group-hover:bg-brand-purple/40 transition-colors"></div>
           <div className="relative z-10">
             <h2 className="text-3xl font-bold text-white mb-2">My Medicines</h2>
             <p className="text-gray-400 mb-8 max-w-md">You have 4 medicines scheduled for today. View your stacked timeline to mark them as taken.</p>
             <div className="inline-flex items-center gap-2 text-brand-neon font-bold group-hover:translate-x-2 transition-transform">
                Open Scheduler <ArrowRight size={18} />
             </div>
           </div>
        </Link>

        {/* AI Health Score */}
        <Link to="/patient/reports" className="md:col-span-4 glass p-8 rounded-3xl border border-brand-neon/20 bg-brand-neon/5 flex flex-col justify-center items-center text-center group hover:border-brand-neon/40 transition-all shadow-[0_0_30px_rgba(0,240,255,0.05)]">
           <Activity size={40} className="text-brand-neon mb-4" />
           <h3 className="text-4xl font-bold text-white mb-1">92</h3>
           <p className="text-sm font-bold text-brand-neon uppercase tracking-widest">AI Health Score</p>
        </Link>

        {/* AI Verification Quick Link */}
        <Link to="/patient/verify" className="md:col-span-6 glass p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
           <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-6">
             <ShieldAlert size={24} />
           </div>
           <h3 className="text-2xl font-bold text-white mb-2">AI Verification</h3>
           <p className="text-gray-400 mb-6">Scan new prescriptions for drug interactions and safety checks.</p>
           <div className="flex items-center gap-2 text-orange-400 font-bold group-hover:translate-x-2 transition-transform">
              Scan Now <ArrowRight size={18} />
           </div>
        </Link>

        {/* Appointments Quick Link */}
        <Link to="/patient/appointments" className="md:col-span-6 glass p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
           <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
             <Activity size={24} />
           </div>
           <h3 className="text-2xl font-bold text-white mb-2">Upcoming Consults</h3>
           <p className="text-gray-400 mb-6">You have a video consultation with Dr. Jenkins today at 14:00 PM.</p>
           <div className="flex items-center gap-2 text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
              View Details <ArrowRight size={18} />
           </div>
        </Link>
      </div>
    </div>
  )
}
