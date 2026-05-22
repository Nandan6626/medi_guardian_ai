import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, AlertTriangle, Activity, FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { PrescribeMedicineModal } from '../components/PrescribeMedicineModal'

export function DoctorDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  // For Phase 3, we mock prescribing to the first patient. In the future this would be dynamic.
  const MOCK_PATIENT_ID = 1

  const { data, isLoading } = useQuery({
    queryKey: ['doctor', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/doctor/dashboard')
      return res.data
    }
  })

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading Doctor Portal...</div>
  }

  const { metrics, action_required } = data || {}

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold">{metrics?.doctor_name || 'Doctor'} 🩺</h1>
          <p className="mt-2 text-brand-purple">{metrics?.specialization || 'General'} • {metrics?.hospital}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 font-bold text-white transition-all border rounded-xl bg-brand-purple border-brand-purple glow-purple hover:bg-white hover:text-brand-purple"
        >
          + New Prescription
        </button>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-4">
        {[
          { title: 'Total Patients', value: metrics?.total_patients || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { title: 'Critical Alerts', value: metrics?.critical_alerts || 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
          { title: 'Avg Adherence', value: `${metrics?.avg_adherence || 0}%`, icon: Activity, color: 'text-brand-neon', bg: 'bg-brand-neon/10' },
          { title: 'Pending Reviews', value: metrics?.pending_reviews || 0, icon: FileText, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
        ].map((metric, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-6 glass rounded-2xl"
          >
            <div>
              <p className="mb-1 text-sm text-gray-400">{metric.title}</p>
              <p className="text-3xl font-bold">{metric.value}</p>
            </div>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${metric.bg} ${metric.color}`}>
              <metric.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* High Risk Patients */}
        <div className="p-8 lg:col-span-2 glass rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <AlertTriangle className="text-red-400" /> Action Required
            </h2>
            <button className="text-sm transition-colors text-brand-neon hover:text-white">View All</button>
          </div>
          
          <div className="space-y-4">
            {!action_required || action_required.length === 0 ? (
              <p className="text-gray-400">No immediate actions required for your patients.</p>
            ) : (
              action_required.map((alert: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-6 border bg-gray-900/50 rounded-2xl border-white/5">
                  <div>
                    <h3 className="text-lg font-bold">{alert.patient_name}</h3>
                    <p className="mt-1 text-sm text-gray-400">{alert.issue}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      alert.risk_level === 'High' ? 'bg-red-500/20 text-red-400' :
                      alert.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {alert.risk_level} Risk
                    </span>
                    <button className="px-4 py-2 text-sm transition-colors rounded-lg bg-white/10 hover:bg-white/20">Review</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="p-8 border-t-4 glass rounded-3xl border-t-brand-neon">
          <h2 className="flex items-center gap-2 mb-6 text-xl font-bold">
            <Activity className="text-brand-neon" /> AI Fleet Insights
          </h2>
          <div className="space-y-6">
            <div className="p-4 border bg-brand-neon/5 rounded-xl border-brand-neon/20">
              <p className="text-sm text-gray-300">
                <strong className="text-brand-neon">Trend Detected:</strong> 15% drop in evening medication adherence across hypertensive patients during weekends.
              </p>
            </div>
            <div className="p-4 border bg-brand-purple/5 rounded-xl border-brand-purple/20">
              <p className="text-sm text-gray-300">
                <strong className="text-brand-purple">Predictive Alert:</strong> Patient #842 (John D.) has a 80% probability of readmission based on recent erratic vital patterns.
              </p>
            </div>
          </div>
          <button className="w-full px-4 py-3 mt-8 text-sm font-bold transition-all border border-white/20 rounded-xl hover:bg-white/5">
            Generate Full AI Report
          </button>
        </div>

      </div>

      <PrescribeMedicineModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        patientId={MOCK_PATIENT_ID} 
      />
    </div>
  )
}
