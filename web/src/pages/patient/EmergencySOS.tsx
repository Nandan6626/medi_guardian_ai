import { useState } from 'react';
import { PhoneCall, MapPin, ShieldAlert, Navigation, Loader2, Hospital as HospitalIcon, Star, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Hospital {
  name: string;
  location: { lat: number; lng: number };
  place_id?: string;
  rating?: number;
  vicinity?: string;
}

export function EmergencySOS() {
  const [isLoading, setIsLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const MOCK_HOSPITALS: Hospital[] = [
    { name: "City General Hospital", location: { lat: 37.7749, lng: -122.4194 }, vicinity: "123 Main St", rating: 4.5 },
    { name: "St. Jude Medical Center", location: { lat: 37.7849, lng: -122.4094 }, vicinity: "456 Oak Ave", rating: 4.8 },
    { name: "Mercy Emergency Clinic", location: { lat: 37.7649, lng: -122.4294 }, vicinity: "789 Pine Rd", rating: 4.2 }
  ];

  const handleFindHospitals = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setHospitals([]);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await api.get(`/emergency/nearby-hospitals`, {
            params: { lat: latitude, lng: longitude, radius: 5000 }
          });
          
          if (response.data && response.data.length > 0) {
            setHospitals(response.data);
          } else {
            // Empty response
            setHospitals(MOCK_HOSPITALS);
            setErrorMsg("API returned empty results. Showing mock data for demonstration.");
          }
        } catch (error: any) {
          console.error("Failed to fetch hospitals:", error);
          // Fallback to mock data if API key fails
          setHospitals(MOCK_HOSPITALS);
          setErrorMsg("Google Places API failed (likely missing API key). Showing mock data.");
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => {
        setIsLoading(false);
        switch(geoError.code) {
          case geoError.PERMISSION_DENIED:
            setErrorMsg("Location permission denied. Please enable location sharing in your browser.");
            break;
          case geoError.POSITION_UNAVAILABLE:
            setErrorMsg("Location information is unavailable.");
            break;
          case geoError.TIMEOUT:
            setErrorMsg("The request to get user location timed out.");
            break;
          default:
            setErrorMsg("An unknown error occurred while accessing location.");
        }
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen flex flex-col">
      
      {/* Panic Button Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-12">
         <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-status-error rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
            <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-50 animate-ping" style={{ animationDuration: '3s' }}></div>
            
            <button className="relative w-64 h-64 bg-gradient-to-br from-red-500 to-red-800 rounded-full shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5),0_20px_50px_rgba(244,63,94,0.5)] border-4 border-red-400 flex flex-col items-center justify-center transform group-hover:scale-105 group-active:scale-95 transition-all duration-300">
               <ShieldAlert size={80} className="text-white mb-2" />
               <span className="text-3xl font-black text-white tracking-widest">SOS</span>
            </button>
         </div>
         <p className="text-red-400 mt-12 font-bold tracking-widest uppercase text-sm">Hold for 3 seconds to alert emergency contacts</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
         <div className="glass-panel p-6 rounded-3xl border border-status-error/20 bg-status-error/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><PhoneCall size={18} className="text-status-error"/> Emergency Contacts</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-bg-surface p-4 rounded-2xl border border-border-subtle">
                 <div>
                   <p className="font-bold text-white">Sarah (Mom)</p>
                   <p className="text-sm text-text-secondary">+1 (555) 911-0000</p>
                 </div>
                 <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-status-success/20 hover:text-status-success transition-colors"><PhoneCall size={16}/></button>
               </div>
               <div className="flex justify-between items-center bg-bg-surface p-4 rounded-2xl border border-border-subtle">
                 <div>
                   <p className="font-bold text-white">Dr. Sarah Jenkins</p>
                   <p className="text-sm text-text-secondary">Cardiologist</p>
                 </div>
                 <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-status-success/20 hover:text-status-success transition-colors"><PhoneCall size={16}/></button>
               </div>
            </div>
         </div>

         <div className="glass-panel p-6 rounded-3xl border border-border-subtle relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/13/4093/2724.png')] opacity-20 grayscale bg-cover bg-center"></div>
            <div className="relative z-10 flex flex-col h-full justify-between flex-1">
              <div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><MapPin size={18} className="text-brand-neon"/> Location Sharing Active</h3>
                <p className="text-sm text-text-secondary">Your live location is ready to be broadcasted to your emergency network and nearby hospitals.</p>
              </div>
              <button 
                onClick={handleFindHospitals}
                disabled={isLoading}
                className="w-full bg-bg-surface border border-border-subtle hover:border-brand-neon hover:text-brand-neon text-white font-bold py-4 rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                 {isLoading ? (
                   <Loader2 size={18} className="animate-spin text-brand-neon" />
                 ) : (
                   <Navigation size={18} className="text-brand-neon group-hover:scale-110 transition-transform" /> 
                 )}
                 {isLoading ? "Locating..." : "Find Nearby Hospitals"}
              </button>
              
              {errorMsg && (
                <div className="mt-4 p-3 bg-status-warning/10 border border-status-warning/30 rounded-xl text-status-warning text-xs font-medium">
                  {errorMsg}
                </div>
              )}
            </div>
         </div>
      </div>

      {/* Results List */}
      <AnimatePresence>
        {hospitals.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 glass-panel rounded-3xl border border-border-subtle p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <HospitalIcon size={20} className="text-status-error" /> 
              Nearest Facilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospitals.map((hospital, idx) => (
                <div key={idx} className="bg-bg-surface p-5 rounded-2xl border border-border-subtle hover:border-brand-neon/50 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-status-error/10 rounded-xl text-status-error">
                      <HospitalIcon size={20} />
                    </div>
                    {hospital.rating && (
                      <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold bg-yellow-400/10 px-2 py-1 rounded-full">
                        <Star size={12} className="fill-current" /> {hospital.rating}
                      </div>
                    )}
                  </div>
                  <h4 className="text-white font-bold truncate mb-1" title={hospital.name}>{hospital.name}</h4>
                  <p className="text-text-secondary text-xs mb-4 line-clamp-1">{hospital.vicinity || 'Location details unavailable'}</p>
                  
                  <button className="w-full py-2 bg-white/5 hover:bg-brand-neon text-white hover:text-black rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-brand-neon group-hover:text-black">
                    Navigate <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
