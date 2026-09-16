import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3-hierarchy';
import type { HeatmapData, HeatmapTimeframe, HeatmapStock, HeatmapHierarchyMode, HeatmapSizingMode } from '../types';
import { getHeatmapColor, getTextColorForBg, matchesReturnBracket } from '../utils/heatmapColors';
import HeatmapTooltip, { type TooltipState } from './HeatmapTooltip';

interface HeatmapCanvasProps {
  heatmapData: HeatmapData;
  timeframe: HeatmapTimeframe;
  scope: string;
  search: string;
  activeReturnFilter: string | null;
  hierarchyMode: HeatmapHierarchyMode;
  sizingMode: HeatmapSizingMode;
  onTileClick: (indexId: string, ticker: string) => void;
}

interface LeafDatum extends HeatmapStock {
  value: number;
}
interface SectorDatum {
  name: string;
  slug: string;
  index_id: string;
  returns: Record<string, number>;
  children: LeafDatum[];
}
interface RootDatum {
  name: string;
  children: SectorDatum[];
}

export default function HeatmapCanvas({
  heatmapData,
  timeframe,
  scope,
  search,
  activeReturnFilter,
  hierarchyMode,
  sizingMode,
  onTileClick,
}: HeatmapCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [canvasDims, setCanvasDims] = useState({ width: 1200, height: 780 });

  const positionTooltip = useCallback((cx: number, cy: number): { x: number; y: number } => {
    const TW = 288; const TH = 260;
    let x = cx + 16; let y = cy + 16;
    if (x + TW > window.innerWidth - 10) x = cx - TW - 16;
    if (y + TH > window.innerHeight - 10) y = cy - TH - 16;
    return { x, y };
  }, []);

  // ResizeObserver to track container dimensions accurately
  useEffect(() => {
    if (!wrapperRef.current) return;
    const updateSize = () => {
      if (wrapperRef.current) {
        const w = wrapperRef.current.clientWidth || 1200;
        const h = wrapperRef.current.clientHeight || 780;
        setCanvasDims({ width: w, height: h });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return;
    const container = containerRef.current;
    const { width, height } = canvasDims;

    // Filter sectors by scope
    let sectors = heatmapData.sectors;
    if (scope !== 'all') sectors = sectors.filter(s => s.slug === scope);

    const getTileWeight = (st: HeatmapStock): number => {
      if (sizingMode === 'equal') return 1;
      const absRet = Math.abs(st.returns?.[timeframe] ?? 0);
      return Math.max(0.5, Math.round((absRet + 0.5) * 10) / 10);
    };

    let rootData: RootDatum;
    const isFlat = hierarchyMode === 'flat';

    if (isFlat) {
      // Flat Overview: all stocks directly inside a single container
      const allStocks = sectors.flatMap(sec => sec.stocks);
      rootData = {
        name: 'Market',
        children: [
          {
            name: 'All Stocks',
            slug: 'all',
            index_id: 'master_index',
            returns: {},
            children: allStocks.map(st => ({ ...st, value: getTileWeight(st) })),
          },
        ],
      };
    } else {
      // Sector Hierarchy: nested by sector boxes
      rootData = {
        name: 'Market',
        children: sectors.map(sec => ({
          name: sec.name,
          slug: sec.slug,
          index_id: sec.index_id,
          returns: sec.returns,
          children: sec.stocks.map(st => ({ ...st, value: getTileWeight(st) })),
        })),
      };
    }

    const root = d3.hierarchy<RootDatum | SectorDatum | LeafDatum>(rootData as RootDatum)
      .sum(d => (d as LeafDatum).value ?? 0)
      .sort((a, b) => ((b.value ?? 0) - (a.value ?? 0)));

    d3.treemap<RootDatum | SectorDatum | LeafDatum>()
      .size([width, height])
      .tile(d3.treemapSquarify.ratio(1.3))
      .paddingTop(isFlat ? 2 : 24)
      .paddingRight(2)
      .paddingBottom(2)
      .paddingLeft(2)
      .paddingInner(2)
      .round(true)(root);

    container.innerHTML = '';
    const queryLow = search.toLowerCase().trim();

    // Render Sector borders (only when in sector hierarchy mode)
    if (!isFlat) {
      root.children?.forEach(sectorNode => {
        const nd = sectorNode as d3.HierarchyRectangularNode<SectorDatum>;
        const secW = nd.x1 - nd.x0; const secH = nd.y1 - nd.y0;
        if (secW < 10 || secH < 10) return;
        const secData = nd.data as SectorDatum;
        const secRet = secData.returns?.[timeframe] ?? 0;
        const isUp = secRet >= 0;

        const box = document.createElement('div');
        box.style.cssText = `position:absolute;left:${nd.x0}px;top:${nd.y0}px;width:${secW}px;height:${secH}px;box-sizing:border-box;border:1px solid #27272a;background:rgba(18,18,21,0.7);border-radius:4px;overflow:hidden;`;

        const title = document.createElement('div');
        title.style.cssText = `position:absolute;top:0;left:0;right:0;height:22px;padding:2px 8px;font-size:11px;font-weight:600;letter-spacing:0.02em;color:#a1a1aa;background:#18181b;border-bottom:1px solid #27272a;display:flex;align-items:center;justify-content:space-between;white-space:nowrap;overflow:hidden;z-index:5;`;
        title.innerHTML = `<span style="cursor:pointer;overflow:hidden;text-overflow:ellipsis;" data-sector-id="${secData.index_id}">${secData.name} &rsaquo;</span><span style="font-family:'JetBrains Mono',monospace;font-weight:600;color:${isUp ? '#10b981' : '#f43f5e'}">${isUp ? '+' : ''}${secRet.toFixed(2)}%</span>`;
        box.appendChild(title);
        container.appendChild(box);
      });
    }

    // Render Stock tiles
    root.leaves().forEach(leaf => {
      const nd = leaf as d3.HierarchyRectangularNode<LeafDatum>;
      const w = nd.x1 - nd.x0; const h = nd.y1 - nd.y0;
      if (w < 4 || h < 4) return;
      const stock = nd.data as HeatmapStock;
      const retVal = stock.returns?.[timeframe] ?? 0;
      const bgColor = getHeatmapColor(retVal, timeframe);
      const textColor = getTextColorForBg(bgColor);

      const matchesSearch = !queryLow || stock.ticker.toLowerCase().includes(queryLow) || stock.name.toLowerCase().includes(queryLow);
      const matchesFilter = !activeReturnFilter || matchesReturnBracket(retVal, activeReturnFilter, timeframe);
      const dimmed = !matchesSearch || !matchesFilter;

      const tile = document.createElement('div');
      const isTiny = w < 48 || h < 32;
      const isSmall = w < 75 || h < 48;

      tile.style.cssText = `position:absolute;left:${nd.x0}px;top:${nd.y0}px;width:${w}px;height:${h}px;background:${bgColor};color:${textColor};border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4px;box-sizing:border-box;border:1px solid rgba(0,0,0,0.35);cursor:pointer;user-select:none;overflow:hidden;transition:transform 0.15s,filter 0.15s,box-shadow 0.15s;${dimmed ? 'opacity:0.12;filter:grayscale(90%);' : activeReturnFilter ? 'box-shadow:0 0 10px rgba(255,255,255,0.25);' : ''}`;

      if (isTiny) {
        tile.innerHTML = `<span style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:9px;letter-spacing:-0.02em;line-height:1">${stock.ticker}</span>`;
      } else if (isSmall) {
        tile.innerHTML = `<span style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:11px;letter-spacing:-0.02em;line-height:1.2">${stock.ticker}</span><span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;opacity:0.95;line-height:1;margin-top:2px">${retVal >= 0 ? '+' : ''}${retVal.toFixed(1)}%</span>`;
      } else {
        tile.innerHTML = `<span style="font-family:'JetBrains Mono',monospace;font-weight:800;font-size:14px;letter-spacing:-0.02em;line-height:1.2">${stock.ticker}</span><span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;opacity:0.95;line-height:1.2;margin-top:2px">${retVal >= 0 ? '+' : ''}${retVal.toFixed(2)}%</span>`;
      }

      tile.addEventListener('mouseenter', (e) => {
        tile.style.transform = 'scale(1.02)';
        tile.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
        tile.style.filter = dimmed ? 'opacity(0.4)' : 'brightness(1.18)';
        tile.style.zIndex = '20';
        const pos = positionTooltip(e.clientX, e.clientY);
        setTooltip({ stock, ...pos, tf: timeframe });
      });
      tile.addEventListener('mousemove', (e) => {
        const pos = positionTooltip(e.clientX, e.clientY);
        setTooltip(prev => prev ? { ...prev, ...pos } : null);
      });
      tile.addEventListener('mouseleave', () => {
        tile.style.transform = '';
        tile.style.boxShadow = dimmed ? '' : activeReturnFilter ? '0 0 10px rgba(255,255,255,0.25)' : '';
        tile.style.filter = dimmed ? 'opacity(0.12) grayscale(90%)' : '';
        tile.style.zIndex = '';
        setTooltip(null);
      });
      tile.addEventListener('click', () => {
        const parentData = (nd.parent?.data as unknown as SectorDatum);
        const indexId = parentData?.index_id ?? 'master_index';
        onTileClick(indexId, stock.ticker);
      });

      container.appendChild(tile);
    });
  }, [
    heatmapData,
    timeframe,
    scope,
    search,
    activeReturnFilter,
    hierarchyMode,
    sizingMode,
    canvasDims,
    positionTooltip,
    onTileClick,
  ]);

  return (
    <>
      <div
        ref={wrapperRef}
        className="relative w-full h-[680px] sm:h-[760px] lg:h-[820px] rounded-md overflow-hidden bg-[#09090b] border border-zinc-800"
      >
        <div ref={containerRef} className="relative w-full h-full" />
      </div>
      <HeatmapTooltip tooltip={tooltip} />
    </>
  );
}
