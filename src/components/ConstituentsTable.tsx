import { useState } from 'react';
import type { StockConstituent } from '../types';
import { fmtInr } from '../utils/formatters';

interface ConstituentsTableProps {
  constituents: StockConstituent[];
  count: number;
}

export default function ConstituentsTable({ constituents, count }: ConstituentsTableProps) {
  const [query, setQuery] = useState('');

  const filtered = constituents.filter(c => {
    if (!query) return true;
    const q = query.toLowerCase();
    return c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q);
  });

  return (
    <section className="terminal-card rounded-lg p-4 border border-zinc-800 bg-[#121215]/90 space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2 font-mono">
            <span>Index Constituents</span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/80">
              {count} STOCKS
            </span>
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">Equal-weighted constituent breakdown and 1D momentum contribution</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search ticker or company..."
            className="w-full text-xs font-mono py-1.5 pl-8 pr-3 rounded-md bg-zinc-900 border border-zinc-700/60 text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none transition"
          />
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-zinc-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#18181b] text-zinc-400 font-semibold border-b border-zinc-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Constituent</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">Sector</th>
              <th className="py-2.5 px-3 text-center">Exchange</th>
              <th className="py-2.5 px-3 text-right">Weight</th>
              <th className="py-2.5 px-3 text-right">Latest Price</th>
              <th className="py-2.5 px-3 text-right">1D Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-zinc-500 font-mono">No stocks matching "{query}"</td></tr>
            ) : (
              filtered.map(stock => {
                const isUp = stock.change_pct >= 0;
                return (
                  <tr key={stock.ticker} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-2 px-3">
                      <div className="font-bold text-zinc-100 text-xs tracking-tight">{stock.ticker}</div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-[180px] sm:max-w-xs">{stock.name}</div>
                    </td>
                    <td className="py-2 px-3 hidden sm:table-cell text-zinc-300 text-xs">{stock.sector}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800/70 text-zinc-400 border border-zinc-700/60">{stock.exchange}</span>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-zinc-300">{stock.weight_pct.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold text-zinc-100">₹{fmtInr(stock.latest_close)}</td>
                    <td className="py-2 px-3 text-right">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold tabular-nums border ${
                        isUp
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {isUp ? '+' : ''}{stock.change_pct.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

