import type { QuantModelKey, QuantModelData } from '../../types';

interface QuantModelHUDProps {
  modelKey: QuantModelKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelData: QuantModelData<any>;
}

export default function QuantModelHUD({ modelKey, modelData }: QuantModelHUDProps) {
  const stats = modelData.stats || {};
  const reg = modelData.regression;

  return (
    <section className="terminal-card rounded-lg p-3 sm:p-4 border border-zinc-800 bg-[#121215]/90 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Model Definition */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-zinc-800 text-zinc-300 border border-zinc-700/70">
              QUANTITATIVE SCATTER ENGINE
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {modelData.points.length} Cross-Sectional Assets
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <span>{modelData.name}</span>
          </h2>
          <div className="text-xs font-mono text-zinc-400 mt-1 flex flex-wrap items-center gap-2">
            <span className="text-zinc-500">X-AXIS:</span>
            <span className="text-zinc-300 font-medium">{modelData.x_label}</span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-zinc-500">Y-AXIS:</span>
            <span className="text-zinc-300 font-medium">{modelData.y_label}</span>
          </div>
        </div>

        {/* Right: Key Parameters HUD */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {modelKey === 'ema' && (
            <>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[110px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Structural Bulls</span>
                <div className="text-sm font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                  {stats.bull_count} <span className="text-[10px] font-normal text-zinc-500">(&gt;200 EMA)</span>
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[110px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Structural Bears</span>
                <div className="text-sm font-bold font-mono tabular-nums text-rose-400 mt-0.5">
                  {stats.bear_count} <span className="text-[10px] font-normal text-zinc-500">(&lt;200 EMA)</span>
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[125px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Pullback Buys</span>
                <div className="text-sm font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                  {stats.pullback_buy_count} <span className="text-[10px] font-normal text-zinc-500">(Q4 Bull)</span>
                </div>
              </div>
            </>
          )}

          {modelKey === 'momentum' && reg && (
            <>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[150px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">OLS Fit</span>
                <div className="text-xs font-bold font-mono tabular-nums text-zinc-200 mt-0.5">
                  y = {reg.alpha > 0 ? '+' : ''}{reg.alpha} + {reg.beta}x
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[90px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">R-Squared</span>
                <div className="text-sm font-bold font-mono tabular-nums text-cyan-400 mt-0.5">
                  {(reg.r_squared * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[95px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Residual SE</span>
                <div className="text-sm font-bold font-mono tabular-nums text-zinc-200 mt-0.5">
                  {(reg.std_err * 100).toFixed(2)}%
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[110px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Outliers</span>
                <div className="text-sm font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                  {stats.outlier_count} <span className="text-[10px] font-normal text-zinc-500">(&gt; +2.0σ)</span>
                </div>
              </div>
            </>
          )}

          {modelKey === 'kinematic' && (
            <>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[100px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Mean Velocity</span>
                <div className="text-sm font-bold font-mono tabular-nums text-zinc-200 mt-0.5">
                  {typeof stats.mean_v === 'number' ? (stats.mean_v >= 0 ? '+' : '') + stats.mean_v.toFixed(2) + '%' : '--'}
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[110px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Mean Accel</span>
                <div className="text-sm font-bold font-mono tabular-nums text-zinc-200 mt-0.5">
                  {typeof stats.mean_a === 'number' ? (stats.mean_a >= 0 ? '+' : '') + stats.mean_a.toFixed(2) + '%' : '--'}
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[95px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Correlation ρ</span>
                <div className="text-sm font-bold font-mono tabular-nums text-cyan-400 mt-0.5">
                  {typeof stats.rho === 'number' ? stats.rho.toFixed(3) : '--'}
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[120px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Q2 Inflections</span>
                <div className="text-sm font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                  {stats.q2_inflection_count} <span className="text-[10px] font-normal text-zinc-500">(DM &gt; 2.45)</span>
                </div>
              </div>
            </>
          )}

          {modelKey === 'ou' && (
            <>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[120px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Median Half-Life</span>
                <div className="text-sm font-bold font-mono tabular-nums text-zinc-200 mt-0.5">
                  {stats.median_half_life} <span className="text-[10px] font-normal text-zinc-500">Days</span>
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[130px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">High Elasticity</span>
                <div className="text-sm font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                  {stats.high_elasticity_count} <span className="text-[10px] font-normal text-zinc-500">(&lt;10d & Z&lt;-2)</span>
                </div>
              </div>
            </>
          )}

          {modelKey === 'fractal' && (
            <>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[110px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Mean Hurst (H)</span>
                <div className="text-sm font-bold font-mono tabular-nums text-cyan-400 mt-0.5">
                  {stats.mean_hurst} <span className="text-[10px] font-normal text-zinc-500">(120-Day)</span>
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[125px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Trend Breakouts</span>
                <div className="text-sm font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                  {stats.persist_breakout_count} <span className="text-[10px] font-normal text-zinc-500">(H&gt;0.60)</span>
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 min-w-[120px]">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">Reversal Fades</span>
                <div className="text-sm font-bold font-mono tabular-nums text-rose-400 mt-0.5">
                  {stats.anti_fade_count} <span className="text-[10px] font-normal text-zinc-500">(H&lt;0.40)</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
