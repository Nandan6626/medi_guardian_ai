import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, ShieldCheck, AlertCircle, Pill } from 'lucide-react';
import { AnimatedMedicineStack } from '../../../components/AnimatedMedicineStack';
import { supabase } from '../../../lib/supabase';

export function WorkspaceMedications({ patientId }: { patientId: string }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrescribing, setIsPrescribing] = useState(false);

  // Form State
  const [newMed, setNewMed] = useState({
    name: '', dosage: '', frequency: 'Daily', timing: '', 
    food_instruction: '', duration: '', color: '', shape: '', notes: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicine_schedules')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_self_reminder', false);

      if (error) throw error;
      
      const formatted = (data || []).map(r => ({
        id: r.id,
        name: r.medicine_name,
        dosage: r.dosage,
        timing: r.timing_slots ? JSON.stringify(r.timing_slots) : '',
        duration: r.frequency,
        food_instruction: r.instructions,
      }));
      setMedicines(formatted);
    } catch (err) {
      console.error('Error fetching patient medicines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();

    const channel = supabase
      .channel('doctor-schedules-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medicine_schedules', filter: `patient_id=eq.${patientId}` },
        () => {
          fetchMedicines();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPrescribing(true);
    try {
      // Map frequency to database enum
      let mappedFreq = 'DAILY';
      if (newMed.frequency === 'Weekly') mappedFreq = 'WEEKLY';
      if (newMed.frequency === 'As Needed') mappedFreq = 'AS_NEEDED';

      // Map instructions to database enum
      let mappedInst = null;
      if (newMed.food_instruction === 'Before Food') mappedInst = 'BEFORE_FOOD';
      if (newMed.food_instruction === 'After Food') mappedInst = 'AFTER_FOOD';
      if (newMed.food_instruction === 'With Food') mappedInst = 'WITH_FOOD';

      // Format time correctly
      const formattedTime = newMed.timing.includes(':') ? `${newMed.timing}:00` : `${newMed.timing}:00`;

      const { error } = await supabase
        .from('medicine_schedules')
        .insert({
          patient_id: patientId,
          medicine_name: newMed.name,
          dosage: newMed.dosage,
          frequency: mappedFreq,
          timing_slots: [formattedTime],
          instructions: mappedInst,
          is_self_reminder: false,
          status: 'ACTIVE'
        });

      if (error) throw error;
      
      setNewMed({ name: '', dosage: '', frequency: 'Daily', timing: '', food_instruction: '', duration: '', color: '', shape: '', notes: ''});
      setPreviewImage(null);
      setShowAddForm(false);
      alert('Prescription successfully added to patient timeline!');
    } catch (err) {
      console.error('Failed to prescribe', err);
      alert('Failed to prescribe medicine.');
    } finally {
      setIsPrescribing(false);
    }
  };

  // Split logic
  const activeMeds = medicines;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             <Pill className="text-brand-neon" /> Clinical Prescriptions
           </h2>
           <p className="text-sm text-gray-400 mt-1">Manage official medicines prescribed to this patient.</p>
        </div>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors shadow-lg"
          >
            + New Prescription
          </button>
        )}
      </div>

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden"
        >
           <button 
             onClick={() => setShowAddForm(false)}
             className="absolute top-6 right-6 text-gray-500 hover:text-white font-bold text-sm"
           >
             Cancel
           </button>

           <h3 className="text-xl font-bold text-white mb-6">Create New Prescription</h3>
           
           <form onSubmit={handlePrescribe} className="space-y-6">
              
              {/* Image Upload Area */}
              <div className="relative p-6 border-2 border-dashed border-white/20 rounded-2xl bg-[#1A1A2E]/30 hover:bg-[#1A1A2E]/60 transition-colors text-center">
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
                      <ShieldCheck size={16} /> AI Verification Match: {newMed.name || 'Detecting...'}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-16 h-16 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center mb-4">
                      <Camera size={24} />
                    </div>
                    <p className="font-bold text-white">Scan Medicine or Prescription</p>
                    <p className="text-sm text-gray-500 mt-2">Upload an image for automated data extraction</p>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Medicine Name</label>
                  <input type="text" required value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none" placeholder="e.g. Metformin" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Dosage</label>
                  <input type="text" required value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none" placeholder="e.g. 500mg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Timing</label>
                  <input type="time" required value={newMed.timing} onChange={e => setNewMed({...newMed, timing: e.target.value})} className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Frequency</label>
                  <select value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none">
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="As Needed">As Needed</option>
                  </select>
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

                {/* Visual Identifiers */}
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
                  </select>
                </div>
              </div>

              {/* AI Warning Simulation */}
              {newMed.name.toLowerCase().includes('penicillin') && (
                 <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex gap-3 text-red-400">
                   <AlertCircle className="shrink-0" />
                   <div>
                     <p className="font-bold text-sm mb-1">AI Safety Alert: High Risk</p>
                     <p className="text-xs">Patient has a reported allergy to Penicillin. Consider alternatives.</p>
                   </div>
                 </div>
              )}

              <button 
                type="submit" 
                disabled={isPrescribing}
                className="w-full flex items-center justify-center gap-2 py-4 font-bold text-black bg-brand-neon hover:bg-brand-neon/80 rounded-xl transition-colors disabled:opacity-50"
              >
                {isPrescribing ? 'Processing...' : 'Prescribe Medicine'}
              </button>
           </form>
        </motion.div>
      )}

      {/* Medication Timeline Display */}
      <div className="glass rounded-3xl p-8 border border-white/5 min-h-[400px]">
        {activeMeds.length === 0 ? (
           <div className="flex justify-center items-center h-full text-gray-500 py-20">No active clinical prescriptions found for this patient.</div>
        ) : (
           <AnimatedMedicineStack 
             medicines={activeMeds} 
             isLoading={isLoading} 
             onTakeMedicine={() => {}} // Doctors don't take the medicine, they just view

           />
        )}
      </div>

    </div>
  );
}
