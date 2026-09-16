import { useState, useCallback, useEffect } from 'react';
import type { QuantData, WatchlistId } from '../types';

interface UseQuantDataReturn {
  quantData: QuantData | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useQuantData(watchlist: WatchlistId = 'investment'): UseQuantDataReturn {
  const [quantData, setQuantData] = useState<QuantData | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const ts = Date.now();
      const filename = watchlist === 'mtf' ? 'mtf_quant_models.json' : 'quant_models.json';
      const res = await fetch(`data/${filename}?t=${ts}`);
      if (!res.ok) throw new Error(`Failed to load quant models: ${res.statusText}`);
      const data: QuantData = await res.json();
      setQuantData(data);
    } catch (err) {
      console.error('Failed to load quant models data:', err);
    } finally {
      setLoading(false);
    }
  }, [watchlist]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { quantData, loading, refresh };
}
