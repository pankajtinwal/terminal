import type { IndexMeta } from '../types';

interface SectorPillsProps {
  indices: IndexMeta[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function SectorPills({ indices, activeId, onSelect }: SectorPillsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar scroll-smooth">
      {indices.map((idx) => {
        const active = idx.id === activeId;
        return (
          <button
            key={idx.id}
            onClick={() => onSelect(idx.id)}
            className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              active
                ? 'bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-800/50 hover:border-zinc-700'
            }`}
          >
            <span>{idx.name}</span>
            <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded border ${
              active
                ? 'bg-zinc-900 text-zinc-300 border-zinc-700'
                : 'bg-zinc-950/70 text-zinc-500 border-zinc-800/80'
            }`}>
              {idx.constituents_count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

