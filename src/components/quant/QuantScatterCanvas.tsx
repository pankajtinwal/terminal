import { useState, useRef, useMemo } from 'react';
import type { QuantModelKey, QuantModelData, AnyQuantPoint, EMAPoint, MomentumPoint, KinematicPoint, OUPoint, FractalPoint } from '../../types';
import { fmtInr } from '../../utils/formatters';

interface QuantScatterCanvasProps {
  modelKey: QuantModelKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelData: QuantModelData<any>;
  selectedTicker: string | null;
  onSelectTicker: (t: string | null) => void;
  filterSector: string;
  searchQuery: string;
  flaggedOnly: boolean;
}

interface TooltipInfo {
  point: AnyQuantPoint;
  cx: number;
  cy: number;
}

export default function QuantScatterCanvas({
  modelKey,
  modelData,
  selectedTicker,
  onSelectTicker,
  filterSector,
  searchQuery,
  flaggedOnly,
}: QuantScatterCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  // Chart Dimensions
  const W = 1000;
  const H = 580;
  const pad = { top: 40, right: 40, bottom: 55, left: 65 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const points = (modelData.points || []) as AnyQuantPoint[];

  // Determine Domain Ranges
  const domain = useMemo(() => {
    if (points.length === 0) {
      return { minX: -10, maxX: 10, minY: -10, maxY: 10 };
    }

    if (modelKey === 'ou') {
      // Logarithmic X domain for half-life: 1 to 250
      const minY = Math.min(-3.5, ...points.map(p => p.y));
      const maxY = Math.max(3.5, ...points.map(p => p.y));
      return { minX: 1, maxX: 250, minY: Math.floor(minY) - 0.5, maxY: Math.ceil(maxY) + 0.5, isLogX: true };
    }

    if (modelKey === 'fractal') {
      const minY = Math.min(-15, ...points.map(p => p.y));
      const maxY = Math.max(25, ...points.map(p => p.y));
      return { minX: 0.2, maxX: 0.9, minY: Math.floor(minY / 5) * 5, maxY: Math.ceil(maxY / 5) * 5 };
    }

    if (modelKey === 'kinematic') {
      const maxZ = Math.max(3.5, ...points.map(p => Math.max(Math.abs(p.x), Math.abs(p.y))));
      const lim = Math.ceil(maxZ * 1.1);
      return { minX: -lim, maxX: lim, minY: -lim, maxY: lim };
    }

    // Default linear auto-fit with padding
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const rawMinX = Math.min(...xs);
    const rawMaxX = Math.max(...xs);
    const rawMinY = Math.min(...ys);
    const rawMaxY = Math.max(...ys);

    const padX = Math.max(1, (rawMaxX - rawMinX) * 0.08);
    const padY = Math.max(1, (rawMaxY - rawMinY) * 0.08);

    return {
      minX: rawMinX - padX,
      maxX: rawMaxX + padX,
      minY: rawMinY - padY,
      maxY: rawMaxY + padY,
    };
  }, [points, modelKey]);

  // Coordinate scales
  const scaleX = (val: number): number => {
    if (domain.isLogX) {
      const minLog = Math.log10(domain.minX);
      const maxLog = Math.log10(domain.maxX);
      const curLog = Math.log10(Math.max(domain.minX, val));
      return pad.left + ((curLog - minLog) / (maxLog - minLog)) * innerW;
    }
    return pad.left + ((val - domain.minX) / (domain.maxX - domain.minX)) * innerW;
  };

  const scaleY = (val: number): number => {
    return pad.top + ((domain.maxY - val) / (domain.maxY - domain.minY)) * innerH;
  };

  // Generate Ticks
  const xTicks = useMemo(() => {
    if (domain.isLogX) {
      return [1, 2, 5, 10, 20, 50, 100, 200];
    }
    const count = 7;
    const step = (domain.maxX - domain.minX) / count;
    const ticks: number[] = [];
    for (let i = 0; i <= count; i++) {
      ticks.push(domain.minX + i * step);
    }
    return ticks;
  }, [domain]);

  const yTicks = useMemo(() => {
    const count = 6;
    const step = (domain.maxY - domain.minY) / count;
    const ticks: number[] = [];
    for (let i = 0; i <= count; i++) {
      ticks.push(domain.minY + i * step);
    }
    return ticks;
  }, [domain]);

  // Model 2: OLS Line and Confidence Bands
  const regressionLines = useMemo(() => {
    if (modelKey !== 'momentum' || !modelData.regression) return null;
    const reg = modelData.regression;
    const pts = 50;
    const step = (domain.maxX - domain.minX) / pts;

    const olsPoints: [number, number][] = [];
    const upperPoints: [number, number][] = [];
    const lowerPoints: [number, number][] = [];

    for (let i = 0; i <= pts; i++) {
      const xVal = domain.minX + i * step;
      const yFit = reg.alpha + reg.beta * (xVal / 100.0); // convert % back to raw
      const leverage = (1.0 / reg.n) + Math.pow((xVal / 100.0) - reg.x_mean, 2) / (reg.ss_xx || 0.001);
      const bandWidth = 2.0 * reg.std_err * Math.sqrt(Math.max(0.0001, 1.0 - leverage));

      olsPoints.push([scaleX(xVal), scaleY(yFit * 100.0)]);
      upperPoints.push([scaleX(xVal), scaleY((yFit + bandWidth) * 100.0)]);
      lowerPoints.push([scaleX(xVal), scaleY((yFit - bandWidth) * 100.0)]);
    }

    const toPath = (pArr: [number, number][]) => pArr.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

    return {
      olsPath: toPath(olsPoints),
      upperPath: toPath(upperPoints),
      lowerPath: toPath(lowerPoints),
    };
  }, [modelKey, modelData.regression, domain, innerW, innerH]);

  // Model 3: Mahalanobis Ellipse at D_M = 2.45
  const mahalanobisEllipsePath = useMemo(() => {
    if (modelKey !== 'kinematic') return null;
    const rho = (modelData.stats?.rho as number) ?? 0.2;
    const r = 2.45; // Chi-Square 95% threshold
    const steps = 64;
    const coords: [number, number][] = [];

    // Parametric decomposition of ellipse:
    // Sigma = [[1, rho], [rho, 1]]
    // Eigenvalues: 1 + rho, 1 - rho
    // Eigenvectors: [1, 1]/sqrt(2), [-1, 1]/sqrt(2)
    const l1 = Math.sqrt(Math.max(0.01, 1.0 + rho));
    const l2 = Math.sqrt(Math.max(0.01, 1.0 - rho));
    const invSqrt2 = 1.0 / Math.SQRT2;

    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * 2 * Math.PI;
      const u = r * Math.cos(theta);
      const v = r * Math.sin(theta);
      // Transform by eigenvector matrix
      const zx = (u * l1 - v * l2) * invSqrt2;
      const zy = (u * l1 + v * l2) * invSqrt2;

      coords.push([scaleX(zx), scaleY(zy)]);
    }

    return coords.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z';
  }, [modelKey, modelData.stats, domain, innerW, innerH]);

  // Check matching status for points
  const getPointStatus = (p: AnyQuantPoint) => {
    const qLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !qLower || p.ticker.toLowerCase().includes(qLower) || p.name.toLowerCase().includes(qLower);
    const matchesSector = filterSector === 'all' || p.sector === filterSector;

    let isFlagged = false;
    let pointColor = '#38bdf8'; // Default cyan
    let glowColor = '';

    if (modelKey === 'ema') {
      const ep = p as EMAPoint;
      pointColor = ep.is_bull ? '#10b981' : '#f43f5e';
      isFlagged = ep.is_pullback_buy;
      if (isFlagged) glowColor = '#10b981';
    } else if (modelKey === 'momentum') {
      const mp = p as MomentumPoint;
      isFlagged = mp.is_outlier;
      pointColor = isFlagged ? '#fbbf24' : '#38bdf8';
      if (isFlagged) glowColor = '#fbbf24';
    } else if (modelKey === 'kinematic') {
      const kp = p as KinematicPoint;
      isFlagged = kp.is_inflection;
      pointColor = isFlagged ? '#fbbf24' : (kp.quadrant === 1 ? '#10b981' : kp.quadrant === 3 ? '#f43f5e' : '#a1a1aa');
      if (isFlagged) glowColor = '#fbbf24';
    } else if (modelKey === 'ou') {
      const op = p as OUPoint;
      isFlagged = op.is_high_elasticity;
      pointColor = isFlagged ? '#10b981' : (op.spread_zscore < -1.5 ? '#38bdf8' : '#a1a1aa');
      if (isFlagged) glowColor = '#10b981';
    } else if (modelKey === 'fractal') {
      const fp = p as FractalPoint;
      isFlagged = fp.is_anti_fade || fp.is_persist_breakout;
      pointColor = fp.is_persist_breakout ? '#10b981' : (fp.is_anti_fade ? '#f43f5e' : '#a1a1aa');
      if (fp.is_persist_breakout) glowColor = '#10b981';
      if (fp.is_anti_fade) glowColor = '#f43f5e';
    }

    const isDimmed = !matchesSearch || !matchesSector || (flaggedOnly && !isFlagged);
    const isSelected = selectedTicker === p.ticker;

    return { isDimmed, isFlagged, pointColor, glowColor, isSelected };
  };

  return (
    <div ref={containerRef} className="relative w-full rounded-md border border-zinc-800 bg-[#09090b] overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block"
        style={{ minHeight: '480px', maxHeight: '620px' }}
      >
        <defs>
          <radialGradient id="outlierGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bullGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Plot Background */}
        <rect
          x={pad.left}
          y={pad.top}
          width={innerW}
          height={innerH}
          fill="#101216"
          stroke="#27272a"
          strokeWidth="1"
        />

        {/* Gridlines - Horizontal */}
        {yTicks.map((yVal, idx) => {
          const yPos = scaleY(yVal);
          if (yPos < pad.top || yPos > pad.top + innerH) return null;
          return (
            <g key={`y-grid-${idx}`}>
              <line
                x1={pad.left}
                y1={yPos}
                x2={pad.left + innerW}
                y2={yPos}
                stroke="#27272a"
                strokeWidth={yVal === 0 ? '1.5' : '0.8'}
                strokeDasharray={yVal === 0 ? '' : '3 3'}
                strokeOpacity={yVal === 0 ? '0.9' : '0.4'}
              />
              <text
                x={pad.left - 10}
                y={yPos + 3.5}
                fill="#71717a"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                textAnchor="end"
              >
                {yVal.toFixed(yVal % 1 === 0 ? 0 : 1)}
              </text>
            </g>
          );
        })}

        {/* Gridlines - Vertical */}
        {xTicks.map((xVal, idx) => {
          const xPos = scaleX(xVal);
          if (xPos < pad.left || xPos > pad.left + innerW) return null;
          return (
            <g key={`x-grid-${idx}`}>
              <line
                x1={xPos}
                y1={pad.top}
                x2={xPos}
                y2={pad.top + innerH}
                stroke="#27272a"
                strokeWidth={xVal === 0 ? '1.5' : '0.8'}
                strokeDasharray={xVal === 0 ? '' : '3 3'}
                strokeOpacity={xVal === 0 ? '0.9' : '0.4'}
              />
              <text
                x={xPos}
                y={pad.top + innerH + 18}
                fill="#71717a"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                textAnchor="middle"
              >
                {domain.isLogX ? `${xVal}d` : xVal.toFixed(xVal % 1 === 0 ? 0 : 1)}
              </text>
            </g>
          );
        })}

        {/* Overlays by Model */}

        {/* Model 1: EMA Quadrant Labels & Crosshairs */}
        {modelKey === 'ema' && (
          <>
            <text x={pad.left + innerW - 10} y={pad.top + 20} fill="#10b981" fillOpacity="0.4" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold" textAnchor="end">
              Q1: OVERBOUGHT SURGE
            </text>
            <text x={pad.left + 10} y={pad.top + 20} fill="#a1a1aa" fillOpacity="0.4" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold" textAnchor="start">
              Q2: COUNTERTREND RALLY
            </text>
            <text x={pad.left + 10} y={pad.top + innerH - 10} fill="#f43f5e" fillOpacity="0.4" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold" textAnchor="start">
              Q3: DOWNTREND OVERSOLD
            </text>
            <text x={pad.left + innerW - 10} y={pad.top + innerH - 10} fill="#10b981" fillOpacity="0.5" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold" textAnchor="end">
              Q4: PULLBACK BUY ZONE
            </text>
          </>
        )}

        {/* Model 2: Momentum OLS Line & Confidence Bands */}
        {modelKey === 'momentum' && regressionLines && (
          <g>
            {/* Confidence Bands */}
            <path d={regressionLines.upperPath} fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.75" />
            <path d={regressionLines.lowerPath} fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.75" />
            {/* OLS Fit Line */}
            <path d={regressionLines.olsPath} fill="none" stroke="#06b6d4" strokeWidth="1.8" strokeOpacity="0.9" />
            <text
              x={pad.left + innerW - 15}
              y={pad.top + 22}
              fill="#fbbf24"
              fontSize="10"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="bold"
              textAnchor="end"
            >
              +2.0σ Studentized Residual Upper Band (Breakout Zone)
            </text>
          </g>
        )}

        {/* Model 3: Kinematic Phase-Space Mahalanobis Ellipse */}
        {modelKey === 'kinematic' && (
          <>
            {mahalanobisEllipsePath && (
              <path
                d={mahalanobisEllipsePath}
                fill="#fbbf24"
                fillOpacity="0.04"
                stroke="#fbbf24"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                strokeOpacity="0.7"
              />
            )}
            <text x={pad.left + innerW - 10} y={pad.top + 20} fill="#10b981" fillOpacity="0.4" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold" textAnchor="end">
              Q1: ACCELERATING UPTREND
            </text>
            <text x={pad.left + 10} y={pad.top + 20} fill="#fbbf24" fillOpacity="0.7" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold" textAnchor="start">
              Q2: BOTTOM INFLECTION (DM &gt; 2.45)
            </text>
            <text x={pad.left + 10} y={pad.top + innerH - 10} fill="#f43f5e" fillOpacity="0.4" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold" textAnchor="start">
              Q3: ACCELERATING DOWNTREND
            </text>
            <text x={pad.left + innerW - 10} y={pad.top + innerH - 10} fill="#a1a1aa" fillOpacity="0.4" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold" textAnchor="end">
              Q4: EXHAUSTION TOP
            </text>
          </>
        )}

        {/* Model 4: OU High Elasticity Highlight Box */}
        {modelKey === 'ou' && (
          <g>
            <rect
              x={scaleX(1)}
              y={scaleY(-2.0)}
              width={scaleX(10) - scaleX(1)}
              height={scaleY(domain.minY) - scaleY(-2.0)}
              fill="#10b981"
              fillOpacity="0.07"
              stroke="#10b981"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              strokeOpacity="0.6"
            />
            <text
              x={scaleX(1.15)}
              y={scaleY(-2.2)}
              fill="#10b981"
              fontSize="10"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="bold"
            >
              HIGH ELASTICITY BUY ZONE (Half-Life &lt; 10d &amp; Z &lt; -2.0)
            </text>
          </g>
        )}

        {/* Model 5: Fractal Regime H = 0.5 Divider */}
        {modelKey === 'fractal' && (
          <g>
            <line
              x1={scaleX(0.5)}
              y1={pad.top}
              x2={scaleX(0.5)}
              y2={pad.top + innerH}
              stroke="#06b6d4"
              strokeWidth="1.8"
              strokeDasharray="6 4"
              strokeOpacity="0.8"
            />
            <text
              x={scaleX(0.48)}
              y={pad.top + 20}
              fill="#f43f5e"
              fillOpacity="0.8"
              fontSize="10"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="bold"
              textAnchor="end"
            >
              &larr; MEAN-REVERTING (H &lt; 0.50)
            </text>
            <text
              x={scaleX(0.52)}
              y={pad.top + 20}
              fill="#10b981"
              fillOpacity="0.8"
              fontSize="10"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="bold"
              textAnchor="start"
            >
              TREND PERSISTENT (H &gt; 0.50) &rarr;
            </text>
          </g>
        )}

        {/* Scatter Points */}
        {points.map(p => {
          const cx = scaleX(p.x);
          const cy = scaleY(p.y);
          if (cx < pad.left || cx > pad.left + innerW || cy < pad.top || cy > pad.top + innerH) return null;

          const { isDimmed, isFlagged, pointColor, isSelected } = getPointStatus(p);

          return (
            <g
              key={p.ticker}
              className="cursor-pointer transition-all duration-150"
              onClick={() => onSelectTicker(isSelected ? null : p.ticker)}
              onMouseEnter={() => setTooltip({ point: p, cx, cy })}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Flagged Aura Glow */}
              {isFlagged && !isDimmed && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 16 : 11}
                  fill={pointColor}
                  fillOpacity="0.25"
                  className="animate-pulse"
                />
              )}

              {/* Selection Ring */}
              {isSelected && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={8}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}

              {/* Core Point */}
              <circle
                cx={cx}
                cy={cy}
                r={isFlagged ? 5.5 : 4}
                fill={pointColor}
                stroke="#09090b"
                strokeWidth="1.2"
                opacity={isDimmed ? 0.12 : 0.95}
              />

              {/* Ticker label for Flagged Setups or Selected */}
              {(isFlagged || isSelected) && !isDimmed && (
                <text
                  x={cx}
                  y={cy - 8}
                  fill="#f4f4f5"
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow"
                >
                  {p.ticker}
                </text>
              )}
            </g>
          );
        })}

        {/* Axis Labels */}
        <text
          x={pad.left + innerW / 2}
          y={H - 12}
          fill="#a1a1aa"
          fontSize="11"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="600"
          textAnchor="middle"
        >
          {modelData.x_label}
        </text>

        <text
          transform={`rotate(-90)`}
          x={-(pad.top + innerH / 2)}
          y={18}
          fill="#a1a1aa"
          fontSize="11"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="600"
          textAnchor="middle"
        >
          {modelData.y_label}
        </text>
      </svg>

      {/* Hover Tooltip */}
      {tooltip && (
        <div
          className="absolute z-30 pointer-events-none p-3 rounded-md bg-[#121215]/95 border border-zinc-700 shadow-2xl text-xs font-mono text-zinc-200"
          style={{
            left: Math.min(tooltip.cx + 12, W - 240),
            top: Math.max(10, tooltip.cy - 70),
          }}
        >
          <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-1.5 mb-1.5">
            <div>
              <div className="font-bold text-zinc-100 text-sm">{tooltip.point.ticker}</div>
              <div className="text-[10px] text-zinc-400 font-sans truncate max-w-[150px]">{tooltip.point.name}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-zinc-200">₹{fmtInr(tooltip.point.price)}</div>
              <div className="text-[10px] text-zinc-500 font-sans">{tooltip.point.sector}</div>
            </div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between gap-3 text-zinc-400">
              <span>{modelData.x_label.split('(')[0]}:</span>
              <strong className="text-zinc-200 tabular-nums">{tooltip.point.x.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between gap-3 text-zinc-400">
              <span>{modelData.y_label.split('(')[0]}:</span>
              <strong className="text-zinc-200 tabular-nums">{tooltip.point.y.toFixed(2)}</strong>
            </div>

            {/* Model-specific extra details */}
            {modelKey === 'ema' && (
              <>
                <div className="flex justify-between gap-3 text-zinc-400">
                  <span>Regime:</span>
                  <span className={(tooltip.point as EMAPoint).is_bull ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {(tooltip.point as EMAPoint).is_bull ? 'Bull (>200 EMA)' : 'Bear (<200 EMA)'}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-zinc-400">
                  <span>Quadrant:</span>
                  <span className="text-zinc-300 font-bold">Q{(tooltip.point as EMAPoint).quadrant}</span>
                </div>
              </>
            )}

            {modelKey === 'momentum' && (
              <div className="flex justify-between gap-3 text-zinc-400">
                <span>Studentized Res:</span>
                <span className={(tooltip.point as MomentumPoint).is_outlier ? 'text-amber-400 font-bold' : 'text-zinc-300 font-bold'}>
                  {(tooltip.point as MomentumPoint).studentized_residual}σ
                </span>
              </div>
            )}

            {modelKey === 'kinematic' && (
              <div className="flex justify-between gap-3 text-zinc-400">
                <span>Mahalanobis DM:</span>
                <span className={(tooltip.point as KinematicPoint).is_inflection ? 'text-amber-400 font-bold' : 'text-zinc-300 font-bold'}>
                  {(tooltip.point as KinematicPoint).mahalanobis_dist}
                </span>
              </div>
            )}

            {modelKey === 'ou' && (
              <div className="flex justify-between gap-3 text-zinc-400">
                <span>Half-Life:</span>
                <span className="text-zinc-200 font-bold">{(tooltip.point as OUPoint).half_life_days} Days</span>
              </div>
            )}

            {modelKey === 'fractal' && (
              <div className="flex justify-between gap-3 text-zinc-400">
                <span>Regime:</span>
                <span className={(tooltip.point as FractalPoint).regime === 'trending' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {(tooltip.point as FractalPoint).regime.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
