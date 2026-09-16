import { useMemo } from 'react';
import type { QuantModelKey, QuantModelData, AnyQuantPoint, EMAPoint, MomentumPoint, KinematicPoint, OUPoint, FractalPoint } from '../../types';
import { fmtInr } from '../../utils/formatters';

interface QuantWatchlistTableProps {
  modelKey: QuantModelKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelData: QuantModelData<any>;
  selectedTicker: string | null;
  onSelectTicker: (t: string | null) => void;
  filterSector: string;
  onFilterSector: (s: string) => void;
  searchQuery: string;
  onSearchQuery: (q: string) => void;
  flaggedOnly: boolean;
  onToggleFlaggedOnly: () => void;
}

export default function QuantWatchlistTable({
  modelKey,
  modelData,
  selectedTicker,
  onSelectTicker,
  filterSector,
  onFilterSector,
  searchQuery,
  onSearchQuery,
  flaggedOnly,
  onToggleFlaggedOnly,
}: QuantWatchlistTableProps) {
  const points = (modelData.points || []) as AnyQuantPoint[];

  // Collect unique sectors
  const sectors = useMemo(() => {
    const set = new Set<string>();
    points.forEach(p => {
      if (p.sector) set.add(p.sector);
    });
    return Array.from(set).sort();
  }, [points]);

  // Determine signal tag for point
  const getSignalTag = (p: AnyQuantPoint) => {
    if (modelKey === 'ema') {
      const ep = p as EMAPoint;
      if (ep.is_pullback_buy) {
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">Pullback Buy (Q4)</span>;
      }
      if (ep.is_bull) {
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/40 text-emerald-400/80 border border-emerald-800/40">Bull (&gt;200 EMA)</span>;
      }
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-950/40 text-rose-400/80 border border-rose-800/40">Bear (&lt;200 EMA)</span>;
    }
    if (modelKey === 'momentum') {
      const mp = p as MomentumPoint;
      if (mp.is_outlier) {
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/40">Breakout (&gt;2.0σ)</span>;
      }
      return <span className="text-zinc-500 text-[11px] font-mono">{mp.studentized_residual > 0 ? '+' : ''}{mp.studentized_residual}σ</span>;
    }
    if (modelKey === 'kinematic') {
      const kp = p as KinematicPoint;
      if (kp.is_inflection) {
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/40">Q2 Inflection</span>;
      }
      return <span className="text-zinc-400 text-[11px] font-mono">Q{kp.quadrant} • DM {kp.mahalanobis_dist}</span>;
    }
    if (modelKey === 'ou') {
      const op = p as OUPoint;
      if (op.is_high_elasticity) {
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">High Elasticity</span>;
      }
      return <span className="text-zinc-500 text-[11px] font-mono">Z: {op.spread_zscore.toFixed(2)}</span>;
    }
    if (modelKey === 'fractal') {
      const fp = p as FractalPoint;
      if (fp.is_persist_breakout) {
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">Trend Breakout</span>;
      }
      if (fp.is_anti_fade) {
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/40">Reversal Fade</span>;
      }
      return <span className="text-zinc-500 text-[11px] font-mono">{fp.regime}</span>;
    }
    return null;
  };

  const isPointFlagged = (p: AnyQuantPoint): boolean => {
    if (modelKey === 'ema') return (p as EMAPoint).is_pullback_buy;
    if (modelKey === 'momentum') return (p as MomentumPoint).is_outlier;
    if (modelKey === 'kinematic') return (p as KinematicPoint).is_inflection;
    if (modelKey === 'ou') return (p as OUPoint).is_high_elasticity;
    if (modelKey === 'fractal') {
      const fp = p as FractalPoint;
      return fp.is_anti_fade || fp.is_persist_breakout;
    }
    return false;
  };

  const filtered = useMemo(() => {
    const qLower = searchQuery.toLowerCase().trim();
    return points.filter(p => {
      if (filterSector !== 'all' && p.sector !== filterSector) return false;
      if (flaggedOnly && !isPointFlagged(p)) return false;
      if (qLower && !p.ticker.toLowerCase().includes(qLower) && !p.name.toLowerCase().includes(qLower)) return false;
      return true;
    });
  }, [points, filterSector, flaggedOnly, searchQuery, modelKey]);

  return (
    <section className="terminal-card rounded-lg p-4 border border-zinc-800 bg-[#121215]/90 space-y-3">
      {/* Table Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center gap-2">
            <span>Model Constituents</span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/80">
              {filtered.length} / {points.length}
            </span>
          </h3>

          {/* Flagged Only Toggle */}
          <button
            type="button"
            onClick={onToggleFlaggedOnly}
            className={`px-2.5 py-1 rounded-md border text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
              flaggedOnly
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${flaggedOnly ? 'bg-amber-400' : 'bg-zinc-600'}`} />
            <span>Flagged Setups Only</span>
          </button>

          {/* Sector Select */}
          <select
            value={filterSector}
            onChange={e => onFilterSector(e.target.value)}
            className="text-xs font-mono py-1 px-2.5 rounded-md bg-zinc-900 border border-zinc-700/60 text-zinc-200 cursor-pointer focus:outline-none"
          >
            <option value="all">All Sectors ({sectors.length})</option>
            {sectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-56">
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchQuery(e.target.value)}
            placeholder="Search ticker..."
            className="w-full text-xs font-mono py-1.5 pl-8 pr-3 rounded-md bg-zinc-900 border border-zinc-700/60 text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none transition"
          />
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-zinc-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#18181b] text-zinc-400 font-semibold border-b border-zinc-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Stock</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">Sector</th>
              <th className="py-2.5 px-3 text-right">Price</th>
              <th className="py-2.5 px-3 text-right">{modelData.x_label.split('(')[0]}</th>
              <th className="py-2.5 px-3 text-right">{modelData.y_label.split('(')[0]}</th>
              <th className="py-2.5 px-3 text-right">Signal / Classification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono">
                  No stocks matching the current filters.
                </td>
              </tr>
            ) : (
              filtered.map(p => {
                const isSelected = selectedTicker === p.ticker;
                return (
                  <tr
                    key={p.ticker}
                    onClick={() => onSelectTicker(isSelected ? null : p.ticker)}
                    className={`hover:bg-zinc-800/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-zinc-800/60 ring-1 ring-inset ring-zinc-500/50' : ''
                    }`}
                  >
                    <td className="py-2 px-3">
                      <div className="font-bold text-zinc-100 text-xs tracking-tight">{p.ticker}</div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-[160px] sm:max-w-xs font-sans">{p.name}</div>
                    </td>
                    <td className="py-2 px-3 hidden sm:table-cell text-zinc-300 text-xs font-sans">{p.sector}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold text-zinc-100">
                      ₹{fmtInr(p.price)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-zinc-200">
                      {p.x.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-zinc-200">
                      {p.y.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {getSignalTag(p)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
