import { useState, useCallback, useEffect } from 'react';
import type { SummaryData, HeatmapData, WatchlistId } from '../types';

interface UseIndexDataReturn {
  summaryData: SummaryData | null;
  heatmapData: HeatmapData | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useIndexData(watchlist: WatchlistId = 'investment'): UseIndexDataReturn {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const ts = Date.now();
      if (watchlist === 'mtf') {
        const heatmapRes = await fetch(`data/mtf_heatmap_data.json?t=${ts}`);
        if (!heatmapRes.ok) throw new Error(`Failed to load MTF heatmap: ${heatmapRes.statusText}`);
        const heatmap = (await heatmapRes.json()) as HeatmapData;
        setSummaryData(null);
        setHeatmapData(heatmap);
      } else {
        const [summaryRes, heatmapRes] = await Promise.all([
          fetch(`data/indices_summary.json?t=${ts}`),
          fetch(`data/heatmap_data.json?t=${ts}`),
        ]);
        const [summary, heatmap] = await Promise.all([
          summaryRes.json() as Promise<SummaryData>,
          heatmapRes.json() as Promise<HeatmapData>,
        ]);
        setSummaryData(summary);
        setHeatmapData(heatmap);
      }
    } catch (err) {
      console.error('Failed to load index data:', err);
    } finally {
      setLoading(false);
    }
  }, [watchlist]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summaryData, heatmapData, loading, refresh };
}
