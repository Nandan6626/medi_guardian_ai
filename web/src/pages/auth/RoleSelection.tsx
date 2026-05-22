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
          className="flex flex-col items-center justify-center p-8 text-center transition-all border-2 border-transparent bg-white clay-card hover:border-[var(--color-clay-violet)] group"
        >
          <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-orange-50 text-[var(--color-clay-orange)] group-hover:scale-110 transition-transform">
            <HeartPulse size={40} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">I'm a Patient</h3>
          <p className="text-sm text-gray-500">Manage my medications and stay connected with my doctor.</p>
        </motion.button>

        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/auth/register?role=doctor')}
          className="flex flex-col items-center justify-center p-8 text-center transition-all border-2 border-transparent bg-white clay-card hover:border-[var(--color-clay-violet)] group"
        >
          <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-violet-50 text-[var(--color-clay-violet)] group-hover:scale-110 transition-transform">
            <Stethoscope size={40} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">I'm a Doctor</h3>
          <p className="text-sm text-gray-500">Monitor my patients, view analytics, and issue prescriptions.</p>
        </motion.button>

      </div>
      
      <div className="mt-8 text-center">
        <button onClick={() => navigate('/auth/login')} className="font-bold text-[var(--color-clay-violet)] hover:underline">
          Back to Login
        </button>
      </div>
    </AuthLayout>
  );
}
