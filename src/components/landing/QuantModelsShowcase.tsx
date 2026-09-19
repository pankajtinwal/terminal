interface QuantModelsShowcaseProps {
  onLaunchTerminal: () => void;
}

export default function QuantModelsShowcase({ onLaunchTerminal }: QuantModelsShowcaseProps) {
  const models = [
    {
      id: '01',
      badge: 'Trend & Entry Timing',
      title: 'EMA Mean Reversion & Pullback Hunter',
      math: 'Price ∈ [EMA20, EMA50] & EMA20 > EMA50 > EMA200',
      description:
        'Eliminates chasing extended rallies. Filters out secular downtrends and alerts you strictly when strong sustained uptrend stocks pull back into the golden support zone between the 20 and 50 EMAs.',
      quadrants: ['Bull Run: Price > EMA20 > EMA50 > 200', 'Pullback Buy: Optimal low-risk swing entry', 'Trend Breakdown: Strict capital preservation exit'],
    },
    {
      id: '02',
      badge: 'Alpha vs Beta',
      title: 'Cross-Sectional Residual Momentum',
      math: 'R_i(t) = α_i + β_i · R_m(t) + ε_i(t)',
      description:
        'Standard momentum is deceptive when the broader Nifty rises 500 points. Residual momentum regresses stock returns against the market index, isolating pure idiosyncratic company strength from general market tide.',
      quadrants: ['Top Decile: Genuine idiosyncratic alpha', 'Market Beta: Pure macro beta ride', 'Negative Residual: Weak relative strength'],
    },
    {
      id: '03',
      badge: 'Physics-Based Leading Indicator',
      title: 'Kinematic Phase-Space Vector',
      math: 'v(t) = dx/dt (Velocity),  a(t) = d²x/dt² (Acceleration)',
      description:
        'Treats stock price motion through classical physics. A stock slowing down before a reversal prints negative acceleration days before the price visibly breaks down on retail charts.',
      quadrants: ['Rocket: High Velocity + Accelerating', 'Decelerating: Positive Velocity + Braking', 'Falling Knife: Negative Velocity + Sinking', 'Springboard: Bottom inflection point'],
    },
    {
      id: '04',
      badge: 'Stochastic Reversion',
      title: 'Ornstein-Uhlenbeck Mean Reversion',
      math: 'dX_t = θ(μ - X_t)dt + σ dW_t',
      description:
        'Calculates stochastic mean reversion half-life and equilibrium levels. Flags statistical extremes where the probability of price returning to fair-value equilibrium is statistically skewed in your favor.',
      quadrants: ['Half-Life t½: Days to mean reversion', 'Equilibrium Target μ: Mathematical anchor', 'Z-Score: Standard deviations from mean'],
    },
    {
      id: '05',
      badge: 'Chaos Theory',
      title: 'Fractal Dimension & Hurst Exponent',
      math: 'E[R(t)/S(t)] = c · t^H,   D = 2 - H',
      description:
        'Determines whether a stock is currently in a trending regime or random noise. H > 0.5 indicates persistent trending behavior suitable for swing trades; H < 0.5 warns of choppy mean-reverting churn.',
      quadrants: ['H > 0.60: Strong persistent trend', 'H ≈ 0.50: Pure Brownian random noise', 'H < 0.40: Anti-persistent / Rangebound'],
    },
  ];

  return (
    <section id="quant" className="py-20 sm:py-28 border-b border-zinc-800/80 bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Quantitative Edge
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              5 Mathematical Models Powering Systematic Portfolios
            </p>
            <p className="text-sm text-zinc-400">
              No subjective trendlines or vague astrology. Every signal is anchored in empirical mathematics, stochastic calculus, and Newtonian kinematics.
            </p>
          </div>

          <button
            type="button"
            onClick={onLaunchTerminal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-400 font-mono text-xs font-bold border border-zinc-700/80 transition cursor-pointer self-start md:self-auto"
          >
            <span>Launch Quant Models in Terminal</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((m) => (
            <div
              key={m.id}
              className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/40 transition duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-extrabold text-zinc-700 group-hover:text-emerald-500/80 transition">
                    #{m.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {m.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-100 group-hover:text-white transition">
                  {m.title}
                </h3>

                <div className="p-2 rounded bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                  <code>{m.math}</code>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="pt-5 border-t border-zinc-800/80 mt-4 space-y-1.5">
                {m.quadrants.map((q, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] font-mono text-zinc-300">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Call to action teaser card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-950/40 via-zinc-900/60 to-cyan-950/40 border border-emerald-500/30 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Full Interactive Scatter
              </span>
              <h3 className="text-lg font-bold text-white">
                Test All 5 Models on 216 MTF Securities
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Click any coordinate point in the terminal to inspect individual stock volatility, price to moving averages, and immediate action flags.
              </p>
            </div>

            <button
              type="button"
              onClick={onLaunchTerminal}
              className="mt-6 w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
            >
              Open Interactive Scatter Radar →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
