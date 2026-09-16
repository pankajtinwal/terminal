import type { CrosshairData } from '../types';

interface CrosshairHUDProps { data: CrosshairData | null; }

export default function CrosshairHUD({ data }: CrosshairHUDProps) {
  const d = data;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-zinc-400">
      <span className="flex items-center gap-1.5">
        <span className="text-zinc-500 font-medium text-[11px]">DATE</span>
        <strong className="text-zinc-200 tabular-nums font-semibold">{d?.date ?? '--'}</strong>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-zinc-500 font-medium text-[11px]">O</span>
        <strong className="text-zinc-200 tabular-nums font-semibold">{d?.open ?? '--'}</strong>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-zinc-500 font-medium text-[11px]">H</span>
        <strong className="text-emerald-400 tabular-nums font-semibold">{d?.high ?? '--'}</strong>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-zinc-500 font-medium text-[11px]">L</span>
        <strong className="text-rose-400 tabular-nums font-semibold">{d?.low ?? '--'}</strong>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-zinc-500 font-medium text-[11px]">C</span>
        <strong className="text-zinc-200 tabular-nums font-semibold">{d?.close ?? '--'}</strong>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-zinc-500 font-medium text-[11px]">CHG</span>
        <strong className={`tabular-nums font-semibold ${d ? (d.isUp ? 'text-emerald-400' : 'text-rose-400') : 'text-zinc-200'}`}>
          {d?.returnPct ?? '--'}
        </strong>
      </span>
    </div>
  );
}

