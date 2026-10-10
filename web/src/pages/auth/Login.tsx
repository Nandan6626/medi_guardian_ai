import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Mail, Lock, ArrowRight, Loader2, Stethoscope, HeartPulse, Users, Sparkles, Check, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { DEMO_ACCOUNTS, findDemoAccount, type DemoAccount } from '../../lib/demoAuth';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'info' | 'success' } | null>(null);

  // Quick auto-fill handler for testing credentials normally
  const handleAutoFill = (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setStatusMessage({
      text: `Populated ${acc.title} credentials. You can now test the standard "Sign In" button!`,
      type: 'info'
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Instant 1-click demo login bypassing manual form typing
  const handleDirectDemoLogin = (acc: DemoAccount) => {
    setIsLoading(true);
    setStatusMessage({ text: `Logging in as ${acc.title}...`, type: 'success' });
    setTimeout(() => {
      login({
        id: acc.id,
        name: acc.name,
        email: acc.email,
        role: acc.role
      });
      navigate(acc.route);
    }, 400);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    
    try {
      const rawInput = email.toLowerCase().trim();
      const demoMatch = findDemoAccount(rawInput);
      let targetEmail = demoMatch ? demoMatch.email : rawInput;

      // Try querying Supabase first
      let userRecord: any = null;
      let userError: any = null;

      try {
        const res = await supabase
          .from('users')
          .select('*')
          .eq('email', targetEmail)
          .single();
        userRecord = res.data;
        userError = res.error;
      } catch (err) {
        console.warn('Supabase query error, fallback to demo/local auth mode:', err);
      }

      // If user is not found in remote DB or Supabase threw an error, check demo accounts
      if (userError || !userRecord) {
        if (demoMatch) {
          console.info(`Demo login activated for ${demoMatch.title}`);
          login({
            id: demoMatch.id,
            name: demoMatch.name,
            email: demoMatch.email,
            role: demoMatch.role
          });
          navigate(demoMatch.route);
          return;
        }

        // Also check default quick shortcuts
        if (rawInput === 'patient' || rawInput === 'alex') {
          const acc = DEMO_ACCOUNTS.find(a => a.role === 'patient')!;
          login({ id: acc.id, name: acc.name, email: acc.email, role: acc.role });
          navigate(acc.route);
          return;
        } else if (rawInput === 'doctor' || rawInput.includes('rajesh') || rawInput.includes('jenkins')) {
          const acc = DEMO_ACCOUNTS.find(a => a.role === 'doctor')!;
          login({ id: acc.id, name: acc.name, email: acc.email, role: acc.role });
          navigate(acc.route);
          return;
        } else if (rawInput === 'family' || rawInput.includes('caregiver') || rawInput.includes('suresh')) {
          const acc = DEMO_ACCOUNTS.find(a => a.role === 'family')!;
          login({ id: acc.id, name: acc.name, email: acc.email, role: acc.role });
          navigate(acc.route);
          return;
        }

        // If arbitrary test email is used (e.g. for testing)
        if (rawInput.includes('@')) {
          const fallbackRole = rawInput.includes('doc') ? 'doctor' : rawInput.includes('fam') ? 'family' : 'patient';
          login({
            id: crypto.randomUUID(),
            name: rawInput.split('@')[0],
            email: rawInput,
            role: fallbackRole as any
          });
          navigate(`/${fallbackRole}`);
          return;
        }

        alert(`Account "${targetEmail}" was not found. Please click one of the Demo Account buttons below for instant access.`);
        return;
      }

      // Online database record was found!
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
      // Fallback gracefully to demo patient if unexpected error occurs
      const acc = DEMO_ACCOUNTS.find(a => a.role === 'patient')!;
      login({ id: acc.id, name: acc.name, email: acc.email, role: acc.role });
      navigate(acc.route);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome to MediGuardian" 
      subtitle="Sign in to your account or launch an instant demo portal."
    >
      {/* Demo Portals Showcase Card */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-brand-purple/20 via-bg-surface to-brand-neon/10 border border-brand-neon/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-neon animate-pulse" size={18} />
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-neon">Demo Mode • Instant Access</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-neon/20 text-brand-neon font-semibold">1-Click Demo</span>
        </div>
        <p className="text-xs text-text-secondary mb-3">
          Select any role below to autofill demo credentials or log in instantly without typing:
        </p>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {DEMO_ACCOUNTS.map((acc) => {
            const isDoctor = acc.role === 'doctor';
            const isPatient = acc.role === 'patient';
            const Icon = isDoctor ? Stethoscope : isPatient ? HeartPulse : Users;
            const accentClass = isDoctor ? 'border-brand-purple/40 hover:border-brand-purple' : isPatient ? 'border-brand-neon/40 hover:border-brand-neon' : 'border-emerald-500/40 hover:border-emerald-500';
            const textAccent = isDoctor ? 'text-brand-purple' : isPatient ? 'text-brand-neon' : 'text-emerald-400';

            return (
              <div 
                key={acc.role}
                className={`p-3 rounded-xl bg-bg-base/80 border ${accentClass} flex flex-col justify-between transition-all hover:bg-bg-surface group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Icon size={16} className={textAccent} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${textAccent}`}>
                      {acc.badge.replace(' Portal', '')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{acc.name}</h4>
                  <p className="text-[10px] text-text-muted truncate font-mono">{acc.email}</p>
                </div>

                <div className="mt-3 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDirectDemoLogin(acc)}
                    disabled={isLoading}
                    className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold text-black transition-all flex items-center justify-center gap-1 shadow-sm ${
                      isDoctor ? 'bg-brand-purple text-white hover:bg-brand-purple/80' : isPatient ? 'bg-brand-neon text-black hover:bg-white' : 'bg-emerald-400 text-black hover:bg-emerald-300'
                    }`}
                  >
                    <span>Instant Login</span>
                    <ArrowRight size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoFill(acc)}
                    className="w-full py-1 px-2 rounded-lg text-[10px] font-medium text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                  >
                    <KeyRound size={10} />
                    <span>Auto-Fill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div className="mb-4 p-3 rounded-xl bg-brand-neon/10 border border-brand-neon/30 text-xs text-brand-neon flex items-center gap-2 animate-in fade-in">
          <Check size={16} className="shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block mb-2 text-sm font-semibold text-text-secondary">Email Address / Demo Username</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted">
              <Mail size={18} />
            </div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full py-3.5 pl-11 pr-4 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted font-sans"
              placeholder="e.g. amit.patel@email.in or 'patient'"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-text-secondary">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-3.5 pl-11 pr-4 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand-neon bg-bg-input border-border-subtle focus:ring-brand-neon focus:ring-offset-bg-base" />
            <span className="font-medium text-text-secondary">Remember me</span>
          </label>
          <button 
            type="button" 
            onClick={() => handleAutoFill(DEMO_ACCOUNTS[1])}
            className="font-bold text-brand-neon hover:text-white transition-colors"
          >
            Fill Demo Patient
          </button>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="flex items-center justify-center w-full gap-2 py-3.5 font-bold transition-all rounded-xl bg-brand-neon text-black glow-neon hover:bg-white disabled:opacity-50 text-sm sm:text-base"
        >
          {isLoading ? (
            <>Signing In... <Loader2 className="animate-spin" size={18} /></>
          ) : (
            <>Sign In Normally <ArrowRight size={18} /></>
          )}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-xs text-text-muted bg-bg-base font-medium">Or create new account</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/auth/role" className="font-bold text-brand-neon hover:text-white transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
