import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { User, Mail, Lock, Phone, Briefcase, Award, Calendar, AlertCircle } from 'lucide-react';

export function SignUp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role') || 'patient'; // Default to patient if missing
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '',
    // Doctor extra fields
    specialization: '', hospital: '', licenseId: '', experience: '',
    // Patient extra fields
    age: '', gender: '', emergencyContact: '', medicalConditions: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock register logic -> redirects to dashboard
    navigate(role === 'doctor' ? '/doctor' : '/patient');
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
            <label className="block mb-2 text-sm font-semibold text-gray-700">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-gray-900 clay-input" placeholder="John Doe" />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-gray-900 clay-input" placeholder="john@example.com" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Phone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-gray-900 clay-input" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-gray-900 clay-input" placeholder="••••••••" />
            </div>
          </div>
        </div>

        <div className="w-full h-px my-6 bg-gray-200"></div>

        {/* Conditional Doctor Fields */}
        {role === 'doctor' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Specialization</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                    <Briefcase size={18} />
                  </div>
                  <input type="text" name="specialization" required value={formData.specialization} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-gray-900 clay-input" placeholder="e.g. Cardiology" />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">License ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                    <Award size={18} />
                  </div>
                  <input type="text" name="licenseId" required value={formData.licenseId} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-gray-900 clay-input" placeholder="MED-12345" />
                </div>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Hospital / Clinic</label>
              <input type="text" name="hospital" required value={formData.hospital} onChange={handleChange} className="w-full py-3 px-4 text-sm text-gray-900 clay-input" placeholder="Global Health Center" />
            </div>
          </div>
        )}

        {/* Conditional Patient Fields */}
        {role === 'patient' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Age</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                    <Calendar size={18} />
                  </div>
                  <input type="number" name="age" required value={formData.age} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-gray-900 clay-input" placeholder="Age" />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Emergency Contact</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                    <AlertCircle size={18} />
                  </div>
                  <input type="tel" name="emergencyContact" required value={formData.emergencyContact} onChange={handleChange} className="w-full py-3 pl-10 pr-4 text-sm text-gray-900 clay-input" placeholder="Phone Number" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-6">
          <input type="checkbox" required className="w-4 h-4 rounded text-[var(--color-clay-violet)] focus:ring-[var(--color-clay-violet)] border-gray-300" />
          <span className="text-sm font-medium text-gray-600">I agree to the <a href="#" className="text-[var(--color-clay-violet)] hover:underline">Terms & Conditions</a></span>
        </div>

        <button type="submit" className="w-full py-4 mt-8 font-bold clay-btn">
          Complete Registration
        </button>
        
        <div className="mt-4 text-center">
           <button type="button" onClick={() => navigate('/auth/role')} className="text-sm font-bold text-gray-500 hover:text-gray-900">
             Change Role
           </button>
        </div>
      </form>
    </AuthLayout>
  );
}
