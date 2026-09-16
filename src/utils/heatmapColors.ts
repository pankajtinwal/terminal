import type { HeatmapTimeframe } from '../types';

export function getMaxVal(tf: HeatmapTimeframe): number {
  const map: Record<HeatmapTimeframe, number> = {
    '1d': 3, '1w': 6, '1m': 12, '3m': 25, '6m': 40, '1y': 60,
  };
  return map[tf] ?? 3;
}

// Color stops for multi-stop Excel-style gradient
// Higher magnitude => strictly darker, deeper shade
const RED_STOPS: [number, string][] = [
  [0.0,  '#F87171'], // light soft red
  [0.25, '#EF4444'], // medium red
  [0.50, '#DC2626'], // deep crimson red
  [0.75, '#B91C1C'], // dark crimson red
  [1.00, '#991B1B'], // deep dark red
  [1.50, '#7F1D1D'], // richest dark maroon
];

const GREEN_STOPS: [number, string][] = [
  [0.0,  '#34D399'], // light mint/emerald
  [0.25, '#10B981'], // medium emerald
  [0.50, '#059669'], // deep emerald
  [0.75, '#047857'], // dark forest green
  [1.00, '#065F46'], // deep forest green
  [1.50, '#064E3B'], // richest dark pine
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function interpolateStops(stops: [number, string][], t: number): string {
  const clampedT = Math.max(stops[0][0], Math.min(stops[stops.length - 1][0], t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [r0, c0] = stops[i];
    const [r1, c1] = stops[i + 1];
    if (clampedT >= r0 && clampedT <= r1) {
      const localT = r1 > r0 ? (clampedT - r0) / (r1 - r0) : 0;
      const [rA, gA, bA] = hexToRgb(c0);
      const [rB, gB, bB] = hexToRgb(c1);
      return rgbToHex(
        rA + localT * (rB - rA),
        gA + localT * (gB - gA),
        bA + localT * (bB - bA)
      );
    }
  }
  return stops[stops.length - 1][1];
}

/**
 * Excel-style single-hue gradient:
 * - Magnitude near 0 (flat) -> Neutral dark slate (#1E293B)
 * - Positives -> Higher return => progressively darker, richer green
 * - Negatives -> Greater loss => progressively darker, deeper red/maroon
 */
export function getHeatmapColor(val: number, tf: HeatmapTimeframe): string {
  if (Math.abs(val) < 0.05) {
    return '#1E293B'; // neutral slate for flat/zero returns
  }

  const maxVal = getMaxVal(tf);
  const ratio = Math.abs(val) / maxVal;

  if (val > 0) {
    return interpolateStops(GREEN_STOPS, ratio);
  } else {
    return interpolateStops(RED_STOPS, ratio);
  }
}

/** All text on heatmap tiles is crisp white with bold typography */
export function getTextColorForBg(_bgHex: string): string {
  return '#FFFFFF';
}

export interface LegendEntry {
  label: string;
  bg: string;
  textDark: boolean;
}

export function getLegendEntries(tf: HeatmapTimeframe): LegendEntry[] {
  const maxV = getMaxVal(tf);
  const step = maxV / 3;
  const v1 = Number(step.toFixed(1));
  const v2 = Number((step * 2).toFixed(1));
  const v3 = Number(maxV.toFixed(1));
  return [
    { label: `-${v3}%`, bg: getHeatmapColor(-v3, tf), textDark: false },
    { label: `-${v2}%`, bg: getHeatmapColor(-v2, tf), textDark: false },
    { label: `-${v1}%`, bg: getHeatmapColor(-v1, tf), textDark: false },
    { label: '0%',      bg: '#1E293B',                 textDark: false },
    { label: `+${v1}%`, bg: getHeatmapColor(v1, tf),  textDark: false },
    { label: `+${v2}%`, bg: getHeatmapColor(v2, tf),  textDark: false },
    { label: `+${v3}%`, bg: getHeatmapColor(v3, tf),  textDark: false },
  ];
}

/**
 * Determine if a return value falls within a clicked legend bracket.
 */
export function matchesReturnBracket(val: number, bracketLabel: string, tf: HeatmapTimeframe): boolean {
  const maxV = getMaxVal(tf);
  const step = maxV / 3;
  const halfStep = step / 2;
  const v1 = Number(step.toFixed(1));
  const v2 = Number((step * 2).toFixed(1));
  const v3 = Number(maxV.toFixed(1));

  if (bracketLabel === `+${v3}%`) {
    return val >= v2 + halfStep;
  }
  if (bracketLabel === `+${v2}%`) {
    return val >= v1 + halfStep && val < v2 + halfStep;
  }
  if (bracketLabel === `+${v1}%`) {
    return val >= halfStep && val < v1 + halfStep;
  }
  if (bracketLabel === '0%') {
    return Math.abs(val) < halfStep;
  }
  if (bracketLabel === `-${v1}%`) {
    return val <= -halfStep && val > -(v1 + halfStep);
  }
  if (bracketLabel === `-${v2}%`) {
    return val <= -(v1 + halfStep) && val > -(v2 + halfStep);
  }
  if (bracketLabel === `-${v3}%`) {
    return val <= -(v2 + halfStep);
  }
  return true;
}

