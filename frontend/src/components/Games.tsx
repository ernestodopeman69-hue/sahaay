import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, PuzzlePieceIcon, CloudIcon, BeakerIcon } from '@heroicons/react/24/outline';
import BreathingFlow from './games/BreathingFlow';
import StressPop from './games/StressPop';
import ZenFlow from './games/ZenFlow';
import MiniPuzzle from './games/MiniPuzzle';
import axios from 'axios';
import { supabase } from '../supabaseClient';

const gamesList = [
  { id: 'breathing', title: 'Breathing Flow', desc: 'Regulate your heart rate with guided rhythmic breathing.', icon: CloudIcon, component: BreathingFlow, color: 'from-blue-600/20 to-blue-400/5', shadow: 'hover:shadow-blue-500/10' },
  { id: 'pop', title: 'Stress Pop', desc: 'Pop bubbles of tension and clear your mental space.', icon: SparklesIcon, component: StressPop, color: 'from-purple-600/20 to-purple-400/5', shadow: 'hover:shadow-purple-500/10' },
  { id: 'zen', title: 'Zen Flow', desc: 'A sandbox of gentle movement and soft colors.', icon: BeakerIcon, component: ZenFlow, color: 'from-teal-600/20 to-teal-400/5', shadow: 'hover:shadow-teal-500/10' },
  { id: 'puzzle', title: 'Mini Puzzle', desc: 'Focus your mind on a simple, quiet task.', icon: PuzzlePieceIcon, component: MiniPuzzle, color: 'from-indigo-600/20 to-indigo-400/5', shadow: 'hover:shadow-indigo-500/10' },
];

export default function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEmotion = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const res = await axios.get(`http://localhost:3001/api/insights?userId=${user?.id || 'guest'}`);
        const lastEmotion = res.data.trends?.[0]?.emotion || 'neutral';
        
        if (lastEmotion === 'distressed' || lastEmotion === 'sad') setSuggestion('breathing');
        else if (lastEmotion === 'angry') setSuggestion('pop');
        else if (lastEmotion === 'anxious') setSuggestion('zen');
      } catch (e) {
        console.error("Failed to fetch emotion for suggestion");
      }
    };
    fetchEmotion();
  }, []);

  const handleStartGame = (id: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveGame(id);
      setIsLoading(false);
    }, 800);
  };

  const ActiveGameComponent = gamesList.find(g => g.id === activeGame)?.component;

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-text-muted animate-pulse">Preparing your space...</p>
      </div>
    );
  }

  if (activeGame && ActiveGameComponent) {
    return (
      <div className="h-[calc(100vh-12rem)] bg-dark-900 rounded-[3rem] p-6 md:p-12 border border-white/5 relative overflow-hidden shadow-2xl">
        <ActiveGameComponent onExit={() => setActiveGame(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-extrabold text-white tracking-tighter">Calm Games</h1>
        <p className="text-text-muted max-w-xl leading-relaxed text-lg">Interactive spaces designed to ground your thoughts and bring a moment of peace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {gamesList.map((game) => (
          <motion.div
            key={game.id}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`glass-panel p-10 bg-gradient-to-br ${game.color} border border-white/10 rounded-[3.5rem] cursor-pointer group transition-all relative overflow-hidden shadow-2xl ${game.shadow}`}
            onClick={() => handleStartGame(game.id)}
          >
            {suggestion === game.id && (
              <div className="absolute top-8 right-10 flex items-center gap-2 bg-primary/20 text-primary-light px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-primary/30 shadow-[0_0_20px_rgba(102,252,241,0.15)]">
                <SparklesIcon className="w-4 h-4" /> Recommended
              </div>
            )}
            
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-700 border border-white/10">
              <game.icon className="w-10 h-10 text-gray-400 group-hover:text-primary-light transition-colors" />
            </div>
            
            <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">{game.title}</h3>
            <p className="text-text-muted text-base leading-relaxed mb-12 max-w-xs">{game.desc}</p>
            
            <button className="flex items-center gap-4 bg-white/5 group-hover:bg-primary group-hover:text-dark-900 px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border border-white/10 group-hover:border-primary shadow-xl">
              Play Space
            </button>
            
            {/* Background Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
