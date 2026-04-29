import { motion } from 'framer-motion';
import { PlayIcon } from '@heroicons/react/24/solid';

interface CalmHubCardProps {
  title: string;
  desc: string;
  previewUrl?: string;
  poster?: string;
  onClick: () => void;
  gradient: string;
}

export default function CalmHubCard({ title, desc, previewUrl, poster, onClick, gradient }: CalmHubCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      className={`group relative h-80 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl cursor-pointer bg-gradient-to-br ${gradient}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 z-0">
        {previewUrl ? (
          <video 
            src={previewUrl} 
            poster={poster}
            muted 
            autoPlay 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-opacity duration-700"
          />
        ) : poster ? (
          <img 
            src={poster} 
            alt={title}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-opacity duration-700"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/20 to-transparent" />
      </div>

      <div className="relative z-10 h-full p-8 flex flex-col justify-end">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-[240px] opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
          {desc}
        </p>
        
        <div className="flex items-center gap-3 text-primary-light font-bold text-xs uppercase tracking-widest">
          <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/30">
            <PlayIcon className="w-4 h-4" />
          </div>
          Explore Sanctuary
        </div>
      </div>
    </motion.div>
  );
}
