import { Activity, ShieldCheck, Stethoscope, User, HeartPulse, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center max-w-7xl mx-auto">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-100 mb-4">
          MediGuardian AI
        </h1>
        
        <p className="max-w-2xl mx-auto mb-8 text-base md:text-lg text-zinc-400 font-normal leading-relaxed">
          Medication schedules, adherence telemetry, and clinical monitoring for doctors, patients, and families.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/patient" className="w-full sm:w-auto">
            <button className="flex items-center justify-center w-full gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-sky-700 hover:bg-sky-700">
              <User size={16} />
              <span>Patient portal</span>
            </button>
          </Link>
          
          <Link to="/doctor" className="w-full sm:w-auto">
            <button className="flex items-center justify-center w-full gap-2 px-6 py-2.5 text-sm font-medium text-zinc-200 transition-colors border rounded-lg bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700">
              <Stethoscope size={16} />
              <span>Doctor portal</span>
            </button>
          </Link>

          <Link to="/family" className="w-full sm:w-auto">
            <button className="flex items-center justify-center w-full gap-2 px-6 py-2.5 text-sm font-medium text-zinc-200 transition-colors border rounded-lg bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700">
              <HeartPulse size={16} />
              <span>Family portal</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Real Product Interface Showcase (No stock illustration) */}
      <div className="w-full max-w-5xl text-left mt-4 border border-zinc-800 rounded-2xl bg-zinc-900/60 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-zinc-700"></span>
            <span className="w-3 h-3 rounded-full bg-zinc-700"></span>
            <span className="w-3 h-3 rounded-full bg-zinc-700"></span>
            <span className="text-xs font-mono text-zinc-500 ml-2">app.mediguardian.ai/clinical-overview</span>
          </div>
          <span className="text-xs text-zinc-400">Live monitoring</span>
        </div>

        {/* Varied card widths: 8 cols spotlight + 4 cols status */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Spotlight Card: 8 Columns */}
          <div className="md:col-span-8 p-6 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">Patient overview: Amit Patel</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">ID: MG-PAT-1001 · Prescribing physician: Dr. Rajesh Kumar</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  Stable
                </span>
              </div>

              {/* Inner cards fit outer ones (rounded-lg inside rounded-xl) */}
              <div className="grid grid-cols-3 gap-4 my-6">
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <p className="text-xs text-zinc-400 mb-1">Adherence</p>
                  <p className="text-2xl font-semibold text-zinc-100">94%</p>
                  <p className="text-xs text-zinc-500 mt-1">+3% vs last week</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <p className="text-xs text-zinc-400 mb-1">Blood pressure</p>
                  <p className="text-2xl font-semibold text-zinc-100">120/80</p>
                  <p className="text-xs text-zinc-500 mt-1">Normal vs baseline</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <p className="text-xs text-zinc-400 mb-1">Active prescriptions</p>
                  <p className="text-2xl font-semibold text-zinc-100">3</p>
                  <p className="text-xs text-zinc-500 mt-1">0 missed doses</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs text-zinc-400">
              <span className="flex items-center gap-2">
                <Clock size={14} className="text-zinc-500" />
                Next dose: Metformin 500mg at 20:00
              </span>
              <span className="text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer">
                View schedule <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Secondary Card: 4 Columns */}
          <div className="md:col-span-4 p-6 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-100 mb-4">Adherence checklist</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-zinc-200">Morning regimen</p>
                    <p className="text-zinc-500">Completed at 08:05</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                  <Clock size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-zinc-200">Afternoon regimen</p>
                    <p className="text-zinc-500">Scheduled for 14:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                  <Activity size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-zinc-200">Vitals telemetry</p>
                    <p className="text-zinc-500">Synched 12 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
              <p>Escalation contacts: Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Row - Equal cards equal padding on 4-pixel grid */}
      <div className="grid max-w-5xl grid-cols-1 gap-6 mt-12 md:grid-cols-3 w-full text-left">
        {[
          { title: 'Adherence tracking', desc: 'Dose confirmations, schedule verification, and physician notification on missed items.' },
          { title: 'Clinical telemetry', desc: 'Blood pressure and glucose trends logged against prescribed medication intervals.' },
          { title: 'Care coordination', desc: 'Shared access for family members and caregivers with automatic escalation channels.' },
        ].map((feature, i) => (
          <div 
            key={i}
            className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800"
          >
            <h3 className="mb-2 text-base font-semibold text-zinc-100">{feature.title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-normal">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
