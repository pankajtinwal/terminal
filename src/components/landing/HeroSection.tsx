import { useState } from 'react';

interface HeroSectionProps {
  onLaunchTerminal: () => void;
  onOpenAuth: (mode: 'login' | 'signup', plan?: string) => void;
}

export default function HeroSection({ onLaunchTerminal, onOpenAuth }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'quant' | 'index'>('heatmap');

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-zinc-800/80">
      {/* Background ambient glowing radial gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[450px] h-[250px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/60 text-xs font-mono text-zinc-300 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-semibold">MTF 3.5x+ SWING RADAR</span>
            <span className="text-zinc-600">•</span>
            <span>Zero Market-Cap Distortion</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            KoshX: Quantitative Intelligence for{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Indian Equities
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Stop flying blind with traditional market-cap indices where 3 heavyweight stocks mask broad market distress. 
            Harness <span className="text-zinc-200 font-medium">equal-weighted synthetic indices</span>, dynamic multi-timeframe <span className="text-zinc-200 font-medium">treemap heatmaps</span>, and <span className="text-zinc-200 font-medium">5 mathematical alpha models</span> built specifically for high-leverage MTF swing trading.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onLaunchTerminal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-sm transition duration-200 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Launch Live Terminal (Free Demo)</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('signup', 'pro')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 font-mono text-sm border border-zinc-700/80 transition duration-200 cursor-pointer"
            >
              <span>Get Pro Access — ₹799/mo</span>
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Value Stats Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto">
            <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-center">
              <div className="text-xl font-mono font-bold text-emerald-400">216</div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">MTF Stocks (3.5x+)</div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-center">
              <div className="text-xl font-mono font-bold text-cyan-400">132</div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">KoshX Core Basket</div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-center">
              <div className="text-xl font-mono font-bold text-purple-400">5</div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Quant Alpha Models</div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-center">
              <div className="text-xl font-mono font-bold text-amber-400">15</div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Sector Benchmarks</div>
            </div>
          </div>
        </div>

        {/* Interactive Terminal Window Preview */}
        <div className="mt-12 sm:mt-16 rounded-xl border border-zinc-800 bg-[#121215]/90 shadow-2xl shadow-black/80 overflow-hidden">
          {/* Mockup Window Chrome Bar */}
          <div className="h-10 px-4 bg-[#18181b] border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-zinc-400 ml-2 hidden sm:inline">koshx.terminal • v2.4.0</span>
            </div>

            {/* Preview Tab Toggles */}
            <div className="flex items-center gap-1 p-0.5 rounded-md bg-[#09090b] border border-zinc-800 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('heatmap')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  activeTab === 'heatmap' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Treemap Heatmap
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quant')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  activeTab === 'quant' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Quant Models
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('index')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  activeTab === 'index' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Equal-Weight Index
              </button>
            </div>

            <button
              type="button"
              onClick={onLaunchTerminal}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Screen</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>

          {/* Interactive Mockup Body */}
          <div className="p-4 sm:p-6 bg-[#0c0c0e] min-h-[380px] sm:min-h-[440px] flex flex-col justify-center">
            {activeTab === 'heatmap' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">MTF Watchlist (216 Stocks)</span>
                    <span>1D Timeframe</span>
                    <span className="hidden sm:inline">• Equal Sized Tiles</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-600/80 text-white">+3.4%</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/60 text-white">+1.8%</span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300">0.0%</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/60 text-white">-1.5%</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-600/80 text-white">-3.8%</span>
                  </div>
                </div>

                {/* Visual Treemap Blocks Grid Mock */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex flex-col justify-between h-24 hover:border-emerald-400 transition cursor-pointer" onClick={onLaunchTerminal}>
                    <span className="text-xs font-mono font-bold text-white">RELIANCE</span>
                    <span className="text-[10px] text-zinc-400">₹2,980.5</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">+2.45%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-900/50 border border-emerald-500/40 flex flex-col justify-between h-24 hover:border-emerald-400 transition cursor-pointer" onClick={onLaunchTerminal}>
                    <span className="text-xs font-mono font-bold text-white">TCS</span>
                    <span className="text-[10px] text-zinc-400">₹4,215.0</span>
                    <span className="text-xs font-mono font-bold text-emerald-300">+3.12%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 flex flex-col justify-between h-24 hover:border-rose-400 transition cursor-pointer" onClick={onLaunchTerminal}>
                    <span className="text-xs font-mono font-bold text-white">HDFCBANK</span>
                    <span className="text-[10px] text-zinc-400">₹1,642.1</span>
                    <span className="text-xs font-mono font-bold text-rose-400">-1.20%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex flex-col justify-between h-24 hover:border-emerald-400 transition cursor-pointer" onClick={onLaunchTerminal}>
                    <span className="text-xs font-mono font-bold text-white">INFY</span>
                    <span className="text-[10px] text-zinc-400">₹1,780.0</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">+1.65%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-800/40 border border-emerald-400/40 flex flex-col justify-between h-24 hover:border-emerald-400 transition cursor-pointer" onClick={onLaunchTerminal}>
                    <span className="text-xs font-mono font-bold text-white">BHARTIARTL</span>
                    <span className="text-[10px] text-zinc-400">₹1,432.0</span>
                    <span className="text-xs font-mono font-bold text-emerald-300">+4.18%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 flex flex-col justify-between h-24 hover:border-rose-400 transition cursor-pointer" onClick={onLaunchTerminal}>
                    <span className="text-xs font-mono font-bold text-white">ICICIBANK</span>
                    <span className="text-[10px] text-zinc-400">₹1,185.4</span>
                    <span className="text-xs font-mono font-bold text-rose-400">-2.05%</span>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <span className="text-xs font-mono text-zinc-400">
                    Showing 6 of 216 securities. Click any tile to inspect alpha signals inside the terminal.
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'quant' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-zinc-800/80">
                  <span className="text-zinc-200 font-semibold">Kinematic Phase-Space Model (Velocity vs Acceleration)</span>
                  <span className="text-emerald-400">Leading Indicator of Trend Inflection</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                    <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold">Quadrant 1: Rocket</span>
                    <p className="text-xs text-zinc-300 mt-1">High Velocity + High Accel. Aggressive trend acceleration.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30">
                    <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">Quadrant 2: Decelerating</span>
                    <p className="text-xs text-zinc-300 mt-1">Positive Velocity + Negative Accel. Take profit warning.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30">
                    <span className="text-[11px] font-mono text-rose-400 uppercase font-bold">Quadrant 3: Falling Knife</span>
                    <p className="text-xs text-zinc-300 mt-1">Negative Velocity + Negative Accel. Strict short/avoid.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold">Quadrant 4: Springboard</span>
                    <p className="text-xs text-zinc-300 mt-1">Negative Velocity + Positive Accel. Early inflection breakout buy.</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-300">
                    Interactive Scatter View with crosshairs and quadrant coordinates available in Terminal.
                  </span>
                  <button
                    type="button"
                    onClick={onLaunchTerminal}
                    className="text-xs font-mono font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Open Scatter View →
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'index' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-zinc-800/80">
                  <span className="text-zinc-200 font-semibold">Equal-Weighted KoshX Core Benchmark</span>
                  <span className="text-cyan-400">1/n Weighting • Rebalanced Daily</span>
                </div>

                <div className="p-6 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-mono font-bold text-zinc-100">Zero Cap Distortion Equal-Weight Engine</h4>
                  <p className="text-xs text-zinc-400 max-w-lg">
                    See where the money is truly flowing across 13 economic sectors without Reliance, HDFC Bank, or Infosys masking market deterioration.
                  </p>
                  <button
                    type="button"
                    onClick={onLaunchTerminal}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-mono font-semibold transition cursor-pointer"
                  >
                    Inspect Interactive Candlestick Charts →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
