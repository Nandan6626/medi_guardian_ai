import { ReactNode } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LogOut, LayoutDashboard, Calendar, FileText, Activity, 
  Users, Stethoscope, Video, Bell, Phone, HeartPulse, ShieldAlert, User, Settings
} from 'lucide-react';

interface SidebarItem {
  icon: any;
  label: string;
  path: string;
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const patientLinks: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/patient' },
    { icon: Calendar, label: 'My Medicines', path: '/patient/medicines' },
    { icon: ShieldAlert, label: 'AI Verification', path: '/patient/verify' },
    { icon: FileText, label: 'Health Timeline', path: '/patient/timeline' },
    { icon: Video, label: 'Appointments', path: '/patient/appointments' },
    { icon: Phone, label: 'Doctor Chat', path: '/patient/chat' },
    { icon: Activity, label: 'Health Reports', path: '/patient/reports' },
    { icon: HeartPulse, label: 'Emergency SOS', path: '/patient/emergency' },
    { icon: User, label: 'Profile', path: '/patient/profile' },
    { icon: Settings, label: 'Settings', path: '/patient/settings' },
  ];

  const doctorLinks: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor' },
    { icon: Users, label: 'Patient Management', path: '/doctor/patients' },
    { icon: ShieldAlert, label: 'Emergency Monitoring', path: '/doctor/alerts' },
    { icon: Bell, label: 'Notifications', path: '/doctor/notifications' },
    { icon: Activity, label: 'Analytics', path: '/doctor/analytics' },
    { icon: Settings, label: 'Settings', path: '/doctor/settings' },
  ];

  const familyLinks: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/family' },
    { icon: Users, label: 'Connected Patients', path: '/family/patients' },
    { icon: Bell, label: 'Alerts & Notifications', path: '/family/alerts' },
  ];

  let links: SidebarItem[] = [];
  if (user?.role === 'patient') links = patientLinks;
  else if (user?.role === 'doctor') links = doctorLinks;
  else if (user?.role === 'family') links = familyLinks;

  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark text-white">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/20 via-brand-dark to-brand-dark"></div>
      
      {/* Sidebar */}
      <aside className="w-72 flex flex-col justify-between p-6 border-r border-white/10 glass z-10 hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-xl bg-brand-neon text-black font-bold glow-neon">
              M
            </div>
            <span className="text-xl font-bold tracking-tight">MediGuardian</span>
          </div>

          <nav className="space-y-2">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    isActive 
                      ? 'bg-brand-purple/20 text-brand-neon border border-brand-purple/50' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <link.icon size={18} className={isActive ? 'text-brand-neon' : ''} />
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10 mt-6">
          <div className="flex items-center gap-3 mb-6 px-4">
            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="Avatar" />
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-brand-purple capitalize truncate">{user?.role || 'Role'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-colors text-sm font-bold"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
