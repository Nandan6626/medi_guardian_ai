import { useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Stethoscope, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

export function RoleSelection() {
  const navigate = useNavigate();

  return (
    <AuthLayout 
      title="Join MediGuardian" 
      subtitle="How will you be using the platform today?"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        
        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/auth/register?role=patient')}
          className="flex flex-col items-center justify-center p-8 text-center transition-all bg-bg-surface border border-border-subtle rounded-3xl hover:border-brand-neon/50 group"
        >
          <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-brand-neon/10 text-brand-neon group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <HeartPulse size={40} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">I'm a Patient</h3>
          <p className="text-sm text-text-secondary">Manage my medications and stay connected with my doctor.</p>
        </motion.button>

        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/auth/register?role=doctor')}
          className="flex flex-col items-center justify-center p-8 text-center transition-all bg-bg-surface border border-border-subtle rounded-3xl hover:border-brand-purple/50 group"
        >
          <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-brand-purple/10 text-brand-purple group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(112,0,255,0.2)]">
            <Stethoscope size={40} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">I'm a Doctor</h3>
          <p className="text-sm text-text-secondary">Monitor my patients, view analytics, and issue prescriptions.</p>
        </motion.button>

      </div>
      
      <div className="mt-8 text-center">
        <button onClick={() => navigate('/auth/login')} className="font-bold text-brand-neon hover:text-white transition-colors">
          Back to Login
        </button>
      </div>
    </AuthLayout>
  );
}
