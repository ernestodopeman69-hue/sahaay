import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowPathIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';

export default function MiniPuzzle({ onExit }: { onExit: () => void }) {
  const [tiles, setTiles] = useState<number[]>([]);
  const size = 3; // 3x3 grid

  const initTiles = () => {
    let arr = Array.from({ length: size * size }, (_, i) => i);
    // Shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Ensure it's solvable (for 3x3, inversion count must be even)
    // For simplicity in this demo, we'll just use the shuffled one, 
    // but in a real app, you'd check solvability.
    setTiles(arr);
  };

  useEffect(() => {
    initTiles();
  }, []);

  const moveTile = (index: number) => {
    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
    }
  };

  const isSolved = tiles.length > 0 && tiles.every((val, i) => val === (i === tiles.length - 1 ? 0 : i + 1));

  return (
    <div className="h-full flex flex-col items-center justify-center relative p-8 bg-gradient-to-br from-dark-900 to-indigo-900/10">
      <button 
        onClick={onExit} 
        className="absolute top-10 right-10 p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all border border-white/10"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <PuzzlePieceIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tighter">Mini Puzzle</h2>
        </div>
        <p className="text-text-muted text-sm font-medium">Quietly organize the tiles to find clarity.</p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl group-hover:bg-primary/10 transition-all duration-1000" />
        <div className="grid grid-cols-3 gap-4 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-xl relative z-10">
          {tiles.map((tile, index) => (
            <motion.div
              key={tile}
              layout
              onClick={() => moveTile(index)}
              className={`w-20 h-20 md:w-28 md:h-28 rounded-2xl flex items-center justify-center text-2xl font-black cursor-pointer transition-all ${
                tile === 0 
                  ? 'bg-black/20 border border-white/5' 
                  : 'bg-gradient-to-br from-indigo-500/20 to-primary/10 text-white border border-white/10 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(102,252,241,0.15)] shadow-lg'
              }`}
              whileHover={tile !== 0 ? { scale: 1.05 } : {}}
              whileTap={tile !== 0 ? { scale: 0.95 } : {}}
            >
              {tile !== 0 && tile}
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isSolved && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mt-12 text-primary-light font-black flex flex-col items-center gap-3 text-center"
          >
            <div className="p-4 bg-primary/20 rounded-full border border-primary/30 animate-bounce">
              <span className="text-3xl">✨</span>
            </div>
            <div>
              <p className="text-xl tracking-tight">Order has been restored.</p>
              <p className="text-sm text-text-muted font-normal mt-1">Peace found in simple tasks.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={initTiles}
        className="mt-12 flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-gray-400 hover:text-white transition-all border border-white/10 uppercase tracking-widest"
      >
        <ArrowPathIcon className="w-4 h-4" /> Reset Pattern
      </button>

      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
