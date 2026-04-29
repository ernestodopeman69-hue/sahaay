import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SpeakerWaveIcon, SpeakerXMarkIcon, PlayIcon } from '@heroicons/react/24/outline';

const videos = [
  { id: 1, title: 'Ocean Waves', category: 'Water', url: 'https://assets.mixkit.io/videos/preview/mixkit-close-up-of-a-calm-blue-ocean-water-surface-32860-large.mp4' },
  { id: 2, title: 'Rainy Window', category: 'Nature', url: 'https://assets.mixkit.io/videos/preview/mixkit-raindrops-on-a-window-pane-1533-large.mp4' },
  { id: 3, title: 'Forest Path', category: 'Nature', url: 'https://assets.mixkit.io/videos/preview/mixkit-sunlight-streaming-through-trees-in-a-forest-4330-large.mp4' },
  { id: 4, title: 'Liquid Art', category: 'Art', url: 'https://assets.mixkit.io/videos/preview/mixkit-liquid-colors-mixing-together-41614-large.mp4' },
  { id: 5, title: 'Cloud Flow', category: 'Nature', url: 'https://assets.mixkit.io/videos/preview/mixkit-white-clouds-moving-slowly-in-the-blue-sky-4547-large.mp4' },
  { id: 6, title: 'Sand Ripples', category: 'Loops', url: 'https://assets.mixkit.io/videos/preview/mixkit-sand-dunes-in-the-desert-at-sunset-40291-large.mp4' },
];

export default function CalmHubVideos() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="space-y-12 py-10 border-t border-white/5">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">Satisfying Videos</h2>
        <p className="text-gray-400">Relax your mind with curated calming visuals.</p>
      </div>

      {/* Categories Bar */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Water', 'Nature', 'Art', 'Loops'].map(cat => (
          <button key={cat} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition">
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video) => (
          <motion.div
            key={video.id}
            whileHover={{ y: -5 }}
            className="group relative bg-dark-800 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl cursor-pointer"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="aspect-video relative overflow-hidden">
              <video 
                src={video.url} 
                muted 
                autoPlay 
                loop 
                playsInline 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/30">
                  <PlayIcon className="w-6 h-6 text-primary-light" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary-light font-bold">{video.category}</span>
              <h3 className="text-lg font-bold text-white mt-1">{video.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Player */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-20 bg-dark-900/95 backdrop-blur-xl"
          >
            <div className="absolute top-10 right-10 flex gap-4">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition shadow-2xl"
              >
                {isMuted ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
              </button>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition shadow-2xl"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-6xl aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <video 
                src={selectedVideo.url} 
                autoPlay 
                loop 
                controls={false}
                muted={isMuted}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <div className="absolute bottom-10 left-0 w-full text-center">
              <h3 className="text-2xl font-bold text-white">{selectedVideo.title}</h3>
              <p className="text-gray-500 mt-2">Breathe in sync with the movement...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
