interface LandingFooterProps {
  onLaunchTerminal: () => void;
}

export default function LandingFooter({ onLaunchTerminal }: LandingFooterProps) {
  return (
    <footer className="bg-[#09090b] border-t border-zinc-800/80 py-12 text-zinc-400 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-zinc-800/60 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-widest text-white uppercase">
              KOSHX QUANTITATIVE
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-zinc-400">
            <a href="#features" className="hover:text-zinc-200 transition">Features</a>
            <a href="#quant" className="hover:text-zinc-200 transition">Quant Models</a>
            <a href="#pricing" className="hover:text-zinc-200 transition">Pricing</a>
            <a href="#faq" className="hover:text-zinc-200 transition">FAQ</a>
            <button
              type="button"
              onClick={onLaunchTerminal}
              className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
            >
              Launch Live Terminal →
            </button>
          </div>
        </div>

        <div className="space-y-4 text-zinc-500 text-[11px] leading-relaxed">
          <p>
            <strong className="text-zinc-400 font-semibold">Educational & Quantitative Analytics Disclaimer:</strong> The KoshX Terminal and its associated synthetic indices, treemaps, and mathematical models (EMA pullbacks, cross-sectional residual momentum, kinematic phase-space vectors, Ornstein-Uhlenbeck processes, and fractal Hurst regimes) are designed strictly for mathematical research, market structure analysis, and educational purposes. Nothing on this platform constitutes SEBI-registered investment advice or a solicitation to buy or sell securities.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-zinc-900">
            <p>© {new Date().getFullYear()} KoshX. All rights reserved.</p>
            <div className="flex items-center gap-4 text-zinc-500">
              <span>Cloudflare Edge Deployed</span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>All Systems Operational</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
