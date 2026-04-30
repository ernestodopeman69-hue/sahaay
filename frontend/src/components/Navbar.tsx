import { Bars3Icon } from '@heroicons/react/24/outline';

export default function Navbar({ language, setLanguage, userEmail, toggleSidebar }: { 
  language: string, 
  setLanguage: (l: string) => void, 
  userEmail: string,
  toggleSidebar: () => void
}) {
  return (
    <header className="h-16 bg-transparent flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu - Mobile Only */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-full px-2 md:px-3 py-1 text-[10px] md:text-[12px] outline-none text-text-muted hover:bg-white/10 transition"
        >
          <option>English</option>
          <option>हिंदी</option>
          <option>ಕನ್ನಡ</option>
        </select>

        <div className="flex items-center gap-2 md:gap-3 border-l border-white/10 pl-4 md:pl-6">
          {userEmail === 'Guest User' && (
            <span className="hidden sm:inline-block bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest mr-1 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
              Guest
            </span>
          )}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] md:text-xs font-medium text-text-main">
              {userEmail === 'Guest User' ? 'Visitor' : 'Caregiver'}
            </span>
            <span className="text-[8px] md:text-[10px] text-text-muted truncate w-20 md:w-32 text-right">{userEmail}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-[10px] font-bold border border-white/10 text-white shadow-lg">
            {userEmail[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
