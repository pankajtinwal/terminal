import { useEffect, useState, useCallback, useRef } from 'react';
import type {
  IndexMeta,
  OHLCCandle,
  ViewMode,
  WatchlistId,
  ChartMode,
  ChartTimeframe,
  HeatmapTimeframe,
  HeatmapHierarchyMode,
  HeatmapSizingMode,
  CrosshairData,
} from './types';
import { useIndexData } from './hooks/useIndexData';
import { fmtDate } from './utils/formatters';
import Navbar from './components/Navbar';
import SectorPills from './components/SectorPills';
import MetricHUD from './components/MetricHUD';
import ChartToolbar from './components/ChartToolbar';
import CrosshairHUD from './components/CrosshairHUD';
import LightweightChart from './components/LightweightChart';
import ConstituentsTable from './components/ConstituentsTable';
import HeatmapControls from './components/HeatmapControls';
import HeatmapCanvas from './components/HeatmapCanvas';
import QuantDashboard from './components/quant/QuantDashboard';
import Footer from './components/Footer';

export default function App() {
  // Watchlist state
  const [watchlist, setWatchlist] = useState<WatchlistId>('investment');
  const { summaryData, heatmapData, loading, refresh } = useIndexData(watchlist);

  // View state
  const [view, setView] = useState<ViewMode>('chart');
  const [currentIndexId, setCurrentIndexId] = useState('master_index');
  const [quantSelectedTicker, setQuantSelectedTicker] = useState<string | null>(null);

  // Chart state
  const [candles, setCandles] = useState<OHLCCandle[]>([]);
  const [chartMode, setChartMode] = useState<ChartMode>('candles');
  const [chartTf, setChartTf] = useState<ChartTimeframe>('all');
  const [crosshair, setCrosshair] = useState<CrosshairData | null>(null);
  const chartRef = useRef<import('lightweight-charts').IChartApi | null>(null);

  // Heatmap state
  const [hmTf, setHmTf] = useState<HeatmapTimeframe>('1d');
  const [hmScope, setHmScope] = useState('all');
  const [hmSearch, setHmSearch] = useState('');
  const [hmReturnFilter, setHmReturnFilter] = useState<string | null>(null);
  const [hmHierarchyMode, setHmHierarchyMode] = useState<HeatmapHierarchyMode>('sector');
  const [hmSizingMode, setHmSizingMode] = useState<HeatmapSizingMode>('equal');

  const currentMeta: IndexMeta | null = summaryData?.indices?.find(i => i.id === currentIndexId) ?? null;
  const lastUpdated = (watchlist === 'mtf' ? heatmapData?.updated_at : summaryData?.updated_at)
    ? fmtDate((watchlist === 'mtf' ? heatmapData?.updated_at : summaryData?.updated_at)!)
    : '--';

  // Initial load
  useEffect(() => { refresh(); }, [refresh]);

  // Handle watchlist switch
  const handleWatchlistChange = useCallback((newWatchlist: WatchlistId) => {
    setWatchlist(newWatchlist);
    setQuantSelectedTicker(null);
    if (newWatchlist === 'mtf') {
      // MTF watchlist does not have an index chart; immediately switch to heatmap if on chart
      setView(prev => (prev === 'chart' ? 'heatmap' : prev));
    }
  }, []);

  // Load candles when index changes
  const loadCandles = useCallback(async (meta: IndexMeta) => {
    try {
      const res = await fetch(`${meta.file}?t=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to fetch candle data');
      const data: OHLCCandle[] = await res.json();
      setCandles(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (currentMeta) loadCandles(currentMeta);
  }, [currentMeta, loadCandles]);

  // Handle tile click from heatmap
  const handleTileClick = useCallback((indexId: string, ticker: string) => {
    if (watchlist === 'mtf') {
      // In MTF mode: switch to Quant Models and highlight that stock
      setQuantSelectedTicker(ticker);
      setView('quant');
    } else {
      // In Investment mode: switch to chart view
      setCurrentIndexId(indexId);
      setView('chart');
      void ticker;
    }
  }, [watchlist]);

  const handleResetZoom = useCallback(() => {
    chartRef.current?.timeScale().fitContent();
  }, []);

  const handleToggleHierarchy = useCallback(() => {
    setHmHierarchyMode(prev => (prev === 'sector' ? 'flat' : 'sector'));
  }, []);

  const handleToggleSizing = useCallback(() => {
    setHmSizingMode(prev => (prev === 'equal' ? 'magnitude' : 'equal'));
  }, []);

  const handleTimeframeChange = useCallback((tf: HeatmapTimeframe) => {
    setHmTf(tf);
    setHmReturnFilter(null);
  }, []);

  const cacheStatus = watchlist === 'mtf'
    ? (heatmapData ? `Active • ${heatmapData.total_stocks || 216} MTF Stocks` : 'Loading MTF...')
    : (summaryData ? `Active • ${summaryData.indices?.find(i => i.type === 'master')?.constituents_count ?? 132} Stocks` : 'Loading...');

  return (
    <div className="text-zinc-200 min-h-screen flex flex-col bg-[#09090b] selection:bg-emerald-500/20 selection:text-emerald-300 font-sans">
      <Navbar
        view={view}
        onViewChange={setView}
        watchlist={watchlist}
        onWatchlistChange={handleWatchlistChange}
        onRefresh={refresh}
        loading={loading}
        cacheStatus={cacheStatus}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">

        {/* ── CHART VIEW ─────────────────────────────── */}
        {view === 'chart' && (
          <>
            {summaryData?.indices && (
              <SectorPills
                indices={summaryData.indices}
                activeId={currentIndexId}
                onSelect={setCurrentIndexId}
              />
            )}

            {currentMeta && <MetricHUD meta={currentMeta} />}

            <section className="terminal-card rounded-lg p-3 sm:p-4 border border-zinc-800 bg-[#121215]/90 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-2.5">
                <CrosshairHUD data={crosshair} />
                <ChartToolbar
                  timeframe={chartTf}
                  mode={chartMode}
                  onTimeframe={setChartTf}
                  onMode={setChartMode}
                  onResetZoom={handleResetZoom}
                />
              </div>
              <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[620px] rounded-md overflow-hidden bg-[#09090b] border border-zinc-800/80">
                {loading && candles.length === 0 && (
                  <div className="absolute inset-0 bg-[#09090b]/85 backdrop-blur-xs flex items-center justify-center gap-2.5 z-10">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono text-zinc-300">Synthesizing Equal-Weight Index...</span>
                  </div>
                )}
                <LightweightChart
                  candles={candles}
                  mode={chartMode}
                  timeframe={chartTf}
                  onCrosshair={setCrosshair}
                />
              </div>
            </section>

            {currentMeta && (
              <ConstituentsTable
                constituents={currentMeta.constituents}
                count={currentMeta.constituents_count}
              />
            )}
          </>
        )}

        {/* ── HEATMAP VIEW ───────────────────────────── */}
        {view === 'heatmap' && heatmapData && (
          <>
            <HeatmapControls
              timeframe={hmTf}
              scope={hmScope}
              search={hmSearch}
              sectors={heatmapData.sectors}
              activeReturnFilter={hmReturnFilter}
              hierarchyMode={hmHierarchyMode}
              sizingMode={hmSizingMode}
              onTimeframe={handleTimeframeChange}
              onScope={setHmScope}
              onSearch={setHmSearch}
              onReturnFilter={setHmReturnFilter}
              onToggleHierarchy={handleToggleHierarchy}
              onToggleSizing={handleToggleSizing}
            />
            <section className="terminal-card rounded-lg p-2.5 sm:p-3 border border-zinc-800 bg-[#121215]/90 relative overflow-hidden">
              <HeatmapCanvas
                heatmapData={heatmapData}
                timeframe={hmTf}
                scope={hmScope}
                search={hmSearch}
                activeReturnFilter={hmReturnFilter}
                hierarchyMode={hmHierarchyMode}
                sizingMode={hmSizingMode}
                onTileClick={handleTileClick}
              />
            </section>
          </>
        )}

        {view === 'heatmap' && !heatmapData && loading && (
          <div className="flex items-center justify-center gap-2.5 py-24">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-zinc-300">Computing Squarified Heatmap...</span>
          </div>
        )}

        {/* ── QUANT MODELS VIEW ─────────────────────── */}
        {view === 'quant' && (
          <QuantDashboard
            watchlist={watchlist}
            selectedTicker={quantSelectedTicker}
            onSelectTicker={setQuantSelectedTicker}
          />
        )}
      </main>

      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}
