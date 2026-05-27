import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATIC_TOP_LOGO = '/img/logo_internacional.svg'; // Imagen estática superior

const SPONSOR_DATA = [
  { path: '/img/sponsors/Roboticx.svg', type: 'organizer', label: 'Organized by', duration: 4000 },
  { path: '/img/sponsors/Educacion.svg', type: 'sponsor', label: 'In partnership with', duration: 4000 },
  { path: '/img/sponsors/Jalisco.svg', type: 'sponsor', label: 'In partnership with', duration: 4000 },
  { path: '/img/sponsors/amdocs.svg', type: 'sponsor', label: 'Supported by', duration: 4000 },
  { path: '/img/sponsors/zebra.svg', type: 'sponsor', label: 'Supported by', duration: 4000 },
  { path: '/img/sponsors/guadalajara.svg', type: 'sponsor', label: 'Supported by', duration: 4000 },
  { path: '/img/sponsors/3m.svg', type: 'sponsor', label: 'Supported by', duration: 4000 },
  { path: '/img/sponsors/global.svg', type: 'sponsor', label: 'Supported by', duration: 4000 },
  { path: '/img/sponsors/epam.svg', type: 'sponsor', label: 'Supported by', duration: 4000 },
  { path: '/img/sponsors/norte.svg', type: 'sponsor', label: 'Supported by', duration: 4000 },
  { path: '/img/sponsors/all.svg', type: 'sponsor', label: '', duration: 10000 }, // Última imagen con más tiempo
];

export default function SponsorsDisplay() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (SPONSOR_DATA.length <= 1) return;

    const currentDuration = SPONSOR_DATA[currentIndex].duration || 5000;
    
    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % SPONSOR_DATA.length);
    }, currentDuration);

    return () => clearTimeout(timeout);
  }, [currentIndex]);

  if (SPONSOR_DATA.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white" style={{ fontFamily: "'Roboto', sans-serif" }}>
        <h2 className="text-4xl font-black text-slate-200 uppercase tracking-[0.5em]">
          Patrocinadores
        </h2>
      </div>
    );
  }

  const currentSponsor = SPONSOR_DATA[currentIndex];
  const isLast = currentIndex === SPONSOR_DATA.length - 1;

  return (
    <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');`}</style>
    <div className="h-full w-full flex items-center justify-center bg-white overflow-hidden relative" style={{ fontFamily: "'Roboto', sans-serif" }}>
      
      {/* Background Decorativo desde archivo al fondo */}
      <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center pointer-events-none z-0">
        <img 
          src="/img/sponsors/background.svg" 
          alt="Background Decor" 
          className="max-h-[55vh] w-full object-contain object-bottom"
        />
      </div>

      <div className="w-full h-full flex flex-col items-center justify-start py-10 px-10 relative z-10">
        
        {/* 1. Imagen Estática Superior: Se achica un poco cuando es la última imagen */}
        <motion.div 
          animate={{ height: isLast ? 100 : 128 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="flex items-center justify-center overflow-hidden mb-6"
        >
           <img 
            src={STATIC_TOP_LOGO} 
            alt="Event Logo" 
            className="h-full w-auto object-contain opacity-80"
           />
        </motion.div>

        <div className="flex-1 flex flex-col items-center justify-start w-full gap-4">
          {/* 2. Sección del Label: Solo se anima cuando el texto CAMBIA y NO es la última imagen */}
          <div className="h-12 flex items-center justify-center z-20">
            <AnimatePresence mode="wait">
              {!isLast && (
                <motion.div
                  key={currentSponsor.label}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <span className={`text-xl font-black uppercase tracking-[0.4em] translate-y-4 ${currentSponsor.type === 'organizer' ? 'text-[#66B4B2]' : 'text-slate-400'}`}>
                    {currentSponsor.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Sección de la Imagen del Carrusel: Siempre hace fade out/in */}
          <div className={`flex-1 flex items-center justify-center w-full z-10 transition-all duration-1000 ${isLast ? 'max-h-[60vh] -translate-y-6' : 'max-h-[45vh] translate-y-10'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="w-full h-full flex items-center justify-center"
              >
                <img
                  src={currentSponsor.path}
                  alt="Sponsor"
                  className={`object-contain transition-all duration-1000 ${isLast ? 'max-w-[90%] max-h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]' : 'max-w-[60%] max-h-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.03)]'}`}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
