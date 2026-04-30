import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CalmVisuals() {
  const [playing, setPlaying] = useState(true);

  // Fallback to CSS animation for visuals since we don't have video files
  return (
    <div className="h-[calc(100vh-10rem)] bg-dark-900 relative rounded-[3rem] overflow-hidden flex flex-col border border-white/5 shadow-2xl">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-calm-blue/30 via-dark-900 to-calm-purple/30 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary-light/5 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Particle effect placeholder */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-light tracking-[0.4em] text-white/90 mb-6 uppercase"
        >
          Serenity
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
          className="text-white mb-16 max-w-lg leading-relaxed font-light tracking-wide"
        >
          Close your eyes, take a deep breath, and let the colors guide you to a place of inner peace.
        </motion.p>
        
        <button 
          onClick={() => setPlaying(!playing)}
          className="group relative w-20 h-20 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all duration-500 border border-white/10 hover:border-white/30"
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-150 transition-transform duration-700 blur-xl opacity-0 group-hover:opacity-100" />
          {playing ? <PauseIcon className="w-10 h-10 text-white/80 relative z-10" /> : <PlayIcon className="w-10 h-10 text-white/80 relative z-10" />}
        </button>
      </div>

      <div className="relative z-10 p-10 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent">
        <div className="max-w-4xl mx-auto flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { color: 'bg-calm-blue', label: 'Morning Mist' },
            { color: 'bg-calm-purple', label: 'Twilight' },
            { color: 'bg-calm-teal', label: 'Ocean Deep' },
            { color: 'bg-primary', label: 'Golden Hour' }
          ].map((theme, i) => (
            <div key={i} className="flex flex-col gap-2 shrink-0 group cursor-pointer">
              <div className={`w-40 h-24 rounded-2xl ${theme.color}/20 border ${i === 0 ? 'border-primary-light/50 shadow-lg shadow-primary/20' : 'border-white/10'} group-hover:border-primary-light/30 transition-all`}></div>
              <span className={`text-[10px] uppercase tracking-widest text-center ${i === 0 ? 'text-primary-light font-bold' : 'text-gray-500 group-hover:text-gray-300'}`}>{theme.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
