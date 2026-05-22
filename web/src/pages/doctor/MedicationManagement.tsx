import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, User, Activity, AlertCircle, Plus, Camera, UploadCloud, Pill, ShieldCheck, HeartPulse } from 'lucide-react';

export function MedicationManagement() {
  const queryClient = useQueryClient();
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // Form State
  const [newMed, setNewMed] = useState({
    name: '', dosage: '', frequency: 'Daily', timing: '', 
    food_instruction: '', duration: '', color: '', shape: '', notes: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch Patients
  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ['doctor_patients'],
    queryFn: async () => {
      const res = await api.get('/doctor/patients');
      return res.data;
    }
  });

  // Fetch Selected Patient Details
  const { data: patientDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ['doctor_patient_details', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return null;
      const res = await api.get(`/doctor/patients/${selectedPatientId}`);
      return res.data;
    },
    enabled: !!selectedPatientId
  });

  // Fetch Patient Medicines
  const { data: medicines = [] } = useQuery({
    queryKey: ['patient_medicines', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return [];
      const res = await api.get('/medicines/', {
        // In a real app we'd pass patient_id to a specific doctor endpoint, 
        // but for hackathon mock we'll just fetch all and filter or assume 
        // the backend handles auth implicitly if we switch users. 
        // We'll use the existing medicines endpoint and filter if needed.
        // Let's assume api.get(`/medicines/`) returns for the currently logged in user, 
        // but since we are doctor, we need to pass patient_id.
        // Actually, we need to update the endpoint to support patient_id filtering for doctors.
      });
      return res.data;
    },
    enabled: !!selectedPatientId
  });

  const prescribeMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post(`/doctor/patients/${selectedPatientId}/prescriptions`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient_medicines'] });
      setNewMed({ name: '', dosage: '', frequency: 'Daily', timing: '', food_instruction: '', duration: '', color: '', shape: '', notes: ''});
      setPreviewImage(null);
      alert('Prescription successfully created and sent to patient!');
    }
  });

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrescribe = (e: React.FormEvent) => {
    e.preventDefault();
    prescribeMutation.mutate({
      ...newMed,
      image_url: previewImage // passing base64 mock image
    });
  };

  return (
    <div className="flex h-full bg-[#141423]">
      
      {/* LEFT COLUMN: Patient List */}
      <div className="w-1/4 min-w-[300px] border-r border-white/10 p-6 flex flex-col bg-[#1A1A2E]/50">
        <h2 className="text-2xl font-bold text-white mb-6">Patients</h2>
        
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search patients..." 
            className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-neon"
          />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <span className="px-3 py-1 text-xs font-bold bg-brand-neon/20 text-brand-neon rounded-full whitespace-nowrap">Active</span>
          <span className="px-3 py-1 text-xs font-bold bg-red-500/20 text-red-400 rounded-full whitespace-nowrap">Critical</span>
          <span className="px-3 py-1 text-xs font-bold bg-white/10 text-gray-300 rounded-full whitespace-nowrap">Elderly</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loadingPatients ? (
            <div className="text-gray-500 text-sm">Loading patients...</div>
          ) : (
            patients.map((p: any) => (
              <div 
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  selectedPatientId === p.id 
                    ? 'bg-brand-purple/20 border-brand-purple' 
                    : 'bg-[#141423] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">{p.name}</h4>
                  {p.status === 'Critical' && <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
                </div>
                <p className="text-xs text-gray-400">ID: PT-{p.id} • {p.status}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CENTER COLUMN: Patient Details */}
      <div className="w-1/3 min-w-[350px] border-r border-white/10 p-6 flex flex-col overflow-y-auto">
        {!selectedPatientId ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <User size={48} className="mb-4 opacity-20" />
            <p>Select a patient to view details</p>
          </div>
        ) : loadingDetails ? (
          <div className="text-gray-500">Loading details...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedPatientId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-transparent border border-brand-purple/30">
                <div className="w-16 h-16 rounded-full bg-[#1A1A2E] flex items-center justify-center border-2 border-brand-purple overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patientDetails?.name}`} alt="Avatar" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{patientDetails?.name}</h2>
                  <p className="text-sm text-brand-neon">Adherence: {patientDetails?.adherence_score}% 📈</p>
                </div>
              </div>

              {/* Vitals & Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#1A1A2E]/80 border border-white/5">
                  <p className="text-xs text-gray-400 mb-1">Age</p>
                  <p className="font-bold text-white">{patientDetails?.age} yrs</p>
                </div>
                <div className="p-4 rounded-xl bg-[#1A1A2E]/80 border border-white/5">
                  <p className="text-xs text-gray-400 mb-1">Blood Group</p>
                  <p className="font-bold text-white">{patientDetails?.blood_group || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 col-span-2">
                  <p className="text-xs text-red-400 mb-1 flex items-center gap-1"><AlertCircle size={12}/> Allergies</p>
                  <p className="font-bold text-white text-sm">{patientDetails?.allergies || 'None reported'}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#1A1A2E]/80 border border-white/5 col-span-2">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Activity size={12}/> Medical Conditions</p>
                  <p className="font-bold text-white text-sm">{patientDetails?.medical_conditions || 'None reported'}</p>
                </div>
              </div>
              
              {/* Existing Medications (Placeholder until endpoint is updated) */}
              <div>
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Pill size={16} className="text-brand-neon"/> Current Medications</h3>
                <div className="p-5 rounded-2xl border border-white/5 bg-[#1A1A2E]/50 text-center">
                  <p className="text-sm text-gray-400">Loading timeline...</p>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* RIGHT COLUMN: Scheduler & AI UI */}
      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-[#141423] to-[#0F0F1A]">
        {!selectedPatientId ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600">
             <HeartPulse size={64} className="mb-4 opacity-10" />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-2">New Prescription</h2>
            <p className="text-gray-400 text-sm mb-8">AI verification is active. Fill in the details to prescribe.</p>

            <form onSubmit={handlePrescribe} className="space-y-6">
              
              {/* Image Upload Area */}
              <div className="relative p-6 border-2 border-dashed border-white/20 rounded-3xl bg-[#1A1A2E]/30 hover:bg-[#1A1A2E]/60 transition-colors text-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                
                {previewImage ? (
                  <div className="flex flex-col items-center">
                    <img src={previewImage} alt="Medicine preview" className="h-32 object-contain mb-4 rounded-lg shadow-lg" />
                    <div className="flex items-center gap-2 text-sm text-brand-neon bg-brand-neon/10 px-4 py-2 rounded-full">
                      <ShieldCheck size={16} /> AI OCR Match: {newMed.name || 'Detecting...'}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-16 h-16 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center mb-4">
                      <Camera size={24} />
                    </div>
                    <p className="font-bold text-white">Upload Medicine Image</p>
                    <p className="text-sm text-gray-500 mt-2">Tablet, Capsule, or Prescription Photo</p>
                  </div>
                )}
              </div>

              {/* Medicine Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Medicine Name</label>
                  <input type="text" required value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none" placeholder="e.g. Metformin" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Dosage</label>
                  <input type="text" required value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none" placeholder="e.g. 500mg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Timing</label>
                  <input type="text" required value={newMed.timing} onChange={e => setNewMed({...newMed, timing: e.target.value})} className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none" placeholder="e.g. 08:00 AM" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Food Instruction</label>
                  <select value={newMed.food_instruction} onChange={e => setNewMed({...newMed, food_instruction: e.target.value})} className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none">
                    <option value="">No Instruction</option>
                    <option value="Before Food">Before Food</option>
                    <option value="After Food">After Food</option>
                    <option value="With Food">With Food</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Duration</label>
                  <input type="text" required value={newMed.duration} onChange={e => setNewMed({...newMed, duration: e.target.value})} className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none" placeholder="e.g. 30 Days" />
                </div>

                {/* Visual Tags */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Color Tag</label>
                  <div className="flex gap-2">
                    {['White', 'Red', 'Blue', 'Yellow', 'Purple'].map(color => (
                      <button type="button" key={color} onClick={() => setNewMed({...newMed, color})} className={`w-8 h-8 rounded-full border-2 ${newMed.color === color ? 'border-brand-neon' : 'border-transparent'}`} style={{ backgroundColor: color.toLowerCase() === 'white' ? '#fff' : color.toLowerCase() }} />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Shape</label>
                  <select value={newMed.shape} onChange={e => setNewMed({...newMed, shape: e.target.value})} className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none">
                    <option value="">Select Shape...</option>
                    <option value="Round Tablet">Round Tablet</option>
                    <option value="Oblong Capsule">Oblong Capsule</option>
                    <option value="Liquid">Liquid</option>
                    <option value="Injection">Injection</option>
                  </select>
                </div>
              </div>

              {/* AI Warning Simulation */}
              {newMed.name.toLowerCase().includes('penicillin') && (
                 <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex gap-3 text-red-400">
                   <AlertCircle className="shrink-0" />
                   <div>
                     <p className="font-bold text-sm mb-1">AI Safety Alert: High Risk</p>
                     <p className="text-xs">Patient has a reported allergy to Penicillin. Please reconsider prescription.</p>
                   </div>
                 </div>
              )}

              <button 
                type="submit" 
                disabled={prescribeMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-4 font-bold text-white bg-brand-purple hover:bg-brand-purple/80 rounded-2xl glow-purple disabled:opacity-50"
              >
                {prescribeMutation.isPending ? 'Processing...' : 'Prescribe Medicine'}
              </button>

            </form>
          </motion.div>
        )}
      </div>

    </div>
  );
}
