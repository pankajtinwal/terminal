import type { QuantModelKey } from '../../types';

interface QuantModelTabsProps {
  activeModel: QuantModelKey;
  onSelectModel: (m: QuantModelKey) => void;
  stats: {
    emaPullbackCount: number;
    momentumOutlierCount: number;
    kinematicInflectionCount: number;
    ouElasticCount: number;
    fractalBreakoutCount: number;
  };
}

const MODELS: { key: QuantModelKey; num: string; title: string; subtitle: string; statKey: keyof QuantModelTabsProps['stats']; statLabel: string }[] = [
  {
    key: 'ema',
    num: '01',
    title: 'EMA Mean Reversion',
    subtitle: '50 vs. 20 EMA Extension',
    statKey: 'emaPullbackCount',
    statLabel: 'Pullback Buys',
  },
  {
    key: 'momentum',
    num: '02',
    title: 'Residual Momentum',
    subtitle: '60D vs. 5D OLS Regression',
    statKey: 'momentumOutlierCount',
    statLabel: 'Outliers',
  },
  {
    key: 'kinematic',
    num: '03',
    title: 'Kinematic Phase-Space',
    subtitle: 'Velocity vs. Acceleration',
    statKey: 'kinematicInflectionCount',
    statLabel: 'Q2 Inflections',
  },
  {
    key: 'ou',
    num: '04',
    title: 'Ornstein-Uhlenbeck',
    subtitle: 'Elastic Half-Life vs. Z-Score',
    statKey: 'ouElasticCount',
    statLabel: 'High Elastic',
  },
  {
    key: 'fractal',
    num: '05',
    title: 'Fractal Regime',
    subtitle: '120D Hurst vs. 50 SMA',
    statKey: 'fractalBreakoutCount',
    statLabel: 'Breakouts',
  },
];

export default function QuantModelTabs({ activeModel, onSelectModel, stats }: QuantModelTabsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {MODELS.map(m => {
        const isActive = activeModel === m.key;
        const count = stats[m.statKey];
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => onSelectModel(m.key)}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              isActive
                ? 'bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm ring-1 ring-zinc-500/30'
                : 'bg-[#121215]/80 text-zinc-400 border-zinc-800/90 hover:bg-zinc-800/40 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className={`text-[10px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded border ${
                isActive ? 'bg-zinc-900 text-emerald-400 border-zinc-700' : 'bg-zinc-950/60 text-zinc-500 border-zinc-800'
              }`}>
                {m.num}
              </span>
              {count > 0 && (
                <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded font-semibold border ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}>
                  {count} {m.statLabel}
                </span>
              )}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold tracking-tight text-zinc-100">
                {m.title}
              </div>
              <div className="text-[11px] font-mono text-zinc-400 mt-0.5 truncate">
                {m.subtitle}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
