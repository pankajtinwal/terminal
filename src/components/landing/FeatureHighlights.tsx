export default function FeatureHighlights() {
  const features = [
    {
      icon: (
        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      badge: '3.5x - 4.0x Margin',
      title: 'MTF Leveraged Swing Radar',
      description:
        'Curated exclusively for swing traders utilizing broker Margin Trading Facility (MTF). Filter 216 high-margin liquid equities to maximize capital efficiency without intraday time pressure.',
    },
    {
      icon: (
        <svg className="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      badge: 'Koyfin & Finviz Grade',
      title: 'Multi-Timeframe Treemap Heatmap',
      description:
        'Visualize market performance from 1-Day to 1-Year instantly. Toggle between Sector Hierarchy and Flat views, size tiles by return magnitude, and filter by discrete return brackets.',
    },
    {
      icon: (
        <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" /><path d="M12 3v18" /><path d="M3 12h18" />
        </svg>
      ),
      badge: 'Zero Cap Distortion',
      title: 'Equal-Weighted Benchmark Engine',
      description:
        'Traditional indices like Nifty 50 are 38% concentrated in just 5 mega-caps. Our 1/n synthetic engine gives every company equal say to reveal authentic market breadth and accumulation.',
    },
    {
      icon: (
        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      badge: 'Quantitative Edge',
      title: '5 Mathematical Alpha Models',
      description:
        'Deploy institutional quantitative physics: EMA mean reversion pullback hunting, cross-sectional residual momentum, kinematic phase-space vectors, Ornstein-Uhlenbeck spreads, and fractal Hurst regimes.',
    },
    {
      icon: (
        <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      badge: '15 Sectors',
      title: 'Macro & Sector Rotation Radar',
      description:
        'Track rotational capital flows across Defense, Capital Goods, Financials, Tech, Energy, Realty, Auto, and Pharma to enter leading sectors before consensus retail catch on.',
    },
    {
      icon: (
        <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      badge: '0ms Latency',
      title: 'Ultra-Fast Client-Side Architecture',
      description:
        'Built with zero bloat. Runs on TradingView lightweight-charts and D3-hierarchy algorithms with instantaneous client-side sorting and filtering. Never wait on slow server-side page loads.',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 border-b border-zinc-800/80 bg-[#0c0c0e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            Institutional Architecture
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Systematic Traders Who Require an Unfair Edge
          </p>
          <p className="text-sm text-zinc-400">
            Every feature in this terminal was engineered to solve the real blind spots of retail trading platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/90 hover:border-zinc-700 transition duration-200 flex flex-col justify-between group hover:bg-zinc-900/70"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center group-hover:scale-105 transition">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition">
                  {feat.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
