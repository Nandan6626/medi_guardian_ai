import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let targetEmail = email.toLowerCase().trim();
      // Developer shortcuts
      if (targetEmail === 'patient' || targetEmail === 'alex') {
        targetEmail = 'amit.patel@email.in';
      } else if (targetEmail === 'doctor' || targetEmail.includes('jenkins')) {
        targetEmail = 'dr.rajesh.kumar@apollo.in';
      } else if (targetEmail === 'family' || targetEmail === 'mom' || targetEmail.includes('sarah')) {
        targetEmail = 'suresh.patel@email.in';
      }

      // Query user role
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', targetEmail)
        .single();

      if (userError || !userRecord) {
        alert(`Account with email "${targetEmail}" is not registered in the database.`);
        return;
      }

      let id = userRecord.id;
      let name = '';
      let role: 'doctor' | 'patient' | 'family' = 'patient';

      if (userRecord.role === 'DOCTOR') {
        role = 'doctor';
        const { data: profile } = await supabase
          .from('doctor_profiles')
          .select('*')
          .eq('user_id', userRecord.id)
          .single();
        if (profile) {
          id = profile.id;
          name = `Dr. ${profile.first_name} ${profile.last_name}`;
        } else {
          name = 'Doctor';
        }
      } else if (userRecord.role === 'PATIENT') {
        role = 'patient';
        const { data: profile } = await supabase
          .from('patient_profiles')
          .select('*')
          .eq('user_id', userRecord.id)
          .single();
        if (profile) {
          id = profile.id;
          name = `${profile.first_name} ${profile.last_name}`;
        } else {
          name = 'Patient';
        }
      } else {
        role = 'family';
        const { data: profile } = await supabase
          .from('caregiver_profiles')
          .select('*')
          .eq('user_id', userRecord.id)
          .single();
        if (profile) {
          id = profile.id;
          name = `${profile.first_name} ${profile.last_name}`;
        } else {
          name = 'Caregiver';
        }
      }

      login({ id, name, email: targetEmail, role });
      navigate(`/${role}`);
    } catch (err: any) {
      console.error(err);
      alert('Login failed: ' + (err.message || 'unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your details to access your dashboard."
    >
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-semibold text-text-secondary">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted">
              <Mail size={20} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full py-4 pl-12 pr-4 text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted"
              placeholder="hello@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-text-secondary">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted">
              <Lock size={20} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-4 pl-12 pr-4 text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-brand-neon bg-bg-input border-border-subtle focus:ring-brand-neon focus:ring-offset-bg-base" />
            <span className="font-medium text-text-secondary">Remember me</span>
          </label>
          <a href="#" className="font-bold text-brand-neon hover:text-white transition-colors">Forgot password?</a>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="flex items-center justify-center w-full gap-2 py-4 font-bold transition-all rounded-xl bg-brand-neon text-black glow-neon hover:bg-white disabled:opacity-50"
        >
          {isLoading ? (
            <>Signing In... <Loader2 className="animate-spin" size={20} /></>
          ) : (
            <>Sign In <ArrowRight size={20} /></>
          )}
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-sm text-text-muted bg-bg-base font-medium">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="py-3 font-semibold bg-bg-surface border border-border-subtle text-white rounded-xl hover:bg-white/5 transition-colors flex justify-center items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Google
          </button>
          <button type="button" className="py-3 font-semibold bg-bg-surface border border-border-subtle text-white rounded-xl hover:bg-white/5 transition-colors flex justify-center items-center gap-2">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.67 2.15-3.18 1.84-2.66 5.86.35 7.21-.69 1.6-1.57 3.01-2.67 3.65zm-3.8-12.75c-.32-1.89 1.25-3.66 3.14-3.92.35 2.12-1.55 3.8-3.14 3.92z"/></svg>
            Apple
          </button>
        </div>

        <p className="text-sm text-center text-text-secondary">
          Don't have an account? <Link to="/auth/role" className="font-bold text-brand-neon hover:text-white transition-colors">Sign up for free</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
