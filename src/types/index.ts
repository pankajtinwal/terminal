export interface StockConstituent {
  ticker: string;
  name: string;
  sector: string;
  exchange: string;
  weight_pct: number;
  latest_close: number;
  change_pct: number;
  returns: Record<string, number>;
}

export interface IndexMeta {
  id: string;
  name: string;
  type: 'master' | 'sector';
  file: string;
  constituents_count: number;
  current_value: number;
  change_pts: number;
  change_pct: number;
  day_open: number;
  day_high: number;
  day_low: number;
  prev_close: number;
  high_52w: number;
  low_52w: number;
  all_time_return_pct: number;
  constituents: StockConstituent[];
}

export interface SummaryData {
  updated_at: string;
  indices: IndexMeta[];
}

export interface HeatmapStock {
  ticker: string;
  name: string;
  sector: string;
  exchange: string;
  latest_close: number;
  weight_pct: number;
  returns: Record<string, number>;
}

export interface HeatmapSector {
  name: string;
  slug: string;
  index_id: string;
  constituents_count: number;
  returns: Record<string, number>;
  stocks: HeatmapStock[];
}

export interface HeatmapData {
  updated_at: string;
  total_stocks?: number;
  total_sectors?: number;
  sectors: HeatmapSector[];
}

export interface OHLCCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type ViewMode = 'chart' | 'heatmap' | 'quant';
export type WatchlistId = 'investment' | 'mtf';
export type ChartMode = 'candles' | 'line';
export type ChartTimeframe = '1m' | '3m' | '6m' | 'ytd' | 'all';
export type HeatmapTimeframe = '1d' | '1w' | '1m' | '3m' | '6m' | '1y';
export type HeatmapHierarchyMode = 'sector' | 'flat';
export type HeatmapSizingMode = 'equal' | 'magnitude';

export type QuantModelKey = 'ema' | 'momentum' | 'kinematic' | 'ou' | 'fractal';

export interface BaseQuantPoint {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  x: number;
  y: number;
}

export interface EMAPoint extends BaseQuantPoint {
  ema_20: number;
  ema_50: number;
  ema_200: number;
  is_bull: boolean;
  quadrant: 1 | 2 | 3 | 4;
  is_pullback_buy: boolean;
}

export interface MomentumPoint extends BaseQuantPoint {
  expected_y: number;
  residual: number;
  studentized_residual: number;
  is_outlier: boolean;
}

export interface KinematicPoint extends BaseQuantPoint {
  raw_v: number;
  raw_a: number;
  mahalanobis_dist: number;
  quadrant: 1 | 2 | 3 | 4;
  is_inflection: boolean;
}

export interface OUPoint extends BaseQuantPoint {
  half_life_days: number;
  spread_zscore: number;
  ar1_b: number;
  is_high_elasticity: boolean;
}

export interface FractalPoint extends BaseQuantPoint {
  hurst_exponent: number;
  dist_50_sma: number;
  regime: 'trending' | 'mean_reverting' | 'random_walk';
  is_anti_fade: boolean;
  is_persist_breakout: boolean;
}

export type AnyQuantPoint = EMAPoint | MomentumPoint | KinematicPoint | OUPoint | FractalPoint;

export interface OLSRegression {
  alpha: number;
  beta: number;
  r_squared: number;
  std_err: number;
  n: number;
  x_min: number;
  x_max: number;
  x_mean: number;
  ss_xx: number;
}

export interface QuantModelData<T extends BaseQuantPoint = BaseQuantPoint> {
  name: string;
  x_label: string;
  y_label: string;
  regression?: OLSRegression;
  stats: Record<string, number | boolean>;
  points: T[];
}

export interface QuantData {
  updated_at: string;
  total_stocks: number;
  models: {
    ema: QuantModelData<EMAPoint>;
    momentum: QuantModelData<MomentumPoint>;
    kinematic: QuantModelData<KinematicPoint>;
    ou: QuantModelData<OUPoint>;
    fractal: QuantModelData<FractalPoint>;
  };
}

export interface CrosshairData {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
  returnPct: string;
  isUp: boolean;
}
