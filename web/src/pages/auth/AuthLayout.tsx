import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen theme-light font-sans bg-[var(--color-clay-bg)] text-gray-900">
      
      {/* Left Panel: Authentication Form */}
      <div className="flex flex-col justify-center flex-1 px-8 py-12 sm:px-16 lg:px-24">
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-12">
              <div className="flex items-center justify-center w-10 h-10 text-white rounded-xl bg-gradient-to-br from-violet-500 to-orange-400 glow-purple">
                <span className="font-bold">M</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight">MediGuardian</span>
            </div>

            <h1 className="mb-2 text-3xl font-extrabold text-gray-900 md:text-4xl">{title}</h1>
            <p className="mb-8 text-gray-500">{subtitle}</p>

            {children}
          </motion.div>
        </div>
      </div>

      {/* Right Panel: Premium Illustration (Hidden on mobile) */}
      <div className="relative flex-col items-center justify-center hidden w-1/2 p-12 lg:flex bg-gradient-to-br from-violet-100 to-orange-50">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,rgba(108,74,182,0.1)_0%,transparent_100%)]"></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 w-full max-w-lg"
        >
          <img 
            src="/auth-illustration.png" 
            alt="Healthcare 3D Illustration" 
            className="w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 max-w-md mt-12 text-center"
        >
          <h2 className="mb-4 text-2xl font-bold text-gray-800">The Future of Care</h2>
          <p className="text-gray-600">Join the smart healthcare ecosystem that empowers doctors and protects patients through AI.</p>
        </motion.div>
      </div>

    </div>
  );
}
