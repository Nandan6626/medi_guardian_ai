import { motion } from 'framer-motion'
import { Users, HeartPulse, AlertCircle, Phone } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export function FamilyDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['family', 'patients'],
    queryFn: async () => {
      const res = await api.get('/family/patients')
      return res.data
    }
  })

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold">Family Portal</h1>
          <p className="mt-2 text-brand-neon">Monitor your loved ones' health in realtime.</p>
        </div>
        <div className="flex items-center justify-center w-16 h-16 overflow-hidden border-2 rounded-full border-brand-purple glass">
          <img src="https://i.pravatar.cc/150?img=47" alt="Profile" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-8 lg:col-span-2">
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold"><Users className="text-brand-purple"/> Connected Patients</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {isLoading ? (
              <div className="col-span-2 py-8 text-center text-gray-400 glass rounded-2xl">Loading patients...</div>
            ) : data?.patients?.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-gray-400 glass rounded-2xl">No connected patients found.</div>
            ) : (
              data?.patients?.map((patient: any) => (
                <motion.div 
                  key={patient.patient_id}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 transition-colors border glass rounded-2xl border-white/5 hover:border-brand-purple/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{patient.patient_name}</h3>
                      <p className="text-sm text-gray-400">Adherence Score: <span className={patient.adherence_score > 80 ? 'text-green-400' : 'text-red-400'}>{patient.adherence_score}%</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-white transition-colors bg-brand-purple/20 rounded-xl hover:bg-brand-purple/40">
                        <Phone size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Medicines</span>
                      <span className="font-bold">{patient.total_medicines}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Missed Doses</span>
                      <span className={`font-bold ${patient.missed_medicines > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {patient.missed_medicines}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button className="w-full py-3 text-sm font-bold transition-colors bg-white/5 rounded-xl hover:bg-white/10">
                      View Full Schedule
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Alerts Panel */}
          <div className="p-6 border glass rounded-3xl border-red-500/30 bg-red-500/5">
            <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-red-400"><AlertCircle /> Urgent Alerts</h3>
            <div className="space-y-4">
              {/* Mock Alert for now */}
              <div className="p-4 bg-red-500/20 rounded-2xl border border-red-500/30">
                <p className="text-sm font-bold text-red-200">Missed Medication</p>
                <p className="mt-1 text-xs text-red-300">Alex missed Atorvastatin 20mg at 08:00 PM.</p>
                <button className="px-4 py-2 mt-3 text-xs font-bold text-red-900 bg-red-400 rounded-lg hover:bg-red-300">
                  Call Alex
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 glass rounded-3xl">
            <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-brand-neon"><HeartPulse /> Overall Status</h3>
            <p className="text-sm text-gray-400">All connected patients are currently stable. No emergency escalations required at this time.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
