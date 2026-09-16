import { useState } from 'react';
import type { QuantModelKey, WatchlistId } from '../../types';
import { useQuantData } from '../../hooks/useQuantData';
import QuantModelTabs from './QuantModelTabs';
import QuantModelHUD from './QuantModelHUD';
import QuantScatterCanvas from './QuantScatterCanvas';
import QuantWatchlistTable from './QuantWatchlistTable';

interface QuantDashboardProps {
  watchlist?: WatchlistId;
  selectedTicker?: string | null;
  onSelectTicker?: (ticker: string | null) => void;
}

export default function QuantDashboard({
  watchlist = 'investment',
  selectedTicker: externalSelectedTicker,
  onSelectTicker: externalOnSelectTicker,
}: QuantDashboardProps) {
  const { quantData, loading } = useQuantData(watchlist);
  const [activeModel, setActiveModel] = useState<QuantModelKey>('ema');
  const [internalSelectedTicker, setInternalSelectedTicker] = useState<string | null>(null);

  const selectedTicker = externalSelectedTicker !== undefined ? externalSelectedTicker : internalSelectedTicker;
  const setSelectedTicker = externalOnSelectTicker ?? setInternalSelectedTicker;

  const [filterSector, setFilterSector] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flaggedOnly, setFlaggedOnly] = useState<boolean>(false);

  if (loading && !quantData) {
    return (
      <div className="flex items-center justify-center gap-3 py-32">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-zinc-400">Loading Quantitative Scatter Models...</span>
      </div>
    );
  }

  if (!quantData) {
    return (
      <div className="text-center py-24 text-zinc-500 font-mono text-xs">
        No quantitative model data available. Run <code className="text-zinc-300">python3 build_indices.py</code> to generate model outputs.
      </div>
    );
  }

  const modelData = quantData.models[activeModel];

  // Live stats summary for the 5 tabs
  const tabStats = {
    emaPullbackCount: (quantData.models.ema.stats?.pullback_buy_count as number) || 0,
    momentumOutlierCount: (quantData.models.momentum.stats?.outlier_count as number) || 0,
    kinematicInflectionCount: (quantData.models.kinematic.stats?.q2_inflection_count as number) || 0,
    ouElasticCount: (quantData.models.ou.stats?.high_elasticity_count as number) || 0,
    fractalBreakoutCount: (quantData.models.fractal.stats?.persist_breakout_count as number) || 0,
  };

  return (
    <div className="space-y-4">
      {/* 5 Model Selector Tabs */}
      <QuantModelTabs
        activeModel={activeModel}
        onSelectModel={(m) => {
          setActiveModel(m);
          setSelectedTicker(null);
        }}
        stats={tabStats}
      />

      {/* Active Model HUD Stats */}
      <QuantModelHUD
        modelKey={activeModel}
        modelData={modelData}
      />

      {/* Main Scatter Visualizer */}
      <section className="terminal-card rounded-lg p-3 sm:p-4 border border-zinc-800 bg-[#121215]/90 space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider">
              {modelData.name} &bull; Cross-Sectional Geometry
            </span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 hidden sm:block">
            Click any point to lock watchlist selection &bull; Hover for statistical metrics
          </div>
        </div>

        <QuantScatterCanvas
          modelKey={activeModel}
          modelData={modelData}
          selectedTicker={selectedTicker}
          onSelectTicker={setSelectedTicker}
          filterSector={filterSector}
          searchQuery={searchQuery}
          flaggedOnly={flaggedOnly}
        />
      </section>

      {/* Constituents & Setups Watchlist Table */}
      <QuantWatchlistTable
        modelKey={activeModel}
        modelData={modelData}
        selectedTicker={selectedTicker}
        onSelectTicker={setSelectedTicker}
        filterSector={filterSector}
        onFilterSector={setFilterSector}
        searchQuery={searchQuery}
        onSearchQuery={setSearchQuery}
        flaggedOnly={flaggedOnly}
        onToggleFlaggedOnly={() => setFlaggedOnly(prev => !prev)}
      />
    </div>
  );
}
