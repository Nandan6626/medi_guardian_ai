import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';
import api from '../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface PrescribeMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
}

export function PrescribeMedicineModal({ isOpen, onClose, patientId }: PrescribeMedicineModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    timing: '',
    duration: '',
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: (newMedicine: typeof formData) => {
      return api.post(`/doctor/patients/${patientId}/prescriptions`, newMedicine);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'dashboard'] });
      onClose();
      setFormData({ name: '', dosage: '', timing: '', duration: '', notes: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
                  disabled={mutation.isPending}
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
