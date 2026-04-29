import { motion } from 'framer-motion';
import { XMarkIcon, BeakerIcon } from '@heroicons/react/24/outline';

export default function ZenFlow({ onExit }: { onExit: () => void }) {
  const shapes = [
    { id: 1, color: 'bg-blue-400/10', size: 'w-48 h-48', delay: 0 },
    { id: 2, color: 'bg-purple-400/10', size: 'w-64 h-64', delay: 1 },
    { id: 3, color: 'bg-teal-400/10', size: 'w-36 h-36', delay: 0.5 },
    { id: 4, color: 'bg-indigo-400/10', size: 'w-56 h-56', delay: 1.5 },
    { id: 5, color: 'bg-pink-400/10', size: 'w-44 h-44', delay: 2 },
  ];

  return (
    <div className="h-full w-full relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-teal-900/10 rounded-[3rem] border border-white/5">
      <button 
        onClick={onExit} 
        className="absolute top-10 right-10 z-20 p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all border border-white/10"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <div className="absolute top-12 left-12 max-w-sm z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20">
            <BeakerIcon className="w-6 h-6 text-teal-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Zen Flow</h2>
        </div>
        <p className="text-sm text-text-muted leading-relaxed font-medium">Gently guide the elements across the space. There is no destination, only the flow.</p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {shapes.map((s, i) => (
          <motion.div
            key={s.id}
            drag
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 100, bounceDamping: 20 }}
            className={`${s.size} ${s.color} rounded-full backdrop-blur-3xl border border-white/10 cursor-grab active:cursor-grabbing absolute flex items-center justify-center`}
            initial={{ 
              x: (i - 2) * 120, 
              y: (i % 2 === 0 ? 80 : -80) 
            }}
            animate={{
              y: [null, (i % 2 === 0 ? 100 : -100), (i % 2 === 0 ? 80 : -80)],
              transition: {
                duration: 8 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: s.delay
              }
            }}
            whileHover={{ scale: 1.05, border: "1px solid rgba(255,255,255,0.3)" }}
            whileDrag={{ scale: 1.1, zIndex: 50, boxShadow: "0 0 50px rgba(102,252,241,0.15)" }}
          >
            <div className="w-1/2 h-1/2 rounded-full bg-white/5 border border-white/5 blur-sm" />
          </motion.div>
        ))}
      </div>
      
      <div className="absolute bottom-12 w-full text-center pointer-events-none opacity-20 z-0">
        <p className="text-xs uppercase tracking-[0.4em] font-black text-white">Flow • Exist • Breathe</p>
      </div>

      {/* Decorative ambient blobs */}
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
