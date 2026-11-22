import { useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Stethoscope, User, ArrowRight } from 'lucide-react';

export function RoleSelection() {
  const navigate = useNavigate();

  return (
    <AuthLayout 
      title="Create account" 
      subtitle="Select the type of account you want to create."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={() => navigate('/auth/register?role=patient')}
          className="flex flex-col items-center justify-center p-6 text-center transition-colors bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-850"
        >
          <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-zinc-800 text-sky-400">
            <User size={24} />
          </div>
          <h3 className="mb-1 text-base font-semibold text-zinc-100">Patient</h3>
          <p className="text-xs text-zinc-400 font-normal leading-relaxed">
            Manage medication schedules, confirm doses, and share vitals.
          </p>
        </button>

        <button
          onClick={() => navigate('/auth/register?role=doctor')}
          className="flex flex-col items-center justify-center p-6 text-center transition-colors bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-850"
        >
          <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-zinc-800 text-zinc-300">
            <Stethoscope size={24} />
          </div>
          <h3 className="mb-1 text-base font-semibold text-zinc-100">Doctor</h3>
          <p className="text-xs text-zinc-400 font-normal leading-relaxed">
            Monitor patient adherence, review trends, and issue prescriptions.
          </p>
        </button>
      </div>

      {/* Quick Demo Access banner */}
      <div className="mt-6 p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-200">Evaluating or testing</p>
          <p className="text-xs text-zinc-400">Pre-configured demo accounts are available.</p>
        </div>
        <button
          onClick={() => navigate('/auth/login')}
          className="py-1.5 px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1 shrink-0"
        >
          <span>Demo login</span>
          <ArrowRight size={12} />
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <button 
          onClick={() => navigate('/auth/login')} 
          className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Already have an account? Sign in
        </button>
      </div>
    </AuthLayout>
  );
}
