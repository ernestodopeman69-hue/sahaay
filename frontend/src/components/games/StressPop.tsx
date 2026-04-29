import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function StressPop({ onExit }: { onExit: () => void }) {
  const [bubbles, setBubbles] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [particles, setParticles] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const addBubble = () => {
    if (bubbles.length > 15) return;
    const id = Date.now() + Math.random();
    const newBubble = {
      id,
      x: Math.random() * 80 + 10,
      y: 110, // Start from bottom
      size: Math.random() * 60 + 60,
      speed: Math.random() * 0.8 + 0.4,
      drift: Math.random() * 2 - 1,
      color: `hsla(${Math.random() * 60 + 200}, 70%, 60%, 0.4)`
    };
    setBubbles(prev => [...prev, newBubble]);
  };

  useEffect(() => {
    const spawnInterval = setInterval(addBubble, 1000);
    const moveInterval = setInterval(() => {
      setBubbles(prev => prev
        .map(b => ({ ...b, y: b.y - b.speed, x: b.x + b.drift }))
        .filter(b => b.y > -20)
      );
    }, 50);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, []);

  const pop = (e: React.MouseEvent, b: any) => {
    e.stopPropagation();
    setScore(s => s + 1);
    
    // Add particles
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: b.x,
      y: b.y,
      angle: (i / 8) * Math.PI * 2,
      color: b.color
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.includes(p))), 1000);

    setBubbles(prev => prev.filter(bubble => bubble.id !== b.id));
  };

  return (
    <div 
      ref={containerRef}
      className="h-full w-full relative overflow-hidden bg-gradient-to-br from-dark-900 to-purple-900/20 rounded-[3rem] border border-white/5"
    >
      <div className="absolute top-10 left-10 z-10 flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
          <SparklesIcon className="w-6 h-6 text-primary-light" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold mb-1">Stress Popped</p>
          <h2 className="text-4xl font-black text-white leading-none">{score}</h2>
        </div>
      </div>
      
      <button 
        onClick={onExit} 
        className="absolute top-10 right-10 z-20 p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all border border-white/10"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
         <p className="text-lg font-medium text-white/10 italic tracking-wide">Gently pop the rising tension...</p>
      </div>

      <AnimatePresence>
        {bubbles.map(b => (
          <motion.div
            key={b.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            onClick={(e) => pop(e, b)}
            className="absolute rounded-full cursor-pointer backdrop-blur-[2px] border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
            style={{ 
              left: `${b.x}%`, 
              top: `${b.y}%`, 
              width: b.size, 
              height: b.size,
              backgroundColor: b.color,
              boxShadow: `inset 0 0 20px rgba(255,255,255,0.2)`
            }}
            whileHover={{ scale: 1.1, backgroundColor: b.color.replace('0.4', '0.6') }}
          >
            <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white/20 rounded-full blur-[2px]" />
          </motion.div>
        ))}

        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: `${p.x}%`, y: `${p.y}%`, scale: 1, opacity: 1 }}
            animate={{ 
              x: `${p.x + Math.cos(p.angle) * 10}%`, 
              y: `${p.y + Math.sin(p.angle) * 10}%`,
              scale: 0,
              opacity: 0 
            }}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{ backgroundColor: p.color }}
          />
        ))}
      </AnimatePresence>

      {/* Background ambient light */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
