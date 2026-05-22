import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { User, Mail, Lock, Phone, Briefcase, Award, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';

export function SignUp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const role = searchParams.get('role') || 'patient'; // Default to patient if missing
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '',
    // Doctor extra fields
    specialization: '', hospital: '', licenseId: '', experience: '',
    // Patient extra fields
    age: '', gender: '', emergencyContact: '', medicalConditions: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newUserId = crypto.randomUUID();
      const newProfileId = crypto.randomUUID();

      // 1. Insert into users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: newUserId,
          email: formData.email.toLowerCase().trim(),
          role: role.toUpperCase(),
          created_at: new Date().toISOString()
        });
      
      if (userError) throw userError;

      const first_name = formData.fullName.split(' ')[0] || '';
      const last_name = formData.fullName.split(' ').slice(1).join(' ') || '';

      // 2. Insert into profiles
      if (role === 'doctor') {
        const { error: profileError } = await supabase
          .from('doctor_profiles')
          .insert({
            id: newProfileId,
            user_id: newUserId,
            first_name,
            last_name,
            specialization: formData.specialization,
            hospital_affiliation: formData.hospital,
            license_number: formData.licenseId,
            is_verified: true
          });
        if (profileError) throw profileError;
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
        if (profileError) throw profileError;
      }

      // Log in automatically
      login({
        id: newProfileId,
        name: formData.fullName,
        email: formData.email.toLowerCase().trim(),
        role: role as any
      });

      alert('Registration successful!');
      navigate(role === 'doctor' ? '/doctor' : '/patient');
    } catch (err: any) {
      console.error(err);
      alert('Registration failed: ' + (err.message || 'unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={`Create ${role === 'doctor' ? 'Doctor' : 'Patient'} Account`}
      subtitle="Fill in the details below to complete your registration."
    >
      <form onSubmit={handleRegister} className="space-y-5">
        
        {/* Core Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-text-secondary">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted">
                <User size={18} />
              </div>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" placeholder="John Doe" />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-text-secondary">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted">
                <Mail size={18} />
              </div>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" placeholder="john@example.com" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-text-secondary">Phone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted">
                <Phone size={18} />
              </div>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-text-secondary">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted">
                <Lock size={18} />
              </div>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" placeholder="••••••••" />
            </div>
          </div>
        </div>

        <div className="w-full h-px my-6 bg-border-subtle"></div>

        {/* Conditional Doctor Fields */}
        {role === 'doctor' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-semibold text-text-secondary">Specialization</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted">
                    <Briefcase size={18} />
                  </div>
                  <select
                    name="specialization"
                    required
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full py-3 pl-10 pr-4 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select specialization...</option>
                    <optgroup label="Primary Care">
                      <option>General Practice</option>
                      <option>Family Medicine</option>
                      <option>Internal Medicine</option>
                      <option>Pediatrics</option>
                      <option>Geriatrics</option>
                    </optgroup>
                    <optgroup label="Surgery">
                      <option>General Surgery</option>
                      <option>Cardiothoracic Surgery</option>
                      <option>Neurosurgery</option>
                      <option>Orthopedic Surgery</option>
                      <option>Plastic & Reconstructive Surgery</option>
                      <option>Vascular Surgery</option>
                      <option>Urological Surgery</option>
                      <option>Laparoscopic Surgery</option>
                    </optgroup>
                    <optgroup label="Medical Specialties">
                      <option>Cardiology</option>
                      <option>Neurology</option>
                      <option>Endocrinology</option>
                      <option>Gastroenterology</option>
                      <option>Pulmonology</option>
                      <option>Nephrology</option>
                      <option>Rheumatology</option>
                      <option>Hematology</option>
                      <option>Oncology</option>
                      <option>Infectious Disease</option>
                      <option>Allergy & Immunology</option>
                      <option>Hepatology</option>
                    </optgroup>
                    <optgroup label="Women's & Reproductive Health">
                      <option>Obstetrics & Gynecology</option>
                      <option>Reproductive Medicine & IVF</option>
                      <option>Maternal-Fetal Medicine</option>
                      <option>Gynecologic Oncology</option>
                    </optgroup>
                    <optgroup label="Mental Health">
                      <option>Psychiatry</option>
                      <option>Clinical Psychology</option>
                      <option>Addiction Medicine</option>
                      <option>Child & Adolescent Psychiatry</option>
                    </optgroup>
                    <optgroup label="Diagnostics & Imaging">
                      <option>Radiology</option>
                      <option>Nuclear Medicine</option>
                      <option>Pathology</option>
                      <option>Clinical Laboratory Medicine</option>
                    </optgroup>
                    <optgroup label="Specialized Care">
                      <option>Ophthalmology</option>
                      <option>ENT (Otolaryngology)</option>
                      <option>Dermatology</option>
                      <option>Orthopedics</option>
                      <option>Sports Medicine</option>
                      <option>Pain Management</option>
                      <option>Anesthesiology</option>
                      <option>Emergency Medicine</option>
                      <option>Critical Care / ICU</option>
                      <option>Palliative Care</option>
                      <option>Sleep Medicine</option>
                    </optgroup>
                    <optgroup label="Dental & Oral">
                      <option>General Dentistry</option>
                      <option>Oral Surgery</option>
                      <option>Orthodontics</option>
                      <option>Periodontology</option>
                    </optgroup>
                    <optgroup label="Allied Health">
                      <option>Physiotherapy</option>
                      <option>Occupational Therapy</option>
                      <option>Dietetics & Nutrition</option>
                      <option>Audiology</option>
                      <option>Speech Therapy</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option>Ayurveda</option>
                      <option>Homeopathy</option>
                      <option>Naturopathy</option>
                      <option>Other</option>
                    </optgroup>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-text-muted">▼</div>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-text-secondary">License ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted">
                    <Award size={18} />
                  </div>
                  <input type="text" name="licenseId" required value={formData.licenseId} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" placeholder="MED-12345" />
                </div>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-text-secondary">Hospital / Clinic</label>
              <input type="text" name="hospital" required value={formData.hospital} onChange={handleChange} className="w-full py-3 px-4 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" placeholder="Global Health Center" />
            </div>
          </div>
        )}

        {/* Conditional Patient Fields */}
        {role === 'patient' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-semibold text-text-secondary">Age</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted">
                    <Calendar size={18} />
                  </div>
                  <input type="number" name="age" required value={formData.age} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" placeholder="Age" />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-text-secondary">Emergency Contact</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted">
                    <AlertCircle size={18} />
                  </div>
                  <input type="tel" name="emergencyContact" required value={formData.emergencyContact} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-white bg-bg-input border border-border-subtle rounded-xl focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none transition-all placeholder:text-text-muted" placeholder="Phone Number" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-6">
          <input type="checkbox" required className="w-4 h-4 rounded text-brand-neon bg-bg-input border-border-subtle focus:ring-brand-neon focus:ring-offset-bg-base" />
          <span className="text-sm font-medium text-text-secondary">I agree to the <a href="#" className="text-brand-neon hover:text-white transition-colors">Terms & Conditions</a></span>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-4 mt-8 font-bold transition-all rounded-xl bg-brand-neon text-black glow-neon hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>Completing Registration... <Loader2 className="animate-spin" size={20} /></>
          ) : (
            'Complete Registration'
          )}
        </button>
        
        <div className="mt-4 text-center">
           <button type="button" onClick={() => navigate('/auth/role')} className="text-sm font-bold text-text-muted hover:text-white transition-colors">
             Change Role
           </button>
        </div>
      </form>
    </AuthLayout>
  );
}
