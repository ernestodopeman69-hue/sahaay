import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  PuzzlePieceIcon, 
  SparklesIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  SwatchIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';
import { useState, useEffect } from 'react';

const navItems = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
  { id: 'games', label: 'Games', icon: PuzzlePieceIcon },
  { id: 'community', label: 'Community', icon: UserGroupIcon },
  { id: 'hub', label: 'Calm Hub', icon: SparklesIcon },
  { id: 'profile', label: 'Profile', icon: UserCircleIcon },
];

const translations: Record<string, Record<string, string>> = {
  'English': {
    home: 'Home',
    chat: 'Chat',
    games: 'Games',
    hub: 'Calm Hub',
    profile: 'Profile',
    community: 'Community',
    logout: 'Logout',
    title: 'Sahaay',
    subtitle: 'Silent Support AI'
  },
  'हिंदी': {
    home: 'होम',
    chat: 'चैट',
    games: 'गेम्स',
    hub: 'शांत हಬ',
    profile: 'प्रोफ़ाइल',
    community: 'कम्युनिटी',
    logout: 'लॉग आउट',
    title: 'सहाय',
    subtitle: 'साइलेंट सपोर्ट एआई'
  },
  'ಕನ್ನಡ': {
    home: 'ಮುಖಪುಟ',
    chat: 'ಚಾಟ್',
    games: 'ಆಟಗಳು',
    hub: 'ಶಾಂತ ಹಬ್',
    profile: 'ಪ್ರೊಫೈಲ್',
    community: 'ಸಮುದಾಯ',
    logout: 'ಲಾಗ್ ಔಟ್',
    title: 'ಸಹಾಯ್',
    subtitle: 'ಸೈಲೆಂಟ್ ಸಪೋರ್ಟ್ ಎಐ'
  }
};

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  language = 'English',
  isOpen,
  setIsOpen 
}: { 
  activeTab: string, 
  setActiveTab: (t: string) => void, 
  language?: string,
  isOpen: boolean,
  setIsOpen: (o: boolean) => void
}) {
  const t = translations[language] || translations['English'];
  const [theme, setTheme] = useState(localStorage.getItem('sahaay_theme') || 'neon');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sahaay_theme', theme);
  }, [theme]);

  const themes = [
    { id: 'neon', icon: SwatchIcon, label: 'Neon' },
    { id: 'dark', icon: MoonIcon, label: 'Dark' },
    { id: 'light', icon: SunIcon, label: 'Light' }
  ];

  const handleLogout = async () => {
    console.log("Logout clicked");
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error.message);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login"; 
      } else {
        console.log("Logged out successfully");
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Unexpected logout error:", err);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 shadow-2xl border-r border-white/10 flex flex-col overflow-hidden
          ${isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0 md:w-20 md:hover:w-64'} 
          group/sidebar`}
        style={{ background: 'var(--sidebar-bg)', backdropFilter: 'var(--glass-blur)' }}
      >
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 text-white/50 hover:text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* ── Ambient Mesh Glows ── */}
        <div className="absolute top-[-10%] left-[-20%] w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-30%] w-48 h-48 bg-pink-600/5 rounded-full blur-[60px] pointer-events-none" />

      {/* Title Section */}
      <div className="p-6 relative z-10 flex flex-col items-center group-hover/sidebar:items-start transition-all duration-300">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg group-hover/sidebar:mb-4 transition-all">
          <SparklesIcon className="w-5 h-5 text-white" />
        </div>
        <div className="opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            {t.title}
          </h1>
          <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-bold mt-1.5 opacity-80">{t.subtitle}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4 relative z-10">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-3 py-3.5 rounded-2xl transition-all duration-300 group relative ${
              activeTab === item.id 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/20' 
              : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <div className="flex-shrink-0 w-6 flex items-center justify-center">
              <item.icon className={`w-6 h-6 transition-colors ${activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-purple-400'}`} />
            </div>
            <span className={`text-sm font-semibold tracking-wide opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden ${activeTab === item.id ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`}>
              {t[item.id] || item.label}
            </span>
            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] flex-shrink-0 opacity-0 group-hover/sidebar:opacity-100" />
            )}
            
            {/* Tooltip for collapsed state */}
            <div className="absolute left-20 px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover/sidebar:hidden transition-opacity shadow-xl z-50 whitespace-nowrap">
              {t[item.id] || item.label}
            </div>
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 space-y-2 relative z-10 border-t border-white/5">
        <div className="flex flex-col gap-1">
          {themes.map((tm) => (
            <button
              key={tm.id}
              onClick={() => setTheme(tm.id)}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${
                theme === tm.id 
                ? 'bg-primary/20 text-text-main shadow-sm' 
                : 'text-text-muted hover:bg-white/5 hover:text-text-main'
              }`}
              title={tm.label}
            >
              <div className="flex-shrink-0 w-6 flex items-center justify-center">
                <tm.icon className={`w-5 h-5 transition-colors ${theme === tm.id ? 'text-primary-light' : 'text-gray-500 group-hover:text-gray-300'}`} />
              </div>
              <span className="text-xs font-bold opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
                {tm.label} Mode
              </span>
              
              {/* Tooltip for collapsed state */}
              <div className="absolute left-20 px-3 py-2 bg-gray-800 text-white text-[10px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover/sidebar:hidden transition-opacity shadow-xl z-50 whitespace-nowrap">
                {tm.label} Mode
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/5 relative z-10">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-3 py-3.5 rounded-2xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group relative"
        >
          <div className="flex-shrink-0 w-6 flex items-center justify-center">
            <ArrowRightOnRectangleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-sm font-semibold opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
            {t.logout}
          </span>
          
          <div className="absolute left-20 px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover/sidebar:hidden transition-opacity shadow-xl z-50 whitespace-nowrap">
            {t.logout}
          </div>
        </button>
      </div>
    </aside>
  );
}
