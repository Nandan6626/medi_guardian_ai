import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, CheckCircle } from 'lucide-react';

interface AnimatedMedicineStackProps {
  medicines: any[];
  onTakeMedicine: (id: number) => void;
  isLoading: boolean;
}

export function AnimatedMedicineStack({ medicines, onTakeMedicine, isLoading }: AnimatedMedicineStackProps) {
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    if (medicines.length > 0) {
      setCards(medicines);
    }
  }, [medicines]);

  // Rotate the top card to the bottom
  const moveTopToBottom = () => {
    setCards((prev) => {
      if (prev.length <= 1) return prev;
      const newCards = [...prev];
      const topCard = newCards.shift();
      newCards.push(topCard);
      return newCards;
    });
  };

  // Auto-cycle every 4 seconds
  useEffect(() => {
    if (cards.length <= 1) return;
    const interval = setInterval(() => {
      moveTopToBottom();
    }, 4000);
    return () => clearInterval(interval);
  }, [cards]);

  if (isLoading) {
    return <div className="py-8 text-center text-gray-400 glass rounded-2xl">Loading medicines...</div>;
  }

  if (medicines.length === 0) {
    return <div className="py-8 text-center text-gray-400 glass rounded-2xl">No medicines scheduled for today. Add one above!</div>;
  }

  return (
    <div className="relative w-full h-[220px] flex justify-center perspective-[1000px] overflow-visible mt-8">
      <AnimatePresence>
        {cards.map((med, index) => {
          // Only render top 3 for performance and visuals
          if (index > 2) return null;
          
          const isTop = index === 0;

          // Depth calculations
          const yOffset = index * 25; 
          const scale = 1 - index * 0.05;
          const zIndex = cards.length - index;
          const opacity = 1 - index * 0.2;

          return (
            <motion.div
              key={med.id}
              layout
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{
                y: yOffset,
                scale: scale,
                zIndex: zIndex,
                opacity: opacity,
              }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                mass: 1,
              }}
              className="absolute w-full max-w-md shadow-2xl"
              style={{
                transformOrigin: 'top center',
              }}
            >
              <div 
                className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 ${
                  isTop 
                    ? 'bg-[#141425] border border-brand-purple/50 shadow-[0_10px_40px_rgba(112,0,255,0.15)]' 
                    : 'bg-[#1A1A2E]/80 border border-white/5 backdrop-blur-md'
                }`}
              >
                {/* Visual Color Bar Indicator */}
                {med.color && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-2" 
                    style={{ backgroundColor: med.color.toLowerCase() === 'white' ? '#fff' : med.color.toLowerCase() }}
                  ></div>
                )}
                
                <div className="flex items-start gap-5 pl-2">
                  
                  {/* Image/Icon Area */}
                  {med.image_url ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 shadow-inner">
                      <img src={med.image_url} alt="Medicine" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-neon/10 text-brand-neon flex items-center justify-center flex-shrink-0 border border-white/5">
                      <Pill size={32} />
                    </div>
                  )}
                  
                  {/* Details Area */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xl font-bold text-white">{med.name}</h4>
                      {med.shape && <span className="text-[10px] uppercase font-bold tracking-wider bg-white/10 px-2 py-0.5 rounded text-gray-300">{med.shape}</span>}
                    </div>
                    
                    <p className="text-sm text-brand-neon font-bold mb-3">{med.dosage} • {med.timing}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                       {med.food_instruction && (
                         <span className="bg-[#1A1A2E] border border-white/10 px-2 py-1 rounded-md shadow-inner text-gray-300 font-medium">
                           {med.food_instruction}
                         </span>
                       )}
                       {med.notes && <span>{med.notes}</span>}
                    </div>
                  </div>

                  {/* Action Area */}
                  {isTop && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onTakeMedicine(med.id);
                        moveTopToBottom();
                      }}
                      className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br from-brand-neon/20 to-brand-neon/5 text-brand-neon border border-brand-neon/30 hover:bg-brand-neon hover:text-black transition-colors shrink-0"
                    >
                      <CheckCircle size={24} />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
