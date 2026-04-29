

export default function Navbar({ language, setLanguage, userEmail }: { language: string, setLanguage: (l: string) => void, userEmail: string }) {
  return (
    <header className="h-16 bg-transparent flex items-center justify-end px-8 sticky top-0 z-10 ml-20">
      <div className="flex items-center gap-6">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[12px] outline-none text-text-muted hover:bg-white/10 transition"
        >
          <option>English</option>
          <option>हिंदी</option>
          <option>ಕನ್ನಡ</option>
        </select>

        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
          {userEmail === 'Guest User' && (
            <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest mr-2 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
              Guest Mode
            </span>
          )}
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-text-main">
              {userEmail === 'Guest User' ? 'Visitor' : 'Caregiver'}
            </span>
            <span className="text-[10px] text-text-muted truncate w-32 text-right">{userEmail}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-[10px] font-bold border border-white/10 text-white">
            {userEmail[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
