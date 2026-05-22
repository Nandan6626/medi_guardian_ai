import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication logic based on email
    let role: 'doctor' | 'patient' | 'family' = 'patient';
    let id = 1;
    let name = 'Alex';

    if (email.includes('doctor')) {
      role = 'doctor';
      id = 3;
      name = 'Dr. Sarah Jenkins';
    } else if (email.includes('family') || email.includes('sarah')) {
      role = 'family';
      id = 2;
      name = 'Sarah (Mom)';
    }

    login({ id, name, email, role });
    navigate(`/${role}`);
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your details to access your dashboard."
    >
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              <Mail size={20} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full py-4 pl-12 pr-4 text-gray-900 clay-input"
              placeholder="hello@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              <Lock size={20} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-4 pl-12 pr-4 text-gray-900 clay-input"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-[var(--color-clay-violet)] focus:ring-[var(--color-clay-violet)] border-gray-300" />
            <span className="font-medium text-gray-600">Remember me</span>
          </label>
          <a href="#" className="font-bold text-[var(--color-clay-violet)] hover:text-opacity-80">Forgot password?</a>
        </div>

        <button type="submit" className="flex items-center justify-center w-full gap-2 py-4 font-bold clay-btn">
          Sign In <ArrowRight size={20} />
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-sm text-gray-500 bg-[var(--color-clay-bg)]">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="py-3 font-semibold bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors flex justify-center items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Google
          </button>
          <button type="button" className="py-3 font-semibold bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors flex justify-center items-center gap-2">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.67 2.15-3.18 1.84-2.66 5.86.35 7.21-.69 1.6-1.57 3.01-2.67 3.65zm-3.8-12.75c-.32-1.89 1.25-3.66 3.14-3.92.35 2.12-1.55 3.8-3.14 3.92z"/></svg>
            Apple
          </button>
        </div>

        <p className="text-sm text-center text-gray-600">
          Don't have an account? <Link to="/auth/role" className="font-bold text-[var(--color-clay-violet)] hover:underline">Sign up for free</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
