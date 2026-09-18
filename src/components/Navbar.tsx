import type { WatchlistId } from '../types';

interface NavbarProps {
  watchlist: WatchlistId;
  onWatchlistChange: (w: WatchlistId) => void;
  onGoHome?: () => void;
  onOpenProfile?: () => void;
}

export default function Navbar({
  watchlist,
  onWatchlistChange,
  onGoHome,
  onOpenProfile,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#121215] border-b border-[#27272a]">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-[52px] flex items-center justify-between">
        {/* Left: Brand, Plans & Watchlist Switcher */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition"
            onClick={onGoHome}
            title="Return to Landing Page & Plans"
          >
            <div className="w-7 h-7 rounded-md bg-[#18181b] border border-[#27272a] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-widest font-mono text-[#f4f4f5] uppercase hidden sm:inline">
              TERMINAL
            </span>
          </div>

          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
              title="Return to Landing Page & Plans"
            >
              <span className="hidden md:inline">← Plans</span>
            </button>
          )}

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Watchlist Toggle */}
          <div className="flex items-center p-0.5 rounded-md bg-[#09090b] border border-[#27272a]">
            <button
              type="button"
              onClick={() => onWatchlistChange('investment')}
              title="Alpha 132 Investment Watchlist (Equal-Weighted Index, Treemap, Quant)"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                watchlist === 'investment'
                  ? 'bg-[#1e2025] text-white font-medium border border-[#3f3f46]/80 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <span>Alpha 132</span>
              <span className="text-[10px] px-1 rounded bg-zinc-800 text-zinc-400 hidden lg:inline">Inv</span>
            </button>
            <button
              type="button"
              onClick={() => onWatchlistChange('mtf')}
              title="MTF Swing Trading Watchlist (3.5x+ Margin, Treemap, Quant Models)"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                watchlist === 'mtf'
                  ? 'bg-[#1e2025] text-white font-medium border border-emerald-500/50 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <span className={watchlist === 'mtf' ? 'text-emerald-400 font-semibold' : ''}>MTF Stocks</span>
              <span className="text-[10px] px-1 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">3.5x+</span>
            </button>
          </div>
        </div>

        {/* Right: User Profile / Account Section */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenProfile}
            title="Trader Profile & Account"
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-md bg-[#18181b] hover:bg-zinc-800/80 border border-[#27272a] hover:border-zinc-600 transition cursor-pointer group"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold">
              PT
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-medium text-zinc-200 group-hover:text-white hidden md:inline">
                Pankaj
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <svg className="w-3 h-3 text-zinc-400 group-hover:text-zinc-200 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

