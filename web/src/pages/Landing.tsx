import { motion } from 'framer-motion'
import { Activity, Brain, ShieldAlert, User, Stethoscope, HeartPulse } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass-panel border border-brand-neon/30 text-brand-neon bg-brand-neon/5">
          <Brain size={18} />
          <span className="text-sm font-semibold tracking-wide uppercase">Next-Gen AI Healthcare</span>
        </div>
        
        <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-brand-neon">
          MediGuardian AI
        </h1>
        
        <p className="max-w-2xl mx-auto mb-12 text-xl text-text-secondary md:text-2xl">
          AI-Powered Smart Medication & Preventive Healthcare Ecosystem. Empowering doctors, protecting patients.
        </p>

        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Link to="/patient" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-full gap-3 px-8 py-4 text-lg font-bold text-black transition-all rounded-xl bg-brand-neon glow-neon hover:bg-white"
            >
              <User size={24} />
              Patient Portal
            </motion.button>
          </Link>
          
          <Link to="/doctor" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-full gap-3 px-8 py-4 text-lg font-bold transition-all border rounded-xl glass-panel text-brand-purple border-brand-purple glow-purple hover:bg-brand-purple hover:text-white"
            >
              <Stethoscope size={24} />
              Doctor Portal
            </motion.button>
          </Link>

          <Link to="/family" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-full gap-3 px-8 py-4 text-lg font-bold text-white transition-all border rounded-xl glass-panel border-white/20 hover:bg-white hover:text-black"
            >
              <HeartPulse size={24} />
              Family Portal
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Feature Grid Skeleton */}
      <div className="grid max-w-6xl grid-cols-1 gap-8 mt-32 md:grid-cols-3">
        {[
          { icon: ShieldAlert, title: 'Realtime Adherence', desc: 'Never miss a dose with AI-driven smart alerts and automated doctor escalation.' },
          { icon: Brain, title: 'AI Health Insights', desc: 'Predictive analytics on patient vitals and medication efficacy.' },
          { icon: Activity, title: 'Remote Monitoring', desc: 'Live dashboards for healthcare professionals to track high-risk patients.' },
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            className="p-8 text-left transition-all rounded-3xl glass-panel border border-border-subtle hover:border-brand-neon/50"
          >
            <feature.icon className="mb-6 text-brand-neon" size={40} />
            <h3 className="mb-3 text-2xl font-bold text-white">{feature.title}</h3>
            <p className="text-text-secondary">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
