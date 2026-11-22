import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Mail, Lock, ArrowRight, Loader2, Stethoscope, User, Users, Check, KeyRound } from 'lucide-react';
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

  const handleAutoFill = (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setStatusMessage({
      text: `Populated ${acc.title} credentials.`,
      type: 'info'
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleDirectDemoLogin = (acc: DemoAccount) => {
    setIsLoading(true);
    setStatusMessage({ text: `Signing in as ${acc.title}...`, type: 'success' });
    setTimeout(() => {
      login({
        id: acc.id,
        name: acc.name,
        email: acc.email,
        role: acc.role
      });
      navigate(acc.route);
    }, 300);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    
    try {
      const rawInput = email.toLowerCase().trim();
      const demoMatch = findDemoAccount(rawInput);
      let targetEmail = demoMatch ? demoMatch.email : rawInput;

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

      if (userError || !userRecord) {
        if (demoMatch) {
          login({
            id: demoMatch.id,
            name: demoMatch.name,
            email: demoMatch.email,
            role: demoMatch.role
          });
          navigate(demoMatch.route);
          return;
        }

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

        alert(`Account "${targetEmail}" was not found. Please click one of the demo account options.`);
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
      const acc = DEMO_ACCOUNTS.find(a => a.role === 'patient')!;
      login({ id: acc.id, name: acc.name, email: acc.email, role: acc.role });
      navigate(acc.route);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Sign in" 
      subtitle="Sign in to your account or choose a demo profile."
    >
      {/* Demo Accounts Panel */}
      <div className="mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-300">Demo accounts</span>
          <span className="text-xs text-zinc-500">Quick sign-in</span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {DEMO_ACCOUNTS.map((acc) => {
            const isDoctor = acc.role === 'doctor';
            const isPatient = acc.role === 'patient';
            const Icon = isDoctor ? Stethoscope : isPatient ? User : Users;

            return (
              <div 
                key={acc.role}
                className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5 text-zinc-400">
                    <Icon size={14} />
                    <span className="text-xs font-medium text-zinc-300">
                      {acc.badge.replace(' Portal', '')}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-zinc-100 truncate">{acc.name}</h4>
                  <p className="text-[11px] text-zinc-500 truncate font-mono mt-0.5">{acc.email}</p>
                </div>

                <div className="mt-3 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDirectDemoLogin(acc)}
                    disabled={isLoading}
                    className="w-full py-1.5 px-2 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Open</span>
                    <ArrowRight size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoFill(acc)}
                    className="w-full py-1 px-2 rounded-md text-[11px] font-normal text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <KeyRound size={11} />
                    <span>Fill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div className="mb-4 p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 flex items-center gap-2">
          <Check size={14} className="text-emerald-400 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-zinc-500" size={16} />
            <input 
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full py-2.5 pl-9 pr-3 text-sm text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:border-sky-500 focus:outline-none transition-colors placeholder:text-zinc-600"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-zinc-500" size={16} />
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-2.5 pl-9 pr-3 text-sm text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:border-sky-500 focus:outline-none transition-colors placeholder:text-zinc-600"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-700 text-sky-600 focus:ring-0" />
            <span className="text-zinc-400 font-normal">Remember me</span>
          </label>
          <button 
            type="button" 
            onClick={() => handleAutoFill(DEMO_ACCOUNTS[1])}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Fill demo patient
          </button>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="flex items-center justify-center w-full gap-2 py-2.5 font-medium transition-colors rounded-lg bg-sky-700 text-white hover:bg-sky-500 disabled:opacity-50 text-sm"
        >
          {isLoading ? (
            <>Signing in... <Loader2 className="animate-spin" size={16} /></>
          ) : (
            <>Sign in <ArrowRight size={16} /></>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-zinc-400">
            Don't have an account?{' '}
            <Link to="/auth/role" className="text-sky-400 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
