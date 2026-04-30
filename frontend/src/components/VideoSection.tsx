import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SpeakerWaveIcon, SpeakerXMarkIcon, PlayIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';
import axios from 'axios';

interface VideoSectionProps {
  title: string;
  videos: { id: number; url: string; title: string; poster?: string }[];
  onClose: () => void;
}

export default function VideoSection({ title, videos, onClose }: VideoSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Force play when video changes or modal opens
  useEffect(() => {
    if (selectedVideo && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn("Autoplay blocked, waiting for user gesture:", err);
      });
      setStartTime(Date.now());
    }
  }, [selectedVideo]);

  const trackTime = async () => {
    if (startTime) {
      const durationMs = Date.now() - startTime;
      const durationMins = durationMs / (1000 * 60);
      
      if (durationMins > 0.01) { // Only track if > 0.6s for demo
        try {
          const { data: { user } } = await supabase.auth.getUser();
          await axios.post('http://localhost:3001/api/activity', {
            userId: user?.id || 'guest',
            type: 'calm',
            duration: durationMins
          });
        } catch (e) {
          console.warn("Failed to track calm minutes", e);
        }
      }
      setStartTime(null);
    }
  };

  const closePlayer = () => {
    trackTime();
    setSelectedVideo(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-dark-900/98 backdrop-blur-3xl overflow-y-auto"
    >
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h2 className="text-4xl font-bold text-white tracking-tight">{title}</h2>
            <p className="text-gray-500 mt-2">Choose a visual to focus your mind. Exactly 5 scenes curated for you.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition shadow-2xl"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Grid of 5 Videos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              whileHover={{ y: -8 }}
              className="group relative aspect-video bg-dark-800 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <video 
                src={video.url} 
                poster={video.poster}
                muted 
                autoPlay 
                loop 
                playsInline
                preload="auto"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-xl flex items-center justify-center border border-primary/30 shadow-[0_0_30px_rgba(102,252,241,0.2)]">
                  <PlayIcon className="w-8 h-8 text-primary-light" />
                </div>
              </div>
              <div className="absolute bottom-6 left-8">
                <h4 className="text-lg font-bold text-white">{video.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fullscreen Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-dark-900 flex items-center justify-center group/player"
          >
            <div className="absolute top-10 right-10 flex gap-4 z-20">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
              >
                {isMuted ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
              </button>
              <button 
                onClick={closePlayer}
                className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <video 
              ref={videoRef}
              src={selectedVideo.url} 
              poster={selectedVideo.poster}
              autoPlay 
              loop 
              muted={isMuted}
              playsInline
              preload="auto"
              onCanPlay={(e) => (e.target as HTMLVideoElement).play().catch(console.warn)}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute bottom-10 left-0 w-full text-center z-20 pointer-events-none opacity-0 group-hover/player:opacity-100 transition-opacity">
              <h3 className="text-3xl font-bold text-white drop-shadow-lg">{selectedVideo.title}</h3>
              <p className="text-gray-300 mt-2 drop-shadow-md italic">Sanctuary Mode Active</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
