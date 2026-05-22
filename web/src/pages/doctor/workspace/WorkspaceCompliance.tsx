import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Check, X, Minus, Calendar, Pill } from 'lucide-react';

export function WorkspaceCompliance({ patientId }: { patientId: string }) {
  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  // Query schedules
  const { data: schedules = [], isLoading: isSchedulesLoading } = useQuery({
    queryKey: ['workspace_patient_schedules', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicine_schedules')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'ACTIVE');
      if (error) throw error;
      return data || [];
    }
  });

  // Query logs for last 7 days
  const { data: logs = [], isLoading: isLogsLoading } = useQuery({
    queryKey: ['workspace_patient_logs', patientId],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('medicine_logs')
        .select('*')
        .eq('patient_id', patientId)
        .gte('scheduled_time', sevenDaysAgo.toISOString());
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isSchedulesLoading || isLogsLoading) {
    return (
      <div className="p-8 text-center text-brand-neon font-bold">
        Loading Compliance Calendar...
      </div>
    );
  }

  // Check compliance cell status
  const getCellStatus = (scheduleId: string, date: Date, timeSlot: string) => {
    // Parse timeSlot e.g. "09:00:00"
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const scheduledTime = new Date(date);
    scheduledTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const isFuture = scheduledTime > now;

    // Find log matching scheduleId and close to scheduledTime
    const match = logs.find((l) => {
      if (l.schedule_id !== scheduleId) return false;
      const logScheduled = new Date(l.scheduled_time);
      // check if on same day and hour/minute match within 30 minutes
      const diffMs = Math.abs(logScheduled.getTime() - scheduledTime.getTime());
      return diffMs < 30 * 60 * 1000;
    });

    if (match) {
      return {
        status: match.status, // 'TAKEN' | 'MISSED' | 'SKIPPED'
        takenTime: match.taken_time ? new Date(match.taken_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
      };
    }

    if (isFuture) {
      return { status: 'PENDING', takenTime: null };
    }

    // Overdue/Missed
    return { status: 'MISSED', takenTime: null };
  };

  const formatDateLabel = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-[#121225]/40">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-purple/15 text-brand-neon flex items-center justify-center border border-brand-purple/20">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg">7-Day Medication Compliance Grid</h3>
            <p className="text-text-secondary text-xs font-semibold">Track daily clinical dose intake and compliance history.</p>
          </div>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-sm font-semibold">
            No active medication schedules found for this patient.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-[#1A1A2E]/50">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-[#1A1A2E] text-text-muted text-xs uppercase font-extrabold tracking-wider">
                  <th className="py-4 px-6 min-w-[200px]">Medication / Timing</th>
                  {last7Days.map((date, idx) => (
                    <th key={idx} className="py-4 px-4 text-center min-w-[120px]">
                      {formatDateLabel(date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {schedules.map((schedule) => {
                  let slots: string[] = [];
                  if (Array.isArray(schedule.timing_slots)) {
                    slots = schedule.timing_slots;
                  } else if (typeof schedule.timing_slots === 'string') {
                    try {
                      slots = JSON.parse(schedule.timing_slots);
                    } catch {
                      slots = [schedule.timing_slots];
                    }
                  } else {
                    slots = ['09:00:00'];
                  }

                  return slots.map((slot, sIdx) => (
                    <tr key={`${schedule.id}-${sIdx}`} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-purple/10 text-brand-neon flex items-center justify-center shrink-0">
                          <Pill size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{schedule.medicine_name}</p>
                          <p className="text-xs text-text-secondary font-semibold">
                            {schedule.dosage} • Time: {slot.slice(0, 5)}
                          </p>
                        </div>
                      </td>
                      {last7Days.map((date, dIdx) => {
                        const cell = getCellStatus(schedule.id, date, slot);
                        return (
                          <td key={dIdx} className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center justify-center">
                              {cell.status === 'TAKEN' && (
                                <div className="w-8 h-8 rounded-full bg-status-success/15 border border-status-success/30 flex items-center justify-center text-status-success tooltip cursor-default shadow-sm" title={`Taken at ${cell.takenTime}`}>
                                  <Check size={16} />
                                </div>
                              )}
                              {cell.status === 'MISSED' && (
                                <div className="w-8 h-8 rounded-full bg-status-error/15 border border-status-error/30 flex items-center justify-center text-status-error shadow-sm" title="Missed dose">
                                  <X size={16} />
                                </div>
                              )}
                              {cell.status === 'PENDING' && (
                                <div className="w-8 h-8 rounded-full bg-[#1A1A2E] border border-border-subtle flex items-center justify-center text-text-muted shadow-sm" title="Scheduled / Future">
                                  <Minus size={16} />
                                </div>
                              )}
                              {cell.status === 'TAKEN' && cell.takenTime && (
                                <span className="text-[10px] text-status-success font-bold mt-1.5">{cell.takenTime}</span>
                              )}
                              {cell.status === 'MISSED' && (
                                <span className="text-[10px] text-status-error font-bold mt-1.5">Missed</span>
                              )}
                              {cell.status === 'PENDING' && (
                                <span className="text-[10px] text-text-muted font-bold mt-1.5">Pending</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
