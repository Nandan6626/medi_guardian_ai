import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

interface PrescribeMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
}

export function PrescribeMedicineModal({ isOpen, onClose, patientId }: PrescribeMedicineModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(patientId || '');
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    timing: '',
    duration: '',
    notes: '',
  });

  const isUuid = (val: any) => typeof val === 'string' && val.length === 36 && val.includes('-');

  useEffect(() => {
    if (isOpen) {
      if (isUuid(patientId)) {
        setSelectedPatientId(patientId || '');
      } else {
        fetchConnectedPatients();
      }
    }
  }, [isOpen, patientId]);

  const fetchConnectedPatients = async () => {
    if (!user) return;
    setIsLoadingPatients(true);
    try {
      // 1. Get doctor profile details to find their user_id
      const { data: doctorProf } = await supabase
        .from('doctor_profiles')
        .select('user_id')
        .eq('id', user.id)
        .single();
      
      if (!doctorProf) return;

      // 2. Fetch active patient connections for this doctor
      const { data: connections } = await supabase
        .from('patient_connections')
        .select('patient_id')
        .eq('connected_user_id', doctorProf.user_id);

      if (!connections || connections.length === 0) return;
      const patientIds = connections.map(c => c.patient_id).filter(Boolean);

      // 3. Fetch patient profiles
      const { data: profiles } = await supabase
        .from('patient_profiles')
        .select('id, first_name, last_name')
        .in('id', patientIds);

      if (profiles) {
        const mapped = profiles.map(p => ({
          id: p.id,
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unnamed Patient'
        }));
        setPatients(mapped);
        if (mapped.length > 0 && !selectedPatientId) {
          setSelectedPatientId(mapped[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching connected patients:', err);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (newMedicine: typeof formData) => {
      const targetPatId = isUuid(patientId) ? patientId : selectedPatientId;
      if (!targetPatId) {
        throw new Error('Please select a patient first.');
      }

      const { error } = await supabase
        .from('medicine_schedules')
        .insert({
          patient_id: targetPatId,
          medicine_name: newMedicine.name,
          dosage: newMedicine.dosage,
          frequency: 'DAILY',
          instructions: 'AFTER_FOOD', // default
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
          status: 'ACTIVE',
          is_self_reminder: false
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['patient_medications'] });
      alert('Prescription successfully saved to database!');
      onClose();
      setFormData({ name: '', dosage: '', timing: '', duration: '', notes: '' });
    },
    onError: (err: any) => {
      alert('Failed to save prescription: ' + (err.message || 'unknown error'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === 'selectedPatientId') {
      setSelectedPatientId(e.target.value);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg p-8 border glass rounded-3xl border-brand-purple/30 glow-purple"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                <UserPlus className="text-brand-purple" /> New Prescription
              </h2>
              <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isUuid(patientId) && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">Select Patient</label>
                  {isLoadingPatients ? (
                    <div className="flex items-center gap-2 py-3 text-text-secondary">
                      <Loader2 size={16} className="animate-spin text-brand-neon" /> Loading patients...
                    </div>
                  ) : patients.length === 0 ? (
                    <p className="text-status-error text-sm font-bold">No connected patients found. Please add a patient first.</p>
                  ) : (
                    <select
                      name="selectedPatientId"
                      value={selectedPatientId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-white transition-colors bg-bg-surface border border-white/10 rounded-xl focus:outline-none focus:border-brand-purple"
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id} className="bg-bg-surface text-white">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Medicine Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-white transition-colors bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-purple"
                  placeholder="e.g. Lisinopril"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">Dosage</label>
                  <input
                    type="text"
                    name="dosage"
                    required
                    value={formData.dosage}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-white transition-colors bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-purple"
                    placeholder="e.g. 10mg"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">Timing</label>
                  <input
                    type="text"
                    name="timing"
                    required
                    value={formData.timing}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-white transition-colors bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-purple"
                    placeholder="e.g. 08:00 AM"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Duration</label>
                <input
                  type="text"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-white transition-colors bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-purple"
                  placeholder="e.g. 30 days"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Clinical Notes & Instructions</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-white transition-colors bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-purple"
                  placeholder="e.g. Take after food, monitor BP weekly."
                  rows={3}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={mutation.isPending || (!selectedPatientId && !isUuid(patientId))}
                  className="w-full py-4 font-bold text-white transition-all border border-brand-purple bg-brand-purple/20 rounded-xl glow-purple hover:bg-brand-purple disabled:opacity-50"
                >
                  {mutation.isPending ? 'Sending Prescription...' : 'Issue Prescription'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
