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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="w-full max-w-md p-6 border bg-zinc-950 rounded-xl border-zinc-800 shadow-lg"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-100">
                <UserPlus size={18} className="text-sky-400" /> Prescribe medication
              </h2>
              <button onClick={onClose} className="text-zinc-400 transition-colors hover:text-zinc-200 p-1 rounded-md bg-zinc-900 border border-zinc-800">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {!isUuid(patientId) && (
                <div>
                  <label className="block mb-1 text-xs font-medium text-zinc-300">Select patient</label>
                  {isLoadingPatients ? (
                    <div className="flex items-center gap-2 py-2 text-zinc-400 text-xs">
                      <Loader2 size={14} className="animate-spin text-sky-400" /> Loading patients...
                    </div>
                  ) : patients.length === 0 ? (
                    <p className="text-red-400 text-xs font-medium">No connected patients found. Please link a patient first.</p>
                  ) : (
                    <select
                      name="selectedPatientId"
                      value={selectedPatientId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-100">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="block mb-1 text-xs font-medium text-zinc-300">Medication name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-sky-500 transition-colors placeholder:text-zinc-600"
                  placeholder="Lisinopril"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-zinc-300">Dosage</label>
                  <input
                    type="text"
                    name="dosage"
                    required
                    value={formData.dosage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-sky-500 transition-colors placeholder:text-zinc-600"
                    placeholder="10mg"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-zinc-300">Timing</label>
                  <input
                    type="text"
                    name="timing"
                    required
                    value={formData.timing}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-sky-500 transition-colors placeholder:text-zinc-600"
                    placeholder="08:00 AM"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-zinc-300">Duration</label>
                <input
                  type="text"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-sky-500 transition-colors placeholder:text-zinc-600"
                  placeholder="30 days"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-zinc-300">Clinical notes and instructions</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-sky-500 transition-colors placeholder:text-zinc-600"
                  placeholder="Take after food, monitor BP weekly."
                  rows={2}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={mutation.isPending || (!selectedPatientId && !isUuid(patientId))}
                  className="w-full py-2 font-medium text-xs text-white transition-colors bg-sky-700 rounded-lg hover:bg-sky-600 disabled:opacity-50"
                >
                  {mutation.isPending ? 'Sending prescription...' : 'Issue prescription'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
