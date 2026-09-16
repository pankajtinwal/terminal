import type { IndexMeta } from '../types';
import { fmtInr } from '../utils/formatters';

function fmtPcts(n: number) {
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}
function fmtPts(n: number) {
  return (n >= 0 ? '+' : '') + n.toFixed(2);
}

interface MetricHUDProps { meta: IndexMeta; }

export default function MetricHUD({ meta }: MetricHUDProps) {
  const isUp = meta.change_pts >= 0;
  const dayProgress = meta.day_high > meta.day_low
    ? Math.min(Math.max(((meta.current_value - meta.day_low) / (meta.day_high - meta.day_low)) * 100, 5), 100) : 50;
  const yearProgress = meta.high_52w > meta.low_52w
    ? Math.min(Math.max(((meta.current_value - meta.low_52w) / (meta.high_52w - meta.low_52w)) * 100, 5), 100) : 50;

  return (
    <section className="terminal-card rounded-lg p-4 sm:p-5 border border-zinc-800 bg-[#121215]/90 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-zinc-800 text-zinc-300 border border-zinc-700/70">
              {meta.type === 'master' ? 'MASTER COMPOSITE INDEX' : 'SECTOR SUB-INDEX'}
            </span>
            <span className="text-xs text-zinc-400 font-mono">{meta.constituents_count} Constituents (Equal Weighted)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">{meta.name}</h1>
          <div className="flex items-baseline gap-3 mt-2">
            <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight text-zinc-100">
              {fmtInr(meta.current_value)}
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold font-mono tabular-nums border ${
              isUp
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {isUp
                ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
              }
              <span>{fmtPts(meta.change_pts)}</span>
              <span>({fmtPcts(meta.change_pct)})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 lg:w-auto w-full">
          {/* Day Range */}
          <div className="p-3 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[135px]">
            <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Day Range</span>
            <div className="flex items-baseline justify-between mt-1 text-xs font-mono tabular-nums text-zinc-200">
              <span>{meta.day_low.toFixed(2)}</span>
              <span className="text-zinc-600">&bull;</span>
              <span>{meta.day_high.toFixed(2)}</span>
            </div>
            <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${dayProgress}%` }} />
            </div>
          </div>

          {/* 52W Range */}
          <div className="p-3 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[135px]">
            <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">52W Range</span>
            <div className="flex items-baseline justify-between mt-1 text-xs font-mono tabular-nums text-zinc-200">
              <span>{meta.low_52w.toFixed(2)}</span>
              <span className="text-zinc-600">&bull;</span>
              <span>{meta.high_52w.toFixed(2)}</span>
            </div>
            <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${yearProgress}%` }} />
            </div>
          </div>

          {/* Base 1000 Return */}
          <div className="p-3 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[135px]">
            <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Base 1000 Return</span>
            <div className="mt-1">
              <span className={`text-sm font-bold font-mono tabular-nums ${meta.all_time_return_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fmtPcts(meta.all_time_return_pct)}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 block mt-1">1-Year Inception</span>
          </div>

          {/* Day Open / Prev */}
          <div className="p-3 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[135px]">
            <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Day Open / Prev</span>
            <div className="mt-1 flex items-baseline justify-between text-xs font-mono tabular-nums text-zinc-200">
              <span>{meta.day_open.toFixed(2)}</span>
              <span className="text-zinc-600">/</span>
              <span>{meta.prev_close.toFixed(2)}</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 block mt-1">Equal Weight Base</span>
          </div>
        </div>
      </div>
    </section>
  );
}
