import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen font-sans bg-bg-base text-white">
      
      {/* Left Panel: Authentication Form */}
      <div className="flex flex-col justify-center flex-1 px-8 py-12 sm:px-16 lg:px-24">
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-12">
              <div className="flex items-center justify-center w-10 h-10 text-black rounded-xl bg-brand-neon glow-neon shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <span className="font-extrabold text-xl">M</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight">MediGuardian</span>
            </div>

            <h1 className="mb-2 text-3xl font-extrabold text-white md:text-4xl">{title}</h1>
            <p className="mb-8 text-text-secondary font-medium">{subtitle}</p>

            {children}
          </motion.div>
        </div>
      </div>

      {/* Right Panel: Premium Illustration (Hidden on mobile) */}
      <div className="relative flex-col items-center justify-center hidden w-1/2 p-12 lg:flex bg-bg-secondary border-l border-border-subtle overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.3)_0%,transparent_70%)]"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(112,0,255,0.4)_0%,transparent_60%)]"></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 w-full max-w-lg"
        >
          <img 
            src="/auth-illustration.png" 
            alt="Healthcare 3D Illustration" 
            className="w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out opacity-80"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 max-w-md mt-12 text-center p-8 glass-panel rounded-3xl border border-border-subtle"
        >
          <h2 className="mb-4 text-2xl font-bold text-white">The Future of Care</h2>
          <p className="text-text-secondary leading-relaxed">Join the smart healthcare ecosystem that empowers doctors and protects patients through AI.</p>
        </motion.div>
      </div>

    </div>
  );
}
