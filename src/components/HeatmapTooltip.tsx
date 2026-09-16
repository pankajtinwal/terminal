import { createPortal } from 'react-dom';
import type { HeatmapStock, HeatmapTimeframe } from '../types';
import { fmtInr } from '../utils/formatters';
import { getHeatmapColor, getTextColorForBg } from '../utils/heatmapColors';

export interface TooltipState {
  stock: HeatmapStock;
  x: number;
  y: number;
  tf: HeatmapTimeframe;
}

interface HeatmapTooltipProps {
  tooltip: TooltipState | null;
}

export default function HeatmapTooltip({ tooltip }: HeatmapTooltipProps) {
  if (!tooltip) return null;
  const { stock, x, y, tf } = tooltip;
  const retVal = stock.returns?.[tf] ?? 0;
  const isUp = retVal >= 0;
  const bgColor = getHeatmapColor(retVal, tf);
  const textColor = getTextColorForBg(bgColor);

  const r = stock.returns ?? {};
  const periods: [string, string][] = [['1D','1d'],['1W','1w'],['1M','1m'],['3M','3m'],['6M','6m'],['1Y','1y']];

  return createPortal(
    <div
      className="p-3.5 rounded-lg shadow-2xl border border-zinc-700/80 bg-[#121215]/95 backdrop-blur-md w-72 max-w-xs text-xs font-mono pointer-events-none text-zinc-300"
      style={{ position: 'fixed', left: x, top: y, zIndex: 100 }}
    >
      <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2 mb-2">
        <div>
          <div className="text-sm font-bold font-mono text-zinc-100 tracking-tight">{stock.ticker}</div>
          <div className="text-[11px] text-zinc-400 truncate max-w-[160px] font-sans">{stock.name}</div>
        </div>
        <div className="px-1.5 py-0.5 rounded text-xs font-mono font-bold tabular-nums" style={{ background: bgColor, color: textColor }}>
          {isUp ? '+' : ''}{retVal.toFixed(2)}% ({tf.toUpperCase()})
        </div>
      </div>
      <div className="space-y-1.5 text-[11px] font-mono">
        <div className="flex justify-between text-zinc-400">
          <span>Sector:</span>
          <span className="text-zinc-200 font-sans font-medium text-right truncate max-w-[150px]">{stock.sector}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Latest Price:</span>
          <span className="text-zinc-100 font-bold tabular-nums">₹{fmtInr(stock.latest_close)}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Index Weight:</span>
          <span className="text-zinc-200 tabular-nums">{stock.weight_pct.toFixed(2)}%</span>
        </div>
      </div>
      <div className="mt-2.5 pt-2 border-t border-zinc-800">
        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block mb-1.5 font-mono">Performance Breakdown</span>
        <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
          {periods.map(([label, key]) => {
            const val = r[key];
            const up = val !== undefined && val >= 0;
            return (
              <div key={key} className="p-1 rounded bg-zinc-900 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[9px]">{label}</span>
                <span className={`font-bold tabular-nums ${val !== undefined ? (up ? 'text-emerald-400' : 'text-rose-400') : 'text-zinc-500'}`}>
                  {val !== undefined ? `${up ? '+' : ''}${val.toFixed(1)}%` : '--'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1 font-mono">
        <span>Click tile to view candlestick chart</span>
        <span>&rarr;</span>
      </div>
    </div>,
    document.body
  );
}
