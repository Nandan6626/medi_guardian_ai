import { useState, useEffect } from 'react';
import { Video, Clock, Edit, Loader2, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Appointment {
  id: string;
  patient_id: string;
  appointment_time: string;
  type: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  meeting_link?: string;
  clinical_notes?: string;
}

export function WorkspaceAppointments({ patientId }: { patientId: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_time', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching patient appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    const channel = supabase
      .channel('appointments-doctor')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `patient_id=eq.${patientId}` },
        (payload: any) => {
          console.log('Realtime appointment change for patient:', payload);
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  const updateStatus = async (id: string, newStatus: string, generateLink: boolean = false) => {
    setUpdatingId(id);
    try {
      const updateData: any = { status: newStatus };
      if (generateLink) {
        // Mocking a meeting link generation
        updateData.meeting_link = `https://meet.mediguardian.ai/${id}`;
      }
      
      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      fetchAppointments();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const upcoming = appointments.filter(a => ['SCHEDULED', 'ACTIVE'].includes(a.status));
  const past = appointments.filter(a => ['COMPLETED', 'CANCELLED'].includes(a.status));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Appointments</h2>
          <p className="text-gray-400 text-sm">Manage consultations and follow-ups.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={32} className="animate-spin text-brand-neon" />
        </div>
      ) : (
        <>
          <div>
            <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-4">Upcoming ({upcoming.length})</h3>
            {upcoming.length === 0 ? (
              <div className="glass p-8 rounded-3xl border border-dashed border-border-subtle flex justify-center text-text-muted">
                No upcoming appointments scheduled for this patient.
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map(apt => {
                  const aptDate = new Date(apt.appointment_time);
                  const isActive = apt.status === 'ACTIVE';

                  return (
                    <div key={apt.id} className={`glass p-6 rounded-3xl border transition-all ${isActive ? 'border-brand-neon/50 bg-brand-neon/5 shadow-[0_0_20px_rgba(0,240,255,0.05)]' : 'border-border-subtle bg-bg-surface'} flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
                       <div className="flex gap-4 items-center">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isActive ? 'bg-brand-neon text-black' : 'bg-brand-neon/20 text-brand-neon'}`}>
                            {apt.type === 'video' ? <Video size={24} /> : <Users size={24} />}
                          </div>
                          <div>
                            <p className="text-brand-neon text-xs font-bold uppercase tracking-widest mb-1">
                              {aptDate.toLocaleDateString()} • {aptDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            <h3 className="text-xl font-bold text-white">
                              {apt.type === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                            </h3>
                            <p className="text-sm text-gray-400">{apt.clinical_notes || 'No notes provided by patient.'}</p>
                          </div>
                       </div>
                       <div className="flex gap-3 w-full md:w-auto">
                         {isActive ? (
                           <>
                             <a 
                               href={apt.meeting_link || '#'}
                               target="_blank" rel="noreferrer"
                               className="flex-1 md:flex-none px-6 py-3 bg-brand-neon text-black font-bold rounded-xl transition-all glow-neon flex justify-center items-center gap-2"
                             >
                               <Video size={18}/> Join Call
                             </a>
                             <button 
                               onClick={() => updateStatus(apt.id, 'COMPLETED')}
                               disabled={updatingId === apt.id}
                               className="flex-1 md:flex-none px-6 py-3 bg-status-success/20 text-status-success hover:bg-status-success hover:text-black font-bold rounded-xl transition-all"
                             >
                               End Call
                             </button>
                           </>
                         ) : (
                           <button 
                             onClick={() => updateStatus(apt.id, 'ACTIVE', apt.type === 'video')}
                             disabled={updatingId === apt.id}
                             className="flex-1 md:flex-none px-6 py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-xl hover:bg-brand-neon/80 transition-colors text-sm flex justify-center items-center gap-2"
                           >
                             {updatingId === apt.id ? <Loader2 size={18} className="animate-spin" /> : <Video size={18}/>}
                             Start Consultation
                           </button>
                         )}
                       </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-4 mt-8">Past History ({past.length})</h3>
            <div className="glass rounded-3xl border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-300">
                  {past.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-text-muted">No past appointments found.</td>
                    </tr>
                  ) : (
                    past.map(apt => {
                      const aptDate = new Date(apt.appointment_time);
                      return (
                        <tr key={apt.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 flex items-center gap-2"><Clock size={14} className="text-brand-purple"/> {aptDate.toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${apt.type === 'video' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {apt.type}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${apt.status === 'COMPLETED' ? 'bg-status-success/20 text-status-success' : 'bg-status-error/20 text-status-error'}`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="p-4 text-right"><button className="text-gray-500 hover:text-white"><Edit size={16}/></button></td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
