import { useEffect, useRef, useCallback } from 'react';
import * as LightweightCharts from 'lightweight-charts';
import type { OHLCCandle, ChartMode, ChartTimeframe, CrosshairData } from '../types';

interface LightweightChartProps {
  candles: OHLCCandle[];
  mode: ChartMode;
  timeframe: ChartTimeframe;
  onCrosshair: (data: CrosshairData | null) => void;
}

export default function LightweightChart({ candles, mode, timeframe, onCrosshair }: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<LightweightCharts.IChartApi | null>(null);
  const candleSeriesRef = useRef<LightweightCharts.ISeriesApi<'Candlestick'> | null>(null);
  const areaSeriesRef = useRef<LightweightCharts.ISeriesApi<'Area'> | null>(null);

  // Init chart once
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = LightweightCharts.createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { type: LightweightCharts.ColorType.Solid, color: '#09090b' },
        textColor: '#a1a1aa',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(39, 39, 42, 0.45)' },
        horzLines: { color: 'rgba(39, 39, 42, 0.45)' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: { width: 1, color: 'rgba(161, 161, 170, 0.4)', style: LightweightCharts.LineStyle.Dashed, labelBackgroundColor: '#18181b' },
        horzLine: { width: 1, color: 'rgba(161, 161, 170, 0.4)', style: LightweightCharts.LineStyle.Dashed, labelBackgroundColor: '#18181b' },
      },
      rightPriceScale: { borderColor: '#27272a', scaleMargins: { top: 0.1, bottom: 0.15 } },
      timeScale: { borderColor: '#27272a', timeVisible: true, secondsVisible: false },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    const candleOpts = { upColor: '#10b981', downColor: '#f43f5e', borderUpColor: '#10b981', borderDownColor: '#f43f5e', wickUpColor: '#10b981', wickDownColor: '#f43f5e' };
    const areaOpts = { topColor: 'rgba(16, 185, 129, 0.2)', bottomColor: 'rgba(16, 185, 129, 0)', lineColor: '#10b981', lineWidth: 2 as const, visible: false };

    // v5 API
    const cs = chart.addSeries(LightweightCharts.CandlestickSeries, candleOpts);
    const as = chart.addSeries(LightweightCharts.AreaSeries, areaOpts);

    candleSeriesRef.current = cs;
    areaSeriesRef.current = as;
    chartRef.current = chart;

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData || param.point === undefined) {
        onCrosshair(null);
        return;
      }
      const d = param.seriesData.get(cs) || param.seriesData.get(as);
      if (d) {
        const cData = d as { open?: number; high?: number; low?: number; close?: number; value?: number };
        const close = cData.close ?? cData.value ?? 0;
        const open = cData.open ?? close;
        const ret = open !== 0 ? ((close - open) / open) * 100 : 0;
        const timeStr = typeof param.time === 'string'
          ? param.time
          : `${(param.time as {year:number;month:number;day:number}).year}-${String((param.time as {year:number;month:number;day:number}).month).padStart(2,'0')}-${String((param.time as {year:number;month:number;day:number}).day).padStart(2,'0')}`;
        onCrosshair({
          date: timeStr,
          open: (cData.open ?? close).toFixed(2),
          high: (cData.high ?? close).toFixed(2),
          low: (cData.low ?? close).toFixed(2),
          close: close.toFixed(2),
          returnPct: (ret >= 0 ? '+' : '') + ret.toFixed(2) + '%',
          isUp: ret >= 0,
        });
      }
    });

    const ro = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      areaSeriesRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data when candles change
  useEffect(() => {
    if (!candleSeriesRef.current || !areaSeriesRef.current || candles.length === 0) return;
    candleSeriesRef.current.setData(candles as LightweightCharts.CandlestickData[]);
    areaSeriesRef.current.setData(candles.map(c => ({ time: c.time, value: c.close })) as LightweightCharts.LineData[]);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // Toggle mode
  useEffect(() => {
    if (!candleSeriesRef.current || !areaSeriesRef.current) return;
    candleSeriesRef.current.applyOptions({ visible: mode === 'candles' });
    areaSeriesRef.current.applyOptions({ visible: mode === 'line' });
  }, [mode]);

  // Apply timeframe filter
  useEffect(() => {
    if (!chartRef.current || candles.length === 0) return;
    const total = candles.length;
    if (timeframe === 'all') { chartRef.current.timeScale().fitContent(); return; }
    let daysBack = total;
    if (timeframe === '1m') daysBack = 22;
    else if (timeframe === '3m') daysBack = 66;
    else if (timeframe === '6m') daysBack = 130;
    else if (timeframe === 'ytd') {
      const yr = new Date().getFullYear().toString();
      const idx = candles.findIndex(c => c.time.startsWith(yr));
      daysBack = idx !== -1 ? total - idx : 60;
    }
    const start = Math.max(0, total - daysBack);
    const from = candles[start]?.time;
    const to = candles[total - 1]?.time;
    if (from && to) chartRef.current.timeScale().setVisibleRange({ from: from as LightweightCharts.Time, to: to as LightweightCharts.Time });
  }, [timeframe, candles]);

  return <div ref={containerRef} className="w-full h-full" />;
}
