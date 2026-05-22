import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { PatientDashboard } from './pages/PatientDashboard'
import { DoctorDashboard } from './pages/DoctorDashboard'
import { FamilyDashboard } from './pages/FamilyDashboard'

// Auth Pages
import { Login } from './pages/auth/Login'
import { RoleSelection } from './pages/auth/RoleSelection'
import { SignUp } from './pages/auth/SignUp'

// Protected Routing & Layout
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/DashboardLayout'

const queryClient = new QueryClient()

import { MyMedicines } from './pages/patient/MyMedicines'
import { AIVerification } from './pages/patient/AIVerification'
import { HealthTimeline } from './pages/patient/HealthTimeline'
import { Appointments } from './pages/patient/Appointments'
import { DoctorChat } from './pages/patient/DoctorChat'
import { HealthReports } from './pages/patient/HealthReports'
import { EmergencySOS } from './pages/patient/EmergencySOS'
import { Settings } from './pages/patient/Settings'
import { Profile } from './pages/patient/Profile'

import { PatientManagement } from './pages/doctor/PatientManagement'
import { PatientWorkspace } from './pages/doctor/PatientWorkspace'
import { EmergencyMonitoring } from './pages/doctor/EmergencyMonitoring'
import { Notifications } from './pages/doctor/Notifications'
import { Analytics } from './pages/doctor/Analytics'
import { Settings as DoctorSettings } from './pages/doctor/Settings'

// A simple placeholder component for unimplemented features
function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-text-primary">
      <h1 className="text-3xl font-bold text-text-secondary">Coming Soon</h1>
      <p className="mt-2 text-text-secondary">This feature is under development.</p>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-bg-base text-text-primary selection:bg-brand-neon selection:text-black">
          {/* Deep space radial gradient behind everything */}
          <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_top_right,rgba(112,0,255,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(0,240,255,0.05),transparent_40%)]"></div>
          
          <Routes>
            {/* Redirect root to login page automatically */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/role" element={<RoleSelection />} />
            <Route path="/auth/register" element={<SignUp />} />

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/patient" element={<DashboardLayout><PatientDashboard /></DashboardLayout>} />
              <Route path="/patient/medicines" element={<DashboardLayout><MyMedicines /></DashboardLayout>} />
              <Route path="/patient/verify" element={<DashboardLayout><AIVerification /></DashboardLayout>} />
              <Route path="/patient/timeline" element={<DashboardLayout><HealthTimeline /></DashboardLayout>} />
              <Route path="/patient/appointments" element={<DashboardLayout><Appointments /></DashboardLayout>} />
              <Route path="/patient/chat" element={<DashboardLayout><DoctorChat /></DashboardLayout>} />
              <Route path="/patient/reports" element={<DashboardLayout><HealthReports /></DashboardLayout>} />
              <Route path="/patient/emergency" element={<DashboardLayout><EmergencySOS /></DashboardLayout>} />
              <Route path="/patient/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
              <Route path="/patient/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
              
              <Route path="/doctor" element={<DashboardLayout><DoctorDashboard /></DashboardLayout>} />
              <Route path="/doctor/patients" element={<DashboardLayout><PatientManagement /></DashboardLayout>} />
              <Route path="/doctor/patients/:id" element={<DashboardLayout><PatientWorkspace /></DashboardLayout>} />
              <Route path="/doctor/alerts" element={<DashboardLayout><EmergencyMonitoring /></DashboardLayout>} />
              <Route path="/doctor/notifications" element={<DashboardLayout><Notifications /></DashboardLayout>} />
              <Route path="/doctor/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
              <Route path="/doctor/settings" element={<DashboardLayout><DoctorSettings /></DashboardLayout>} />
              <Route path="/doctor/*" element={<DashboardLayout><ComingSoon /></DashboardLayout>} />
              
              <Route path="/family" element={<DashboardLayout><FamilyDashboard /></DashboardLayout>} />
              <Route path="/family/*" element={<DashboardLayout><ComingSoon /></DashboardLayout>} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
