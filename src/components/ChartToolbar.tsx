import type { ChartMode, ChartTimeframe } from '../types';

const TF_OPTIONS: { value: ChartTimeframe; label: string }[] = [
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: 'ytd', label: 'YTD' },
  { value: 'all', label: '1Y' },
];

interface ChartToolbarProps {
  timeframe: ChartTimeframe;
  mode: ChartMode;
  onTimeframe: (tf: ChartTimeframe) => void;
  onMode: (m: ChartMode) => void;
  onResetZoom: () => void;
}

export default function ChartToolbar({ timeframe, mode, onTimeframe, onMode, onResetZoom }: ChartToolbarProps) {
  return (
    <div className="flex items-center gap-2 self-end sm:self-auto">
      {/* Timeframe Segmented Switch */}
      <div className="flex items-center p-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono">
        {TF_OPTIONS.map(t => (
          <button
            key={t.value}
            onClick={() => onTimeframe(t.value)}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
              timeframe === t.value
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Candle / Line Mode Switch */}
      <div className="flex items-center p-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono">
        <button
          onClick={() => onMode('candles')}
          className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1.5 cursor-pointer ${
            mode === 'candles'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="5" width="6" height="14" rx="1"/><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/>
          </svg>
          <span className="hidden sm:inline">Candles</span>
        </button>
        <button
          onClick={() => onMode('line')}
          className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1.5 cursor-pointer ${
            mode === 'line'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 18l6-6 4 4 8-8"/>
          </svg>
          <span className="hidden sm:inline">Line</span>
        </button>
      </div>

      {/* Reset Zoom */}
      <button
        onClick={onResetZoom}
        title="Reset Chart Zoom"
        className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
        </svg>
      </button>
    </div>
  );
}

