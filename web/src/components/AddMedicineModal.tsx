import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSelfReminder?: boolean;
}

export function AddMedicineModal({ isOpen, onClose }: AddMedicineModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    timing: '',
    duration: '',
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: async (newMedicine: typeof formData) => {
      if (!user) throw new Error("Authentication required");
      
      const { error } = await supabase.from('reminders').insert({
        patient_id: user.id,
        medicine_name: newMedicine.name,
        dosage: newMedicine.dosage,
        reminder_time: newMedicine.timing ? `${newMedicine.timing}:00` : null, // Ensure valid time format
        frequency: newMedicine.duration,
        reminder_type: 'self',
        status: 'ACTIVE'
      });
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="w-full max-w-md p-6 border bg-zinc-950 rounded-xl border-zinc-800 shadow-lg"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-zinc-100">Add medication</h2>
              <button onClick={onClose} className="text-zinc-400 transition-colors hover:text-zinc-200 p-1 rounded-md bg-zinc-900 border border-zinc-800">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block mb-1 text-xs font-medium text-zinc-300">Medication name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-sky-500 transition-colors placeholder:text-zinc-600"
                  placeholder="Amoxicillin"
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
                    placeholder="500mg"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-zinc-300">Timing</label>
                  <input
                    type="time"
                    name="timing"
                    required
                    value={formData.timing}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
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
                  placeholder="7 days"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-zinc-300">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-sky-500 transition-colors placeholder:text-zinc-600"
                  placeholder="Take after food"
                  rows={2}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full py-2 font-medium text-xs text-white transition-colors bg-sky-700 rounded-lg hover:bg-sky-500 disabled:opacity-50"
                >
                  {mutation.isPending ? 'Adding...' : 'Add medication'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
