import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, CheckCircle } from 'lucide-react';

interface AnimatedMedicineStackProps {
  medicines: any[];
  onTakeMedicine: (id: string) => void;
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
                className={`relative overflow-hidden rounded-xl p-5 transition-colors ${
                  isTop 
                    ? 'bg-zinc-950 border border-zinc-700' 
                    : 'bg-zinc-900 border border-zinc-800'
                }`}
              >
                {/* Visual Color Bar Indicator */}
                {med.color && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1.5" 
                    style={{ backgroundColor: med.color.toLowerCase() === 'white' ? '#fff' : med.color.toLowerCase() }}
                  ></div>
                )}
                
                <div className="flex items-start gap-4 pl-1">
                  
                  {/* Image/Icon Area */}
                  {med.image_url ? (
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                      <img src={med.image_url} alt="Medicine" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-zinc-900 text-sky-400 flex items-center justify-center flex-shrink-0 border border-zinc-800">
                      <Pill size={24} />
                    </div>
                  )}
                  
                  {/* Details Area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-zinc-100">{med.name}</h4>
                      {med.shape && <span className="text-[10px] capitalize bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{med.shape}</span>}
                    </div>
                    
                    <p className="text-xs text-zinc-300 font-medium mb-2">{med.dosage} · {med.timing}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                       {med.food_instruction && (
                         <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[11px] text-zinc-400 font-normal">
                           {med.food_instruction}
                         </span>
                       )}
                       {med.notes && <span className="text-[11px] text-zinc-500">{med.notes}</span>}
                    </div>
                  </div>

                  {/* Action Area */}
                  {isTop && (
                    <button 
                      onClick={() => {
                        onTakeMedicine(med.id);
                        moveTopToBottom();
                      }}
                      className="w-10 h-10 rounded-lg flex items-center justify-center bg-sky-700 hover:bg-sky-700 text-white transition-colors shrink-0"
                      title="Log as taken"
                    >
                      <CheckCircle size={20} />
                    </button>
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
