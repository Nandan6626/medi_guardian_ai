import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, Video, Users, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookAppointmentModal({ isOpen, onClose, onSuccess }: BookAppointmentModalProps) {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    doctorId: '93b86321-f726-4043-a410-b14d1b8d1aa0', // Dr. Sarah Jenkins UUID
    date: '',
    time: '',
    type: 'video',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const appointmentTime = new Date(`${formData.date}T${formData.time}`).toISOString();

      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: formData.doctorId,
          appointment_time: appointmentTime,
          type: formData.type,
          status: 'SCHEDULED',
          clinical_notes: formData.notes || null,
        });

      if (insertError) throw insertError;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error booking appointment:', err);
      setError(err.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-panel rounded-3xl border border-border-subtle p-8 overflow-y-auto max-h-[90vh]"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-2">Book Consultation</h2>
            <p className="text-text-secondary mb-8">Schedule an appointment with your healthcare provider.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Doctor Selection (Mocked for now) */}
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Select Provider</label>
                <div className="relative">
                  <select 
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full appearance-none bg-bg-input border border-border-subtle text-white rounded-xl py-4 pl-4 pr-10 focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none"
                    required
                  >
                    <option value="93b86321-f726-4043-a410-b14d1b8d1aa0">Dr. Sarah Jenkins (Cardiology)</option>
                    <option value="1d7196dd-501e-47f7-9896-92b8f4bbba27">Dr. Michael Chen (General Practice)</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-muted">
                    ▼
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-bg-input border border-border-subtle text-white rounded-xl py-4 pl-12 pr-4 focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none custom-date-input"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                      type="time" 
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-bg-input border border-border-subtle text-white rounded-xl py-4 pl-12 pr-4 focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none custom-time-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-3">Consultation Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-2 transition-all ${formData.type === 'video' ? 'border-brand-neon bg-brand-neon/10 text-brand-neon shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'border-border-subtle bg-bg-surface text-text-muted hover:border-brand-neon/50 hover:text-white'}`}>
                    <input type="radio" name="type" value="video" checked={formData.type === 'video'} onChange={() => setFormData({...formData, type: 'video'})} className="sr-only"/>
                    <Video size={24} />
                    <span className="font-bold">Video Call</span>
                  </label>
                  <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-2 transition-all ${formData.type === 'in-person' ? 'border-brand-neon bg-brand-neon/10 text-brand-neon shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'border-border-subtle bg-bg-surface text-text-muted hover:border-brand-neon/50 hover:text-white'}`}>
                    <input type="radio" name="type" value="in-person" checked={formData.type === 'in-person'} onChange={() => setFormData({...formData, type: 'in-person'})} className="sr-only"/>
                    <Users size={24} />
                    <span className="font-bold">In Person</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Reason for Visit (Optional)</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-bg-input border border-border-subtle text-white rounded-xl py-4 px-4 focus:border-brand-neon focus:ring-1 focus:ring-brand-neon outline-none resize-none h-24 placeholder:text-text-muted"
                  placeholder="Briefly describe your symptoms or reason for consultation..."
                />
              </div>

              {error && (
                <div className="p-4 bg-status-error/10 border border-status-error/20 rounded-xl text-status-error text-sm font-bold">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-neon hover:bg-white text-black font-bold rounded-xl transition-all glow-neon flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Scheduling...
                  </>
                ) : (
                  'Confirm Appointment'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
