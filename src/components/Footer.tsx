interface FooterProps {
  lastUpdated: string;
}

export default function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="border-t border-zinc-800/80 mt-12 py-4 text-xs font-mono text-zinc-500 bg-[#0c0c0e]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-zinc-400">ALPHA 132 Synthetic Index Engine</span>
          <span className="text-zinc-600">&bull;</span>
          <span className="text-zinc-500">Base 1000 Equal-Weight</span>
        </div>
        <div className="text-zinc-400">
          Last Sync: <span className="text-zinc-200 tabular-nums">{lastUpdated}</span>
        </div>
        <div className="text-[11px] text-zinc-500">
          Post-Market Cache: 3:40 PM IST &bull; Intraday: 1:00 PM IST
        </div>
      </div>
    </footer>
  );
}

