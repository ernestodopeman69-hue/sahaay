import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function BreathingFlow({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    let timer: any;
    const runCycle = () => {
      setPhase('Inhale');
      timer = setTimeout(() => {
        setPhase('Hold');
        timer = setTimeout(() => {
          setPhase('Exhale');
          timer = setTimeout(runCycle, 4000);
        }, 2000);
      }, 4000);
    };

    runCycle();
    
    const countdown = setInterval(() => {
      setSeconds(s => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdown);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden bg-gradient-to-b from-dark-900 to-blue-900/10">
      <button 
        onClick={onExit} 
        className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all border border-white/10 z-20"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <div className="text-center mb-16 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <SparklesIcon className="w-5 h-5 text-primary-light animate-pulse" />
          <h2 className="text-4xl font-extrabold text-white tracking-tighter">Breathing Flow</h2>
        </div>
        <div className="px-6 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md inline-block">
          <p className="text-primary-light text-sm font-bold tracking-widest uppercase">
            {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')} remaining
          </p>
        </div>
      </div>

      <div className="relative flex items-center justify-center w-full">
        {/* Animated Rings */}
        <motion.div 
          className="absolute w-96 h-96 rounded-full border border-primary/10"
          animate={{ scale: phase === 'Inhale' ? 1.5 : phase === 'Hold' ? 1.5 : 1 }}
          transition={{ duration: phase === 'Inhale' ? 4 : phase === 'Exhale' ? 4 : 2, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-80 h-80 rounded-full border border-primary/20"
          animate={{ scale: phase === 'Inhale' ? 1.3 : phase === 'Hold' ? 1.3 : 1 }}
          transition={{ duration: phase === 'Inhale' ? 4 : phase === 'Exhale' ? 4 : 2, ease: "easeInOut" }}
        />

        <motion.div 
          className="w-64 h-64 rounded-full bg-gradient-to-br from-primary/30 to-primary-light/10 border-2 border-primary-light/40 flex flex-col items-center justify-center relative shadow-[0_0_80px_rgba(102,252,241,0.1)]"
          animate={{ scale: phase === 'Inhale' ? 1.4 : phase === 'Hold' ? 1.4 : 1 }}
          transition={{ duration: phase === 'Inhale' ? 4 : phase === 'Exhale' ? 4 : 2, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 rounded-full bg-primary-light/5 blur-3xl" />
          <AnimatePresence mode="wait">
            <motion.span 
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-black tracking-[0.3em] text-white uppercase relative z-10"
            >
              {phase}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-28 space-y-8 text-center max-w-md relative z-10">
        <p className="text-text-muted text-base italic font-medium leading-relaxed px-10">
          "Focus on the gentle expansion of your chest. Let go of every thought as you exhale."
        </p>
        
        <div className="px-10">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-primary-light"
              animate={{ width: phase === 'Inhale' ? '100%' : phase === 'Hold' ? '100%' : '0%' }}
              transition={{ duration: phase === 'Inhale' ? 4 : phase === 'Exhale' ? 4 : 2, ease: "linear" }}
            />
          </div>
        </div>
      </div>

      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
