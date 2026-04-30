import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import CareCompanion from './CareCompanion';
import axios from 'axios';
import { API_URL } from '../config/api';


const translations: Record<string, Record<string, string>> = {
  'English': {
    welcome: 'Welcome back!',
    feeling: "Here's how you've been feeling lately.",
    chat: 'Chat With Sahaay',
    games: 'Play Stress Relief Games',
    emotionalStability: 'Emotional Stability',
    resilienceScore: 'Resilience Score',
    calmMinutes: 'Calm Minutes',
    fromLastWeek: 'from last week',
    thisMonth: 'this month',
    steadyGrowth: 'Steady Growth',
    suggestedForYou: 'Suggested For You',
    high: 'High',
    water: 'Water',
    nature: 'Nature',
    satisfyingVideos: 'Satisfying Videos',
    rainyWindow: 'Rainy Window',
    forestPath: 'Forest Path',
    care_companion: 'Sahaay Care Companion',
    community: 'Sahaay Community'
  },
  'हिंदी': {
    welcome: 'वापसी पर स्वागत है!',
    feeling: 'यहाँ बताया गया है कि आप हाल ही में कैसा महसूस कर रहे हैं।',
    chat: 'सहाय के साथ चैट करें',
    games: 'तनाव से राहत देने वाले गेम्स खेलें',
    emotionalStability: 'भावनात्मक स्थिरता',
    resilienceScore: 'लचीलापन स्कोर',
    calmMinutes: 'शांत मिनट',
    fromLastWeek: 'पिछले सप्ताह से',
    thisMonth: 'इस महीने',
    steadyGrowth: 'निरंतर वृद्धि',
    suggestedForYou: 'आपके लिए सुझाये गए',
    high: 'उच्च',
    water: 'पानी',
    nature: 'प्रकृति',
    satisfyingVideos: 'संतोषजनक वीडियो',
    rainyWindow: 'बारिश वाली खिड़की',
    forestPath: 'जंगल का रास्ता',
    care_companion: 'सहाय केयर कम्पैनियन',
    community: 'सहाय कम्युनिटी'
  },
  'ಕನ್ನಡ': {
    welcome: 'ಮತ್ತೆ ಸ್ವಾಗತ!',
    feeling: 'ಇತ್ತೀಚೆಗೆ ನೀವು ಹೇಗೆ ಭಾವಿಸುತ್ತಿದ್ದೀರಿ ಎಂಬುದು ಇಲ್ಲಿದೆ.',
    chat: 'ಸಹಾಯ್ ಜೊತೆ ಚಾಟ್ ಮಾಡಿ',
    games: 'ಒತ್ತಡ ನಿವಾರಣಾ ಆಟಗಳನ್ನು ಆಡಿ',
    emotionalStability: 'ಭಾವನಾತ್ಮಕ ಸ್ಥಿರತೆ',
    resilienceScore: 'ಸ್ಥಿತಿಸ್ಥಾಪಕತ್ವ ಸ್ಕೋರ್',
    calmMinutes: 'ಶಾಂತ ನಿಮಿಷಗಳು',
    fromLastWeek: 'ಕಳೆದ ವಾರದಿಂದ',
    thisMonth: 'ಈ ತಿಂಗಳು',
    steadyGrowth: 'ಸ್ಥಿರ ಬೆಳವಣಿಗೆ',
    suggestedForYou: 'ನಿಮಗಾಗಿ ಸೂಚಿಸಲಾಗಿದೆ',
    high: 'ಹೆಚ್ಚು',
    water: 'ನೀರು',
    nature: 'ಪ್ರಕೃತಿ',
    satisfyingVideos: 'ತೃಪ್ತಿದಾಯಕ ವೀಡಿಯೊಗಳು',
    rainyWindow: 'ಮಳೆಯ ಕಿಟಕಿ',
    forestPath: 'ಕಾಡಿನ ದಾರಿ',
    care_companion: 'ಸಹಾಯ ಕೇರ್ ಕಂಪ್ಯಾನಿಯನ್',
    community: 'ಸಹಾಯ ಸಮುದಾಯ'
  }
};

export default function Dashboard({ onNavigate, language = 'English' }: { onNavigate: (tab: string) => void, language?: string }) {
  const t = translations[language] || translations['English'];
  const [, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [metrics, setMetrics] = useState({
    emotionalStability: 50,
    resilience: 'Moderate',
    calmMinutes: 0,
    stabilityTrend: '→',
    calmTrend: '→'
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || 'guest';

        // Fetch Trends
        const res = await axios.get(`${API_URL}/api/insights?userId=${userId}`);
        if (res.data.trends && res.data.trends.length > 0) {
          const formatted = res.data.trends.reverse().map((t: any, i: number) => ({
            day: `Session ${i + 1}`,
            stress: t.score
          }));
          setData(formatted);
          setSummary(res.data.summary);
        } else {
          setMockData();
        }

        // Fetch Real-time Metrics
        fetchMetrics(userId);
      } catch (e) {
        setMockData();
      }
    };

    const fetchMetrics = async (userId: string) => {
      try {
        const res = await axios.get(`${API_URL}/api/metrics?userId=${userId}`);
        setMetrics(res.data);
      } catch (e) {
        console.error("Error fetching metrics:", e);
      }
    };

    const testConnection = async () => {
      console.log("🔍 Sahaay: Testing Backend Connection...");
      console.log("📍 Target URL:", API_URL);
      try {
        const res = await axios.get(`${API_URL}/health`);
        console.log("✅ Sahaay Backend: Online", res.data);
      } catch (err) {
        console.error("❌ Sahaay Backend: Offline or Connection Error", err);
      }
    };

    fetchData();
    testConnection();

    // Poll for metrics to reflect real-time activity
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      fetchMetrics(user?.id || 'guest');
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const setMockData = () => {
    setData([
      { day: 'Mon', stress: 3 },
      { day: 'Tue', stress: 4 },
      { day: 'Wed', stress: 2 },
      { day: 'Thu', stress: 6 },
      { day: 'Fri', stress: 7 },
    ]);
    setSummary("You've been navigating a lot of feelings. Remember to be kind to yourself.");
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-text-main tracking-tight">{t.welcome}</h1>
          <p className="text-text-muted mt-2 text-lg">{t.feeling}</p>
        </div>
        <div className="bg-primary/5 backdrop-blur-xl border border-primary/20 px-8 py-4 rounded-[2rem] flex items-center gap-4 shadow-2xl">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(255,77,255,0.8)]" />
          <span className="text-sm font-medium text-primary-light italic leading-relaxed">"{summary}"</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => onNavigate('chat')}
          className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-primary/80 to-primary text-white font-semibold text-lg neon-btn transition-all duration-300 transform hover:-translate-y-1 relative group"
        >
          <div className="sweep-container">
            <div className="sweep-light" />
          </div>
          <span className="relative z-10">{t.chat}</span>
        </button>
        <button 
          onClick={() => onNavigate('games')}
          className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-600/80 to-blue-500 text-white font-semibold text-lg neon-btn transition-all duration-300 transform hover:-translate-y-1"
        >
          {t.games}
        </button>
      </div>

      {/* Sahay Care Companion */}
      <CareCompanion onNavigate={onNavigate} language={language} />

      {/* Sahaay Community Button */}
      <button 
        onClick={() => onNavigate('community')}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600/80 to-pink-500 text-white font-semibold text-lg neon-btn transition-all duration-300 transform hover:-translate-y-1 relative group"
      >
        <div className="sweep-container">
          <div className="sweep-light" />
        </div>
        <span className="relative z-10">{t.community}</span>
      </button>

      {/* Grid Cards (Existing) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="glass-panel p-6 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <ArrowTrendingUpIcon className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-text-muted">{t.emotionalStability}</span>
          </div>
          <div className="text-3xl font-bold text-text-main">{metrics.emotionalStability}%</div>
          <div className="text-[10px] text-green-400 mt-2 flex items-center gap-1">
            <span>{metrics.stabilityTrend} 5%</span>
            <span className="text-text-muted font-normal">{t.fromLastWeek}</span>
          </div>
        </div>

        <div className="glass-panel p-6 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <ShieldCheckIcon className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-text-muted">{t.resilienceScore}</span>
          </div>
          <div className="text-3xl font-bold text-text-main">{metrics.resilience}</div>
          <div className="text-[10px] text-purple-400 mt-2 flex items-center gap-1 uppercase tracking-widest font-bold">
            {t.steadyGrowth}
          </div>
        </div>

        <div className="glass-panel p-6 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-500/20 rounded-xl">
              <SparklesIcon className="w-5 h-5 text-teal-400" />
            </div>
            <span className="text-sm font-medium text-text-muted">{t.calmMinutes}</span>
          </div>
          <div className="text-3xl font-bold text-text-main">{metrics.calmMinutes}m</div>
          <div className="text-[10px] text-teal-400 mt-2 flex items-center gap-1">
            <span>{metrics.calmTrend} 5m</span>
            <span className="text-text-muted font-normal">{t.thisMonth}</span>
          </div>
        </div>
      </div>

      {/* Suggested For You */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <SparklesIcon className="w-6 h-6 text-primary-light" />
          <h2 className="text-2xl font-bold text-text-main">{t.suggestedForYou}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 1, title: t.satisfyingVideos, category: t.water, url: '/videos/home1.mp4' },
            { id: 2, title: t.rainyWindow, category: t.nature, url: '/videos/home2.mp4' },
            { id: 3, title: t.forestPath, category: t.nature, url: '/videos/home3.mp4' },
          ].map(video => (
            <div 
              key={video.id} 
              onClick={() => onNavigate('hub')}
              className="group relative bg-dark-800 rounded-3xl overflow-hidden border border-white/5 shadow-xl cursor-pointer hover:border-primary/50 hover:shadow-[0_0_15px_rgba(255,77,255,0.1)] transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-video relative overflow-hidden bg-black/80 pointer-events-none">
                <video src={video.url} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 pointer-events-none">
                  <span className="px-2 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] text-text-main uppercase tracking-wider font-semibold mb-2 block w-max">{video.category}</span>
                  <h3 className="text-lg font-bold text-text-main group-hover:text-primary-light transition-colors">{video.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
