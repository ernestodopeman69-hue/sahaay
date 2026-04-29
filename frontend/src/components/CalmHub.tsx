import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import CalmHubCard from './CalmHubCard';
import VideoSection from './VideoSection';
import CareCompanion from './CareCompanion';

const categories = [
  {
    id: 'satisfying',
    title: 'Satisfying Videos',
    desc: 'Intricate loops and satisfying motions to ground your mind.',
    previewUrl: '/videos/satisfying.mp4',
    poster: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-purple-500/10',
    videos: [
      { id: 1, title: 'Liquid Flow', url: '/videos/satisfying1.mp4', poster: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=500&q=80' },
      { id: 2, title: 'Nature Loop', url: '/videos/satisfying2.mp4', poster: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=500&q=80' },
      { id: 3, title: 'Zen Motion', url: '/videos/satisfying3.mp4', poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80' },
      { id: 4, title: 'Ocean Drift', url: '/videos/satisfying4.mp4', poster: 'https://images.unsplash.com/photo-1544710800-ed39b03806f3?auto=format&fit=crop&w=500&q=80' },
      { id: 5, title: 'Gentle Waves', url: '/videos/satisfying5.mp4', poster: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=500&q=80' }
    ]
  },
  {
    id: 'ocean',
    title: 'Ocean Waves',
    desc: 'The rhythmic pulse of the sea to calm your breathing.',
    previewUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-blue-500/10',
    videos: [
      { id: 1, title: 'Pacific Rhythm', url: 'https://vjs.zencdn.net/v/oceans.mp4', poster: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=500&q=80' },
      { id: 2, title: 'Deep Blue Flow', url: 'https://vjs.zencdn.net/v/oceans.mp4#t=10', poster: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&w=500&q=80' },
      { id: 3, title: 'Horizon Peace', url: 'https://vjs.zencdn.net/v/oceans.mp4#t=20', poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80' },
      { id: 4, title: 'Azure Solitude', url: 'https://vjs.zencdn.net/v/oceans.mp4#t=30', poster: 'https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=500&q=80' },
      { id: 5, title: 'Crystal Shore', url: 'https://vjs.zencdn.net/v/oceans.mp4#t=40', poster: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=500&q=80' }
    ]
  },
  {
    id: 'wildlife',
    title: 'Wildlife',
    desc: 'Wide-open landscapes and the gentle movement of the wild.',
    previewUrl: 'https://res.cloudinary.com/demo/video/upload/v1619001389/samples/elephants.mp4',
    poster: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-green-500/10',
    videos: [
      { id: 1, title: 'Sea Turtle', url: 'https://res.cloudinary.com/demo/video/upload/v1619001389/samples/sea-turtle.mp4', poster: 'https://images.unsplash.com/photo-1544710800-ed39b03806f3?auto=format&fit=crop&w=500&q=80' },
      { id: 2, title: 'Elephants', url: 'https://res.cloudinary.com/demo/video/upload/v1619001389/samples/elephants.mp4', poster: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=500&q=80' },
      { id: 3, title: 'Marine Life', url: 'https://vjs.zencdn.net/v/oceans.mp4', poster: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=500&q=80' },
      { id: 4, title: 'Bunny Adventure', url: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=500&q=80' },
      { id: 5, title: 'Wild Safari', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', poster: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?auto=format&fit=crop&w=500&q=80' }
    ]
  },
  {
    id: 'rainy',
    title: 'Rainy Nature',
    desc: 'The soothing sound and sight of rain on fresh leaves.',
    previewUrl: '/videos/rain.mp4',
    poster: 'https://images.unsplash.com/photo-1469719847081-4757697d117a?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-indigo-500/10',
    videos: [
      { id: 1, title: 'Window Rain', url: '/videos/rainy1.mp4', poster: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=500&q=80' },
      { id: 2, title: 'Forest Shower', url: '/videos/rainy2.mp4', poster: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?auto=format&fit=crop&w=500&q=80' },
      { id: 3, title: 'Puddle Ripples', url: '/videos/rainy3.mp4', poster: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=500&q=80' },
      { id: 4, title: 'Stormy Sky', url: '/videos/rainy4.mp4', poster: 'https://images.unsplash.com/photo-1469719847081-4757697d117a?auto=format&fit=crop&w=500&q=80' },
      { id: 5, title: 'Mist Flow', url: '/videos/rainy5.mp4', poster: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=500&q=80' }
    ]
  },
  {
    id: 'forest',
    title: 'Forest Path',
    desc: 'Sun-dappled paths and the quiet majesty of old trees.',
    previewUrl: '/videos/forest_new.mp4',
    poster: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-teal-500/10',
    videos: [
      { id: 1, title: 'Golden Canopy', url: '/videos/forest1.mp4', poster: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=80' },
      { id: 2, title: 'Deep Woods', url: '/videos/forest2.mp4', poster: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=500&q=80' },
      { id: 3, title: 'Mossy Way', url: '/videos/forest3.mp4', poster: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=500&q=80' },
      { id: 4, title: 'Pine Silence', url: '/videos/forest4.mp4', poster: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=500&q=80' },
      { id: 5, title: 'Morning Dew', url: '/videos/forest5.mp4', poster: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?auto=format&fit=crop&w=500&q=80' }
    ]
  },
  {
    id: 'cloudy',
    title: 'Cloudy',
    desc: 'Slow-moving skies and the infinite drift of white clouds.',
    previewUrl: '/videos/cloudy.mp4',
    poster: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-slate-500/10',
    videos: [
      { id: 1, title: 'Infinite Blue', url: '/videos/cloudy1.mp4', poster: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=500&q=80' },
      { id: 2, title: 'Storm Front', url: '/videos/cloudy2.mp4', poster: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&fit=crop&w=500&q=80' },
      { id: 3, title: 'Sunset Drift', url: '/videos/cloudy3.mp4', poster: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=500&q=80' },
      { id: 4, title: 'High Altitude', url: '/videos/cloudy4.mp4', poster: 'https://images.unsplash.com/photo-1519181245277-cffeb31da948?auto=format&fit=crop&w=500&q=80' },
      { id: 5, title: 'Night Sky', url: '/videos/cloudy5.mp4', poster: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=500&q=80' }
    ]
  }
];

export default function CalmHub({ onNavigate, language = 'English' }: { onNavigate: (tab: string) => void, language?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-text-main tracking-tight">Calm Hub</h1>
      </div>

      {/* Daily Guider Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-text-main">Daily Guider</h2>
          <p className="text-sm text-text-muted">Your central place for wellness tools and daily support.</p>
        </div>
        <CareCompanion onNavigate={onNavigate} language={language} />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <CalmHubCard 
            key={cat.id}
            title={cat.title}
            desc={cat.desc}
            previewUrl={cat.previewUrl}
            poster={cat.poster}
            gradient={cat.gradient}
            onClick={() => setSelectedCategory(cat)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedCategory && (
          <VideoSection 
            title={selectedCategory.title}
            videos={selectedCategory.videos}
            onClose={() => setSelectedCategory(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
