import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const PatientDashboard = lazy(() =>
  import('./pages/PatientDashboard').then((m) => ({ default: m.PatientDashboard }))
)
const DoctorDashboard = lazy(() =>
  import('./pages/DoctorDashboard').then((m) => ({ default: m.DoctorDashboard }))
)
const FamilyDashboard = lazy(() =>
  import('./pages/FamilyDashboard').then((m) => ({ default: m.FamilyDashboard }))
)

// Auth Pages
const Login = lazy(() =>
  import('./pages/auth/Login').then((m) => ({ default: m.Login }))
)
const RoleSelection = lazy(() =>
  import('./pages/auth/RoleSelection').then((m) => ({ default: m.RoleSelection }))
)
const SignUp = lazy(() =>
  import('./pages/auth/SignUp').then((m) => ({ default: m.SignUp }))
)

// Protected Routing & Layout
const ProtectedRoute = lazy(() =>
  import('./components/ProtectedRoute').then((m) => ({ default: m.ProtectedRoute }))
)
const DashboardLayout = lazy(() =>
  import('./components/DashboardLayout').then((m) => ({ default: m.DashboardLayout }))
)

const queryClient = new QueryClient()

const MyMedicines = lazy(() =>
  import('./pages/patient/MyMedicines').then((m) => ({ default: m.MyMedicines }))
)
const HealthTimeline = lazy(() =>
  import('./pages/patient/HealthTimeline').then((m) => ({ default: m.HealthTimeline }))
)
const Appointments = lazy(() =>
  import('./pages/patient/Appointments').then((m) => ({ default: m.Appointments }))
)
const DoctorChat = lazy(() =>
  import('./pages/patient/DoctorChat').then((m) => ({ default: m.DoctorChat }))
)
const HealthReports = lazy(() =>
  import('./pages/patient/HealthReports').then((m) => ({ default: m.HealthReports }))
)
const EmergencySOS = lazy(() =>
  import('./pages/patient/EmergencySOS').then((m) => ({ default: m.EmergencySOS }))
)
const Settings = lazy(() =>
  import('./pages/patient/Settings').then((m) => ({ default: m.Settings }))
)
const Profile = lazy(() =>
  import('./pages/patient/Profile').then((m) => ({ default: m.Profile }))
)
const Caretakers = lazy(() =>
  import('./pages/patient/Caretakers').then((m) => ({ default: m.Caretakers }))
)

const PatientManagement = lazy(() =>
  import('./pages/doctor/PatientManagement').then((m) => ({ default: m.PatientManagement }))
)
const PatientWorkspace = lazy(() =>
  import('./pages/doctor/PatientWorkspace').then((m) => ({ default: m.PatientWorkspace }))
)
const EmergencyMonitoring = lazy(() =>
  import('./pages/doctor/EmergencyMonitoring').then((m) => ({ default: m.EmergencyMonitoring }))
)
const Notifications = lazy(() =>
  import('./pages/doctor/Notifications').then((m) => ({ default: m.Notifications }))
)
const Analytics = lazy(() =>
  import('./pages/doctor/Analytics').then((m) => ({ default: m.Analytics }))
)
const DoctorSettings = lazy(() =>
  import('./pages/doctor/Settings').then((m) => ({ default: m.Settings }))
)

// A simple placeholder component for unimplemented features
function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-text-primary">
      <h1 className="text-3xl font-bold text-text-secondary">Coming Soon</h1>
      <p className="mt-2 text-text-secondary">This feature is under development.</p>
    </div>
  )
}

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center text-text-secondary">
      Loading...
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
          
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/patient/verify" element={<Navigate to="/patient/reports" replace />} />
              <Route path="/patient/timeline" element={<DashboardLayout><HealthTimeline /></DashboardLayout>} />
              <Route path="/patient/appointments" element={<DashboardLayout><Appointments /></DashboardLayout>} />
              <Route path="/patient/chat" element={<DashboardLayout><DoctorChat /></DashboardLayout>} />
              <Route path="/patient/reports" element={<DashboardLayout><HealthReports /></DashboardLayout>} />
              <Route path="/patient/caretakers" element={<DashboardLayout><Caretakers /></DashboardLayout>} />
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
          </Suspense>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
