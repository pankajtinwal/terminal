import type { ViewMode, WatchlistId } from '../types';

interface NavbarProps {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  watchlist: WatchlistId;
  onWatchlistChange: (w: WatchlistId) => void;
  onRefresh: () => void;
  loading: boolean;
  cacheStatus: string;
  onGoHome?: () => void;
}

export default function Navbar({
  view,
  onViewChange,
  watchlist,
  onWatchlistChange,
  onRefresh,
  loading,
  cacheStatus,
  onGoHome,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#121215] border-b border-[#27272a]">
      <div className="max-w-[1680px] mx-auto px-3 sm:px-5 lg:px-8 h-[52px] grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        {/* Left Col: Brand & Watchlist Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 justify-start">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition shrink-0"
            onClick={onGoHome}
            title="Return to Landing Page & Plans"
          >
            <div className="w-7 h-7 rounded-md bg-[#18181b] border border-[#27272a] flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-widest font-mono text-[#f4f4f5] uppercase hidden lg:inline">
              TERMINAL
            </span>
          </div>

          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer shrink-0"
              title="Return to Landing Page & Plans"
            >
              <span>← Plans</span>
            </button>
          )}

          <div className="h-4 w-px bg-zinc-800 shrink-0 hidden md:block" />

          {/* Watchlist Toggle */}
          <div className="flex items-center p-0.5 rounded-md bg-[#09090b] border border-[#27272a] shrink-0">
            <button
              type="button"
              onClick={() => onWatchlistChange('investment')}
              title="Alpha 132 Investment Watchlist (Equal-Weighted Index, Treemap, Quant)"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                watchlist === 'investment'
                  ? 'bg-[#1e2025] text-white font-medium border border-[#3f3f46]/80 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <span>Alpha 132</span>
              <span className="text-[10px] px-1 rounded bg-zinc-800 text-zinc-400 hidden xl:inline">Inv</span>
            </button>
            <button
              type="button"
              onClick={() => onWatchlistChange('mtf')}
              title="MTF Swing Trading Watchlist (3.5x+ Margin, Treemap, Quant Models)"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                watchlist === 'mtf'
                  ? 'bg-[#1e2025] text-white font-medium border border-emerald-500/50 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <span className={watchlist === 'mtf' ? 'text-emerald-400 font-semibold' : ''}>
                MTF<span className="hidden xl:inline"> Stocks</span>
              </span>
              <span className="text-[10px] px-1 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">3.5x+</span>
            </button>
          </div>
        </div>

        {/* Center Col: View Switcher (Dead Center, No Overlapping) */}
        <div className="flex items-center justify-center">
          <div className="flex items-center p-0.5 rounded-md bg-[#09090b] border border-[#27272a] shadow-inner">
            {watchlist === 'investment' && (
              <button
                type="button"
                onClick={() => onViewChange('chart')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-semibold font-mono transition cursor-pointer shrink-0 ${
                  view === 'chart'
                    ? 'bg-[#1e2025] text-white border border-[#3f3f46]/80 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                <span><span className="hidden md:inline">Index </span>Chart</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onViewChange('heatmap')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-semibold font-mono transition cursor-pointer shrink-0 ${
                view === 'heatmap'
                  ? 'bg-[#1e2025] text-white border border-[#3f3f46]/80 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              <span><span className="hidden md:inline">Market </span>Treemap</span>
            </button>
            <button
              type="button"
              onClick={() => onViewChange('quant')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-semibold font-mono transition cursor-pointer shrink-0 ${
                view === 'quant'
                  ? 'bg-[#1e2025] text-white border border-[#3f3f46]/80 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="7" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="15" r="1.5" />
                <circle cx="5" cy="8" r="1.5" />
              </svg>
              <span>Quant<span className="hidden md:inline"> Models</span></span>
            </button>
          </div>
        </div>

        {/* Right Col: Status + Actions */}
        <div className="flex items-center gap-2 justify-end min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#18181b] border border-[#27272a] text-zinc-300 text-[11px] font-mono shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${watchlist === 'mtf' ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="hidden lg:inline">{cacheStatus}</span>
            <span className="lg:hidden">{watchlist === 'mtf' ? '216 MTF' : '132 Inv'}</span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            title="Re-sync data cache"
            className="p-1.5 rounded-md bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white hover:border-zinc-600 transition active:scale-95 cursor-pointer shrink-0"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

