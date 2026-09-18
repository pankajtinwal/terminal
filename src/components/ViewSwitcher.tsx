import { useEffect } from 'react';
import type { ViewMode, WatchlistId } from '../types';

interface ViewSwitcherProps {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  watchlist: WatchlistId;
}

export default function ViewSwitcher({
  view,
  onViewChange,
  watchlist,
}: ViewSwitcherProps) {
  // Optional keyboard shortcuts [1], [2], [3] to quickly switch views
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or select
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === '1' && watchlist === 'investment') {
        onViewChange('chart');
      } else if (e.key === '2') {
        onViewChange('heatmap');
      } else if (e.key === '3') {
        onViewChange('quant');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [watchlist, onViewChange]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full border-b border-zinc-800/80 pb-3">
      {/* Segmented View Tabs */}
      <div className="inline-flex items-center p-1 rounded-lg bg-[#121215] border border-zinc-800 shadow-sm">
        {watchlist === 'investment' && (
          <button
            type="button"
            onClick={() => onViewChange('chart')}
            title="Switch to Index Candlestick Chart (Shortcut: 1)"
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition cursor-pointer ${
              view === 'chart'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
            }`}
          >
            <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <span>Index Chart</span>
            <span className="hidden lg:inline text-[10px] px-1 rounded bg-zinc-900 text-zinc-500 font-normal">1</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onViewChange('heatmap')}
          title="Switch to Market Treemap Heatmap (Shortcut: 2)"
          className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition cursor-pointer ${
            view === 'heatmap'
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
          }`}
        >
          <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Market Treemap</span>
          <span className="hidden lg:inline text-[10px] px-1 rounded bg-zinc-900 text-zinc-500 font-normal">2</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange('quant')}
          title="Switch to Quantitative Alpha Models (Shortcut: 3)"
          className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition cursor-pointer ${
            view === 'quant'
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
          }`}
        >
          <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="7" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="15" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
          </svg>
          <span>Quant Models</span>
          <span className="hidden lg:inline text-[10px] px-1 rounded bg-zinc-900 text-zinc-500 font-normal">3</span>
        </button>
      </div>

      {/* Right side: Watchlist indicator badge */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-zinc-500 hidden sm:inline">Active Scope:</span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
          <span className={`w-1.5 h-1.5 rounded-full ${watchlist === 'mtf' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
          <span className="font-medium">
            {watchlist === 'mtf' ? 'MTF Swing Screener (216 Stocks @ 3.5x+)' : 'Alpha 132 Core Benchmark'}
          </span>
        </div>
      </div>
    </div>
  );
}
