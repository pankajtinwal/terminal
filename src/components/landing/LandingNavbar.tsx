interface LandingNavbarProps {
  onLaunchTerminal: () => void;
  onOpenAuth: (mode: 'login' | 'signup', plan?: string) => void;
}

export default function LandingNavbar({ onLaunchTerminal, onOpenAuth }: LandingNavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-16 relative flex items-center justify-between">
        {/* Brand & Market Status Pill */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onLaunchTerminal}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-widest font-mono text-white flex items-center gap-1.5">
                TERMINAL <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-zinc-800 text-emerald-400 border border-emerald-500/20 font-mono">ALPHA</span>
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>216 MTF Securities • 5 Quant Engines</span>
          </div>
        </div>

        {/* Center Nav Links (Mathematically Dead-Centered) */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-7 text-xs font-mono text-zinc-400 z-10">
          <a href="#features" className="hover:text-zinc-100 transition">Features</a>
          <a href="#quant" className="hover:text-zinc-100 transition">Quant Models</a>
          <a href="#mtf" className="hover:text-zinc-100 transition">MTF Radar</a>
          <a href="#pricing" className="hover:text-zinc-100 transition">Pricing</a>
          <a href="#faq" className="hover:text-zinc-100 transition">FAQ</a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 z-10">
          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className="text-xs font-mono text-zinc-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800/60 transition cursor-pointer"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={onLaunchTerminal}
            className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition duration-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer"
          >
            <span>Launch Terminal</span>
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
