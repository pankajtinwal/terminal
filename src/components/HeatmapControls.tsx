import type { HeatmapTimeframe, HeatmapSector, HeatmapHierarchyMode, HeatmapSizingMode, WatchlistId } from '../types';
import { getLegendEntries } from '../utils/heatmapColors';

const HM_TF: HeatmapTimeframe[] = ['1d', '1w', '1m', '3m', '6m', '1y'];

interface HeatmapControlsProps {
  watchlist?: WatchlistId;
  totalStocks?: number;
  timeframe: HeatmapTimeframe;
  scope: string;
  search: string;
  sectors: HeatmapSector[];
  activeReturnFilter: string | null;
  hierarchyMode: HeatmapHierarchyMode;
  sizingMode: HeatmapSizingMode;
  onTimeframe: (tf: HeatmapTimeframe) => void;
  onScope: (s: string) => void;
  onSearch: (q: string) => void;
  onReturnFilter: (bracket: string | null) => void;
  onToggleHierarchy: () => void;
  onToggleSizing: () => void;
}

export default function HeatmapControls({
  watchlist = 'investment',
  totalStocks,
  timeframe,
  scope,
  search,
  sectors,
  activeReturnFilter,
  hierarchyMode,
  sizingMode,
  onTimeframe,
  onScope,
  onSearch,
  onReturnFilter,
  onToggleHierarchy,
  onToggleSizing,
}: HeatmapControlsProps) {
  const legend = getLegendEntries(timeframe);
  const allLabel = watchlist === 'mtf'
    ? `All MTF Stocks (${totalStocks ?? 216} Stocks)`
    : `All Indices (${totalStocks ?? 132} Master Basket)`;

  return (
    <section className="terminal-card rounded-lg p-3 sm:p-3.5 border border-zinc-800 bg-[#121215]/90">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Scope dropdown + Interactive Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value={scope}
              onChange={e => onScope(e.target.value)}
              className="appearance-none text-xs font-mono font-medium py-1.5 px-2.5 pr-7 rounded-md bg-zinc-900 border border-zinc-700/70 text-zinc-200 cursor-pointer hover:border-zinc-500 focus:outline-none transition"
            >
              <option value="all">{allLabel}</option>
              {sectors.map(s => (
                <option key={s.slug} value={s.slug}>{s.name} ({s.constituents_count})</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Sizing Toggle: Equal Weight vs Magnitude */}
          <button
            type="button"
            onClick={onToggleSizing}
            title={sizingMode === 'equal' ? 'Currently Equal Sized (1/n). Click to size tiles by return magnitude.' : 'Currently sized by Return Magnitude. Click for Equal Sizing.'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-mono font-medium transition cursor-pointer ${
              sizingMode === 'equal'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm'
                : 'bg-zinc-900 text-amber-300 border-amber-500/40 hover:bg-zinc-800/60'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
            <span>{sizingMode === 'equal' ? 'Equal Sized' : 'Magnitude Sized'}</span>
          </button>

          {/* Hierarchy Toggle: Sector Hierarchy vs Flat Market */}
          <button
            type="button"
            onClick={onToggleHierarchy}
            title={hierarchyMode === 'sector' ? 'Currently grouped by Sector. Click for Flat Market view.' : 'Currently Flat Market view. Click to group by Sector.'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-mono font-medium transition cursor-pointer ${
              hierarchyMode === 'sector'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm'
                : 'bg-zinc-900 text-cyan-300 border-cyan-500/40 hover:bg-zinc-800/60'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>{hierarchyMode === 'sector' ? 'Sector View' : 'Flat Market'}</span>
          </button>
        </div>

        {/* Middle: Timeframe */}
        <div className="flex items-center p-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono">
          {HM_TF.map(tf => (
            <button
              key={tf}
              onClick={() => onTimeframe(tf)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                timeframe === tf
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Right: Interactive Return Filter Buttons + Search */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 rounded-md p-0.5 bg-zinc-950 border border-zinc-800 text-[10px] font-mono">
              {legend.map(e => {
                const isSelected = activeReturnFilter === e.label;
                return (
                  <button
                    type="button"
                    key={e.label}
                    onClick={() => onReturnFilter(isSelected ? null : e.label)}
                    title={`Filter stocks around ${e.label} return`}
                    className={`px-1.5 py-0.5 rounded transition cursor-pointer font-bold ${
                      isSelected
                        ? 'ring-1 ring-zinc-200 scale-105 shadow-md z-10'
                        : 'opacity-85 hover:opacity-100'
                    }`}
                    style={{ background: e.bg, color: e.textDark ? '#09090b' : '#f4f4f5' }}
                  >
                    {e.label}
                  </button>
                );
              })}
            </div>
            {activeReturnFilter && (
              <button
                type="button"
                onClick={() => onReturnFilter(null)}
                title="Clear return bracket filter"
                className="text-[10px] font-mono font-medium text-zinc-300 hover:text-white px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition cursor-pointer flex items-center gap-1"
              >
                <span>Reset</span>
                <span>✕</span>
              </button>
            )}
          </div>

          <div className="relative w-40 sm:w-44">
            <input
              type="text"
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Find in map..."
              className="w-full text-xs font-mono py-1.5 pl-7 pr-2.5 rounded-md bg-zinc-900 border border-zinc-700/70 text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none transition"
            />
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-zinc-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

