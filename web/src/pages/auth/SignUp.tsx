import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { 
  User, Mail, Lock, Phone, Briefcase, Award, Calendar, AlertCircle, 
  Loader2, Sparkles, Check, KeyRound, ArrowRight, Stethoscope, HeartPulse 
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { DEMO_ACCOUNTS, getDemoFormData } from '../../lib/demoAuth';

export function SignUp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const role = searchParams.get('role') || 'patient'; // Default to patient if missing
  const isDoctor = role === 'doctor';
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '',
    // Doctor extra fields
    specialization: isDoctor ? 'Cardiology' : '', hospital: '', licenseId: '', experience: '',
    // Patient extra fields
    age: '', gender: 'Male', emergencyContact: '', medicalConditions: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'info' | 'success' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Auto-fill Demo credentials for normal review
  const handleAutoFillDemo = () => {
    const demoData = getDemoFormData(role);
    setFormData((prev) => ({
      ...prev,
      ...demoData
    }));
    setAgreeTerms(true);
    setStatusMessage({
      text: `Demo ${role} credentials filled! You can now edit them or click "Complete Registration".`,
      type: 'info'
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 2. Direct 1-click Demo Registration & Login
  const handleInstantDemoSignup = async () => {
    setIsLoading(true);
    const demoData = getDemoFormData(role);
    setFormData((prev) => ({ ...prev, ...demoData }));
    setAgreeTerms(true);

    try {
      const demoAccount = DEMO_ACCOUNTS.find(a => a.role === role) || DEMO_ACCOUNTS[0];
      const targetUserId = demoAccount.id;
      const targetProfileId = demoAccount.id;

      // Try inserting into Supabase if possible
      try {
        await supabase
          .from('users')
          .insert({
            id: targetUserId,
            email: demoData.email.toLowerCase().trim(),
            role: role.toUpperCase(),
            created_at: new Date().toISOString()
          });
      } catch (err) {
        console.warn('Supabase insert skipped or failed:', err);
      }

      login({
        id: targetProfileId,
        name: demoData.fullName,
        email: demoData.email.toLowerCase().trim(),
        role: role as any
      });

      setStatusMessage({ text: 'Demo Registration Successful! Redirecting...', type: 'success' });
      setTimeout(() => {
        navigate(isDoctor ? '/doctor' : '/patient');
      }, 500);
    } catch (err) {
      console.error(err);
      // Fallback
      login({
        id: crypto.randomUUID(),
        name: demoData.fullName,
        email: demoData.email,
        role: role as any
      });
      navigate(isDoctor ? '/doctor' : '/patient');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to the Terms & Conditions to proceed.');
      return;
    }
    setIsLoading(true);

    try {
      const newUserId = crypto.randomUUID();
      const newProfileId = crypto.randomUUID();
      const first_name = formData.fullName.split(' ')[0] || '';
      const last_name = formData.fullName.split(' ').slice(1).join(' ') || '';

      let supabaseSuccess = false;
      try {
        // 1. Insert into users
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: newUserId,
            email: formData.email.toLowerCase().trim(),
            role: role.toUpperCase(),
            created_at: new Date().toISOString()
          });
        
        if (!userError) {
          // 2. Insert into profiles
          if (role === 'doctor') {
            const { error: profileError } = await supabase
              .from('doctor_profiles')
              .insert({
                id: newProfileId,
                user_id: newUserId,
                first_name,
                last_name,
                specialization: formData.specialization || 'Cardiology',
                hospital_affiliation: formData.hospital || 'MediGuardian Health Center',
                license_number: formData.licenseId || 'MED-0001',
                is_verified: true
              });
            if (!profileError) supabaseSuccess = true;
          } else {
            const { error: profileError } = await supabase
              .from('patient_profiles')
              .insert({
                id: newProfileId,
                user_id: newUserId,
                mg_pat_id: 'MG-PAT-' + Math.floor(10000 + Math.random() * 90000),
                first_name,
                last_name,
                date_of_birth: new Date().toISOString().split('T')[0],
                blood_group: 'O+',
                health_status: 'STABLE',
                adherence_score: 100,
                allergies: [],
                chronic_conditions: []
              });
            if (!profileError) supabaseSuccess = true;
          }
        }
      } catch (dbErr) {
        console.warn('Supabase DB registration offline/skipped, using local state:', dbErr);
      }

      // Log in automatically
      login({
        id: newProfileId,
        name: formData.fullName || (isDoctor ? 'Dr. Rajesh Kumar' : 'Amit Patel'),
        email: formData.email.toLowerCase().trim(),
        role: role as any
      });

      console.info(`User registered successfully (${supabaseSuccess ? 'Supabase Sync' : 'Local/Demo Session'})`);
      navigate(role === 'doctor' ? '/doctor' : '/patient');
    } catch (err: any) {
      console.error(err);
      // Safe fallback: never block user in demo testing
      login({
        id: crypto.randomUUID(),
        name: formData.fullName || 'Demo User',
        email: formData.email || 'demo@mediguardian.ai',
        role: role as any
      });
      navigate(role === 'doctor' ? '/doctor' : '/patient');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={`Create ${isDoctor ? 'Doctor' : 'Patient'} Account`}
      subtitle="Fill in the details below to complete your registration."
    >
      {/* Demo Quick Registration Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-brand-purple/20 via-bg-surface to-brand-neon/15 border border-brand-neon/40 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-neon animate-pulse" size={18} />
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-neon">
              Demo Helper • {isDoctor ? 'Doctor' : 'Patient'} Testing
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-neon/20 text-brand-neon font-semibold">
            Instant Demo Fill
          </span>
        </div>
        <p className="text-xs text-text-secondary mb-3">
          Testing or evaluating the app? Use our demo controls to auto-fill the whole form or sign up instantly in one click:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleAutoFillDemo}
            className="py-2.5 px-3 rounded-xl bg-bg-base/90 hover:bg-bg-surface border border-brand-neon/40 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <KeyRound size={14} className="text-brand-neon" />
            <span>Auto-Fill Demo Credentials</span>
          </button>

          <button
            type="button"
            onClick={handleInstantDemoSignup}
            disabled={isLoading}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
              isDoctor ? 'bg-brand-purple text-white hover:bg-brand-purple/80' : 'bg-brand-neon text-black hover:bg-white'
            }`}
          >
            <span>1-Click Demo Registration</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
          <span>Already have demo credentials?</span>
          <Link to="/auth/login" className="font-bold text-brand-neon hover:text-white transition-colors flex items-center gap-1">
            <span>Use Demo Login</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div className="mb-4 p-3 rounded-xl bg-brand-neon/10 border border-brand-neon/30 text-xs text-brand-neon flex items-center gap-2 animate-in fade-in">
          <Check size={16} className="shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleRegister} className="space-y-4">
        
        {/* Core Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-text-secondary">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                <User size={16} />
              </div>
              <input 
                type="text" 
                name="fullName" 
                required 
                value={formData.fullName} 
                onChange={handleChange} 
                className="w-full py-2.5 pl-9 pr-3 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" 
                placeholder={isDoctor ? "Dr. Rajesh Kumar" : "Amit Patel"} 
              />
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-text-secondary">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                <Mail size={16} />
              </div>
              <input 
                type="email" 
                name="email" 
                required 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full py-2.5 pl-9 pr-3 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" 
                placeholder={isDoctor ? "dr.rajesh.kumar@apollo.in" : "amit.patel@email.in"} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-text-secondary">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                <Phone size={16} />
              </div>
              <input 
                type="tel" 
                name="phone" 
                required 
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full py-2.5 pl-9 pr-3 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" 
                placeholder="+91 98765 43210" 
              />
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-text-secondary">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                <Lock size={16} />
              </div>
              <input 
                type="password" 
                name="password" 
                required 
                value={formData.password} 
                onChange={handleChange} 
                className="w-full py-2.5 pl-9 pr-3 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" 
                placeholder="••••••••" 
              />
            </div>
          </div>
        </div>

        <div className="w-full h-px my-4 bg-border-subtle"></div>

        {/* Conditional Doctor Fields */}
        {isDoctor && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-text-secondary">Specialization</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                    <Briefcase size={16} />
                  </div>
                  <select
                    name="specialization"
                    required
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full py-2.5 pl-9 pr-4 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select specialization...</option>
                    <optgroup label="Core Specialties">
                      <option value="Cardiology">Cardiology</option>
                      <option value="General Practice">General Practice</option>
                      <option value="Internal Medicine">Internal Medicine</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Endocrinology">Endocrinology</option>
                      <option value="Pediatrics">Pediatrics</option>
                    </optgroup>
                    <optgroup label="Surgical & Other">
                      <option value="General Surgery">General Surgery</option>
                      <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Other">Other</option>
                    </optgroup>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-muted text-xs">▼</div>
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-text-secondary">License ID / Medical Reg</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                    <Award size={16} />
                  </div>
                  <input 
                    type="text" 
                    name="licenseId" 
                    required 
                    value={formData.licenseId} 
                    onChange={handleChange} 
                    className="w-full py-2.5 pl-9 pr-3 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" 
                    placeholder="KMC10234" 
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-text-secondary">Hospital / Clinic Affiliation</label>
              <input 
                type="text" 
                name="hospital" 
                required 
                value={formData.hospital} 
                onChange={handleChange} 
                className="w-full py-2.5 px-3.5 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" 
                placeholder="Apollo Hospitals, Bangalore" 
              />
            </div>
          </div>
        )}

        {/* Conditional Patient Fields */}
        {!isDoctor && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-text-secondary">Age</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                    <Calendar size={16} />
                  </div>
                  <input 
                    type="number" 
                    name="age" 
                    required 
                    value={formData.age} 
                    onChange={handleChange} 
                    className="w-full py-2.5 pl-9 pr-3 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" 
                    placeholder="58" 
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-text-secondary">Emergency Contact</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                    <AlertCircle size={16} />
                  </div>
                  <input 
                    type="tel" 
                    name="emergencyContact" 
                    required 
                    value={formData.emergencyContact} 
                    onChange={handleChange} 
                    className="w-full py-2.5 pl-9 pr-3 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" 
                    placeholder="+91 98765 43210" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <input 
            type="checkbox" 
            id="terms" 
            checked={agreeTerms} 
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required 
            className="w-4 h-4 rounded text-brand-neon bg-bg-input border-border-subtle focus:ring-brand-neon focus:ring-offset-bg-base cursor-pointer" 
          />
          <label htmlFor="terms" className="text-xs font-medium text-text-secondary cursor-pointer">
            I agree to the <a href="#" className="text-brand-neon hover:text-white transition-colors">Terms of Service</a> & <a href="#" className="text-brand-neon hover:text-white transition-colors">Privacy Policy</a>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-3.5 mt-4 font-bold transition-all rounded-xl bg-brand-neon text-black glow-neon hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {isLoading ? (
            <>Completing Registration... <Loader2 className="animate-spin" size={18} /></>
          ) : (
            'Complete Registration'
          )}
        </button>
        
        <div className="flex items-center justify-between pt-2">
          <button 
            type="button" 
            onClick={() => navigate(isDoctor ? '/auth/register?role=patient' : '/auth/register?role=doctor')} 
            className="text-xs font-bold text-text-muted hover:text-brand-neon transition-colors flex items-center gap-1"
          >
            {isDoctor ? <HeartPulse size={14} /> : <Stethoscope size={14} />}
            <span>Switch to {isDoctor ? 'Patient' : 'Doctor'} Signup</span>
          </button>

          <Link to="/auth/login" className="text-xs font-bold text-brand-neon hover:text-white transition-colors">
            Already registered? Log in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
