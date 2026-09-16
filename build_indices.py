#!/usr/bin/env python3
"""
build_indices.py - Indian Stock Custom Index Engine & Ingestion Pipeline
Phase 1 Implementation:
- Delta-caching data ingestion using yfinance for 132 Indian stocks.
- Equal-Weighted Synthesized Index Engine (Base 1000 on Day 0).
- Master Index and Sector Sub-Indices (sectors with >= 4 stocks).
- Exports clean JSON files for TradingView Lightweight Charts v5.
"""

import os
import sys
import json
import time
import random
import re
import argparse
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
try:
    import yfinance as yf
except ImportError:
    yf = None

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(WORKSPACE_DIR, "data")
PUBLIC_DATA_DIR = os.path.join(WORKSPACE_DIR, "public", "data")
STOCKS_FILE = os.path.join(WORKSPACE_DIR, "Stocks List.json")
MTF_STOCKS_FILE = os.path.join(WORKSPACE_DIR, "MTF Stocks.json")
CACHE_FILE = os.path.join(DATA_DIR, "history.json")
MASTER_INDEX_FILE = os.path.join(DATA_DIR, "master_index.json")
SUMMARY_FILE = os.path.join(DATA_DIR, "indices_summary.json")
STOCKS_SUMMARY_FILE = os.path.join(DATA_DIR, "stocks_summary.json")
HEATMAP_FILE = os.path.join(DATA_DIR, "heatmap_data.json")
QUANT_MODELS_FILE = os.path.join(DATA_DIR, "quant_models.json")
MTF_HEATMAP_FILE = os.path.join(DATA_DIR, "mtf_heatmap_data.json")
MTF_QUANT_MODELS_FILE = os.path.join(DATA_DIR, "mtf_quant_models.json")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(PUBLIC_DATA_DIR, exist_ok=True)


def sync_data_to_public():
    """Sync all exported JSON data files from data/ to public/data/ for Vite frontend."""
    if os.path.exists(DATA_DIR):
        os.makedirs(PUBLIC_DATA_DIR, exist_ok=True)
        import shutil
        synced_count = 0
        for filename in os.listdir(DATA_DIR):
            if filename.endswith(".json") and filename != "history.json":
                src = os.path.join(DATA_DIR, filename)
                dst = os.path.join(PUBLIC_DATA_DIR, filename)
                shutil.copy2(src, dst)
                synced_count += 1
        print(f"[INFO] Synced {synced_count} JSON data files to {PUBLIC_DATA_DIR}")


def compute_multi_timeframe_returns(records: list) -> dict:
    """Compute 1D, 1W, 1M, 3M, 6M, 1Y percentage returns from records containing 'close'."""
    if not records or len(records) < 1:
        return {"1d": 0.0, "1w": 0.0, "1m": 0.0, "3m": 0.0, "6m": 0.0, "1y": 0.0}

    latest = records[-1]["close"]
    n = len(records)

    def calc_return(offset: int) -> float:
        if n <= 1:
            return 0.0
        idx = max(0, n - 1 - offset)
        base = records[idx]["close"]
        return round(((latest - base) / base) * 100, 2) if base > 0 else 0.0

    return {
        "1d": calc_return(1),
        "1w": calc_return(5),
        "1m": calc_return(21),
        "3m": calc_return(63),
        "6m": calc_return(126),
        "1y": round(((latest - records[0]["close"]) / records[0]["close"]) * 100, 2) if records[0]["close"] > 0 else 0.0
    }


def slugify(text: str) -> str:
    """Convert text into a URL-friendly filename slug."""
    text = text.lower().strip()
    text = re.sub(r'[\s&/_]+', '_', text)
    text = re.sub(r'[^\w-]', '', text)
    return text.strip('_')


# Symbol overrides for tickers whose Yahoo Finance symbol differs from raw ticker
SYMBOL_OVERRIDES = {
    "TRIL": "TARIL.NS",
    "INDEGENE": "INDGN.NS",
    "PRICOL": "PRICOLLTD.NS",
    "ARVINDSMART": "ARVSMART.NS",
    "EMS": "EMSLIMITED.NS",
    "KPGEL": "KPGEL.BO",
    "LTIM": "540005.BO",
}


def get_yf_ticker(stock: dict) -> str:
    """Format ticker symbol for Yahoo Finance (.NS for NSE, .BO for BSE, or custom override)."""
    raw_ticker = stock["ticker"].strip()
    if raw_ticker in SYMBOL_OVERRIDES:
        return SYMBOL_OVERRIDES[raw_ticker]
    exchange = stock.get("exchange", "NSE").upper()
    if exchange == "BSE":
        return f"{raw_ticker}.BO"
    return f"{raw_ticker}.NS"


def load_cache() -> dict:
    """Load local OHLC cache if available."""
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"[WARN] Failed to load cache file {CACHE_FILE}: {e}")
            return {}
    return {}


def save_cache(cache: dict):
    """Save OHLC cache locally."""
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2)
    print(f"[INFO] Cache saved to {CACHE_FILE} ({len(cache)} tickers)")


def ingest_data(stocks: list, force_refresh: bool = False, batch_size: int = 18) -> dict:
    """
    Delta-caching data ingestion with yfinance:
    - Zero-waste: queries only missing dates if cache exists.
    - Rate-limiting protection: batches of 15-20 tickers with 1.5-3s random sleep.
    """
    if yf is None:
        raise ImportError("yfinance is required for downloading fresh data. Please install it using `pip3 install yfinance`.")
    cache = {} if force_refresh else load_cache()
    today_str = datetime.today().strftime("%Y-%m-%d")
    
    # Identify what needs to be pulled
    tickers_to_query = {}  # yf_symbol -> {'stock': s, 'start_date': date_str or None}
    
    for s in stocks:
        yf_sym = get_yf_ticker(s)
        stock_cache = cache.get(yf_sym, [])
        
        if not stock_cache or len(stock_cache) < 20 or force_refresh:
            tickers_to_query[yf_sym] = {"stock": s, "start_date": None}
        else:
            latest_cached_date = stock_cache[-1]["date"]
            latest_dt = datetime.strptime(latest_cached_date, "%Y-%m-%d")
            delta_days = (datetime.today() - latest_dt).days
            # Always pull at least the last 7 calendar days to ensure:
            # 1. Midday prices (1:00 PM) get replaced with final 3:40 PM closing prices.
            # 2. Any recently missed trading days (e.g. yesterday) are reliably repaired.
            lookback = max(7, delta_days + 2)
            start_dt = datetime.today() - timedelta(days=lookback)
            tickers_to_query[yf_sym] = {"stock": s, "start_date": start_dt.strftime("%Y-%m-%d")}

    print(f"[INFO] Total stocks: {len(stocks)}. Tickers needing delta update: {len(tickers_to_query)}")
    
    if not tickers_to_query:
        print("[INFO] All ticker data is up to date in local cache.")
        return cache

    # Process in batches of 15-20 with randomized delay
    yf_keys = list(tickers_to_query.keys())
    total_batches = (len(yf_keys) + batch_size - 1) // batch_size

    for batch_idx in range(total_batches):
        batch_keys = yf_keys[batch_idx * batch_size : (batch_idx + 1) * batch_size]
        print(f"\n[INFO] Ingesting batch {batch_idx + 1}/{total_batches} ({len(batch_keys)} tickers)...")
        
        # Check if any ticker in batch needs full 1y vs delta
        needs_full = any(tickers_to_query[k]["start_date"] is None for k in batch_keys)
        
        try:
            if needs_full:
                df = yf.download(
                    batch_keys,
                    period="1y",
                    interval="1d",
                    group_by="ticker",
                    auto_adjust=True,
                    progress=False,
                    timeout=30
                )
            else:
                # Find earliest missing start_date in this batch
                starts = [tickers_to_query[k]["start_date"] for k in batch_keys if tickers_to_query[k]["start_date"]]
                earliest_start = min(starts) if starts else (datetime.today() - timedelta(days=7)).strftime("%Y-%m-%d")
                df = yf.download(
                    batch_keys,
                    start=earliest_start,
                    interval="1d",
                    group_by="ticker",
                    auto_adjust=True,
                    progress=False,
                    timeout=30
                )

            # Parse df into cache records
            for sym in batch_keys:
                try:
                    if isinstance(df.columns, pd.MultiIndex):
                        if sym in df.columns.levels[0]:
                            sym_df = df[sym].copy()
                        elif sym in df.columns.levels[1]:
                            sym_df = df.xs(sym, axis=1, level=1).copy()
                        else:
                            print(f"[WARN] No data column for {sym}")
                            continue
                    else:
                        sym_df = df.copy()

                    if "Close" not in sym_df.columns:
                        print(f"[WARN] 'Close' column missing for {sym}")
                        continue

                    sym_df = sym_df.dropna(subset=["Close"])
                    if sym_df.empty:
                        print(f"[WARN] Empty dataframe returned for {sym}")
                        continue

                    new_records = []
                    for idx, row in sym_df.iterrows():
                        date_str = idx.strftime("%Y-%m-%d") if hasattr(idx, 'strftime') else str(idx)[:10]
                        o = float(row.get("Open", row["Close"]))
                        h = float(row.get("High", row["Close"]))
                        l = float(row.get("Low", row["Close"]))
                        c = float(row["Close"])
                        v = int(row.get("Volume", 0)) if not pd.isna(row.get("Volume", 0)) else 0
                        
                        if pd.isna(o) or pd.isna(h) or pd.isna(l) or pd.isna(c) or c <= 0:
                            continue
                        
                        new_records.append({
                            "date": date_str,
                            "open": round(o, 2),
                            "high": round(h, 2),
                            "low": round(l, 2),
                            "close": round(c, 2),
                            "volume": v
                        })

                    # Merge into existing cache
                    existing = {r["date"]: r for r in cache.get(sym, [])}
                    for r in new_records:
                        existing[r["date"]] = r
                    
                    sorted_records = sorted(existing.values(), key=lambda x: x["date"])
                    cache[sym] = sorted_records
                    print(f"  ✓ {sym}: {len(sorted_records)} total days (updated {len(new_records)} records)")

                except Exception as ex:
                    print(f"  ✗ Error processing {sym}: {ex}")

        except Exception as batch_ex:
            print(f"[ERROR] Batch download failed: {batch_ex}")

        # Sleep between 1.5 and 3.0 seconds as required by blueprint
        if batch_idx < total_batches - 1:
            sleep_duration = round(random.uniform(1.5, 3.0), 2)
            print(f"[INFO] Anti-ban rate limit delay: sleeping {sleep_duration}s...")
            time.sleep(sleep_duration)

    save_cache(cache)
    return cache


def compute_equal_weighted_index(target_stocks: list, cache: dict, index_name: str) -> list:
    """
    Mathematical Engine:
    Base Value of 1000 on Day 0 (t0).
    For trading day t where n is the number of active stocks:
      R_t = (1/n) * sum( (Close_{i,t} - Close_{i,t-1}) / Close_{i,t-1} )
      Index_Close_t = Index_Close_{t-1} * (1 + R_t)
      Index_Open_t  = Index_Close_{t-1} * [ 1 + (1/n) * sum( (Open_{i,t} - Close_{i,t-1}) / Close_{i,t-1} ) ]
      Index_High_t  = Index_Close_{t-1} * [ 1 + (1/n) * sum( (High_{i,t} - Close_{i,t-1}) / Close_{i,t-1} ) ]
      Index_Low_t   = Index_Close_{t-1} * [ 1 + (1/n) * sum( (Low_{i,t}  - Close_{i,t-1}) / Close_{i,t-1} ) ]
      
    Geometry check:
      Index_High_t = max(Index_High_t, Index_Open_t, Index_Close_t)
      Index_Low_t  = min(Index_Low_t, Index_Open_t, Index_Close_t)
    """
    # Build a lookup: yf_sym -> {date: record}
    stock_lookups = {}
    valid_syms = []
    
    for s in target_stocks:
        sym = get_yf_ticker(s)
        records = cache.get(sym, [])
        if records:
            stock_lookups[sym] = {r["date"]: r for r in records}
            valid_syms.append(sym)
    
    if not valid_syms:
        print(f"[WARN] No cached price data found for index '{index_name}'")
        return []

    # Gather all unique trading dates sorted
    all_dates = set()
    for sym in valid_syms:
        all_dates.update(stock_lookups[sym].keys())
    trading_dates = sorted(list(all_dates))

    if len(trading_dates) < 2:
        print(f"[WARN] Insufficient trading dates ({len(trading_dates)}) for index '{index_name}'")
        return []

    # Initialize Day 0 (t0) at Base 1000.0
    candles = []
    t0_date = trading_dates[0]
    
    candles.append({
        "time": t0_date,
        "open": 1000.0,
        "high": 1000.0,
        "low": 1000.0,
        "close": 1000.0,
        "active_constituents": len(valid_syms)
    })

    prev_close = 1000.0

    for t_idx in range(1, len(trading_dates)):
        curr_date = trading_dates[t_idx]
        prev_date = trading_dates[t_idx - 1]

        close_returns = []
        open_returns = []
        high_returns = []
        low_returns = []

        for sym in valid_syms:
            lookup = stock_lookups[sym]
            if curr_date in lookup and prev_date in lookup:
                c_prev = lookup[prev_date]["close"]
                if c_prev > 0:
                    c_curr = lookup[curr_date]["close"]
                    o_curr = lookup[curr_date]["open"]
                    h_curr = lookup[curr_date]["high"]
                    l_curr = lookup[curr_date]["low"]

                    close_returns.append((c_curr - c_prev) / c_prev)
                    open_returns.append((o_curr - c_prev) / c_prev)
                    high_returns.append((h_curr - c_prev) / c_prev)
                    low_returns.append((l_curr - c_prev) / c_prev)

        n = len(close_returns)
        if n == 0:
            # Carry forward previous close if market was halted or no stocks traded
            candles.append({
                "time": curr_date,
                "open": round(prev_close, 2),
                "high": round(prev_close, 2),
                "low": round(prev_close, 2),
                "close": round(prev_close, 2),
                "active_constituents": 0
            })
            continue

        r_t = sum(close_returns) / n
        r_open = sum(open_returns) / n
        r_high = sum(high_returns) / n
        r_low = sum(low_returns) / n

        curr_close = prev_close * (1.0 + r_t)
        curr_open = prev_close * (1.0 + r_open)
        curr_high = prev_close * (1.0 + r_high)
        curr_low = prev_close * (1.0 + r_low)

        # Candlestick geometry integrity checks
        curr_high = max(curr_high, curr_open, curr_close)
        curr_low = min(curr_low, curr_open, curr_close)

        candles.append({
            "time": curr_date,
            "open": round(curr_open, 2),
            "high": round(curr_high, 2),
            "low": round(curr_low, 2),
            "close": round(curr_close, 2),
            "active_constituents": n
        })

        prev_close = curr_close

    return candles


def compute_quant_models(stocks: list, cache: dict, master_candles: list) -> dict:
    """
    Computes 5 Institutional Quantitative Scatter Models across universe of 132 stocks:
    1. EMA Mean Reversion Risk (50 EMA % dist vs 20 EMA % dist, 200 EMA bull/bear)
    2. Cross-Sectional Residual Momentum (60d log ret vs 5d log ret, OLS line & +/- 2.0 studentized residual bands)
    3. Kinematic Phase-Space (Standardized smoothed 5d velocity vs acceleration, Q2 Mahalanobis distance > 2.45)
    4. Ornstein-Uhlenbeck Mean Reversion (Spread relative to Master Index, AR(1) half-life on log scale, High Elasticity setups)
    5. Fractal Regime (120-day Hurst Exponent via R/S analysis vs 50 SMA % dist, H=0.5 divider, Anti-persistent fades & Persistent breakouts)
    """
    import numpy as np

    def get_stock_history(s):
        sym = get_yf_ticker(s)
        records = cache.get(sym, [])
        if not records:
            raw = s["ticker"]
            for k in cache:
                if k.startswith(raw):
                    records = cache[k]
                    break
        return _filter_corporate_actions(records)

    def _filter_corporate_actions(records):
        """Detect unadjusted stock splits/bonuses (>50% single-day price moves)
        and truncate history to only use post-event data."""
        if len(records) < 2:
            return records
        last_split_idx = -1
        for i in range(len(records) - 1):
            if records[i]["close"] > 0:
                day_ret = (records[i + 1]["close"] - records[i]["close"]) / records[i]["close"]
                if day_ret < -0.50 or day_ret > 1.0:
                    last_split_idx = i + 1
        if last_split_idx > 0:
            return records[last_split_idx:]
        return records

    master_date_map = {c["time"]: c["close"] for c in master_candles}

    # =========================================================================
    # MODEL 1: EMA Mean Reversion Risk
    # =========================================================================
    ema_points = []
    bull_count = 0
    bear_count = 0

    for s in stocks:
        rec = get_stock_history(s)
        if not rec or len(rec) < 30:
            continue
        closes = pd.Series([r["close"] for r in rec], dtype=float)
        price = float(closes.iloc[-1])
        if price <= 0:
            continue

        ema20 = float(closes.ewm(span=20, adjust=False).mean().iloc[-1])
        ema50 = float(closes.ewm(span=50, adjust=False).mean().iloc[-1])

        # Require at least 200 data points for a reliable 200 EMA bull/bear classification
        if len(closes) >= 200:
            ema200 = float(closes.ewm(span=200, adjust=False).mean().iloc[-1])
            is_bull = bool(price > ema200)
        else:
            ema200 = float(closes.ewm(span=len(closes), adjust=False).mean().iloc[-1])
            is_bull = bool(price > ema200)  # lower confidence with short data

        dist_50 = round(((price - ema50) / ema50) * 100.0, 2)
        dist_20 = round(((price - ema20) / ema20) * 100.0, 2)

        if is_bull:
            bull_count += 1
        else:
            bear_count += 1

        if dist_50 >= 0 and dist_20 >= 0:
            quadrant = 1
        elif dist_50 < 0 and dist_20 >= 0:
            quadrant = 2
        elif dist_50 < 0 and dist_20 < 0:
            quadrant = 3
        else:
            quadrant = 4

        is_pullback_buy = bool(quadrant == 4 and is_bull)

        ema_points.append({
            "ticker": s["ticker"],
            "name": s["name"],
            "sector": s.get("sector", "Other"),
            "price": round(price, 2),
            "x": dist_50,
            "y": dist_20,
            "ema_20": round(ema20, 2),
            "ema_50": round(ema50, 2),
            "ema_200": round(ema200, 2),
            "is_bull": is_bull,
            "quadrant": quadrant,
            "is_pullback_buy": is_pullback_buy
        })

    # =========================================================================
    # MODEL 2: Cross-Sectional Residual Momentum
    # =========================================================================
    raw_m2 = []
    for s in stocks:
        rec = get_stock_history(s)
        if not rec or len(rec) < 65:
            continue
        c_series = [r["close"] for r in rec]
        if c_series[-1] <= 0 or c_series[-6] <= 0 or c_series[-61] <= 0:
            continue
        ret_60d = float(np.log(c_series[-1] / c_series[-61]))
        ret_5d = float(np.log(c_series[-1] / c_series[-6]))
        raw_m2.append((s, ret_60d, ret_5d, c_series[-1]))

    m2_points = []
    m2_regression = {"alpha": 0.0, "beta": 0.0, "r_squared": 0.0, "std_err": 0.0}

    if len(raw_m2) >= 10:
        X2 = np.array([item[1] for item in raw_m2])
        Y2 = np.array([item[2] for item in raw_m2])
        N2 = len(X2)
        X2_mean = float(np.mean(X2))
        Y2_mean = float(np.mean(Y2))
        ss_xx = float(np.sum((X2 - X2_mean)**2))
        ss_yy = float(np.sum((Y2 - Y2_mean)**2))
        ss_xy = float(np.sum((X2 - X2_mean) * (Y2 - Y2_mean)))

        beta2 = ss_xy / ss_xx if ss_xx > 0 else 0.0
        alpha2 = Y2_mean - beta2 * X2_mean
        y2_pred = alpha2 + beta2 * X2
        residuals2 = Y2 - y2_pred
        ss_res = float(np.sum(residuals2**2))

        s_err2 = np.sqrt(ss_res / (N2 - 2)) if N2 > 2 else 0.01
        r_squared2 = 1.0 - (ss_res / ss_yy) if ss_yy > 0 else 0.0
        r_squared2 = max(0.0, min(1.0, r_squared2))

        h2 = (1.0 / N2) + ((X2 - X2_mean)**2) / ss_xx if ss_xx > 0 else np.full(N2, 1.0 / N2)
        denom = s_err2 * np.sqrt(np.maximum(1e-8, 1.0 - h2))
        stud_residuals2 = residuals2 / denom

        m2_regression = {
            "alpha": round(float(alpha2), 4),
            "beta": round(float(beta2), 4),
            "r_squared": round(float(r_squared2), 4),
            "std_err": round(float(s_err2), 4),
            "n": N2,
            "x_min": round(float(np.min(X2)), 4),
            "x_max": round(float(np.max(X2)), 4),
            "x_mean": round(float(X2_mean), 4),
            "ss_xx": round(float(ss_xx), 6)
        }

        for i in range(N2):
            s_obj, r60, r5, p_last = raw_m2[i]
            r_stud = float(stud_residuals2[i])
            is_outlier = bool(abs(r_stud) > 2.0)
            m2_points.append({
                "ticker": s_obj["ticker"],
                "name": s_obj["name"],
                "sector": s_obj.get("sector", "Other"),
                "price": round(p_last, 2),
                "x": round(float(r60) * 100.0, 2), # % 60d log return
                "y": round(float(r5) * 100.0, 2),  # % 5d log return
                "expected_y": round(float(y2_pred[i]) * 100.0, 2),
                "residual": round(float(residuals2[i]) * 100.0, 2),
                "studentized_residual": round(r_stud, 2),
                "is_outlier": is_outlier
            })

    # =========================================================================
    # MODEL 3: Kinematic Phase-Space (Velocity vs. Acceleration)
    # =========================================================================
    raw_m3 = []
    for s in stocks:
        rec = get_stock_history(s)
        if not rec or len(rec) < 20:
            continue
        closes = [r["close"] for r in rec]
        if any(c <= 0 for c in closes[-10:]):
            continue
        c_arr = np.array(closes)
        v_raw = (c_arr[5:] - c_arr[:-5]) / c_arr[:-5]
        v_smooth = pd.Series(v_raw).ewm(span=3, adjust=False).mean().values
        if len(v_smooth) < 2:
            continue
        v_latest = float(v_smooth[-1])
        a_latest = float(v_smooth[-1] - v_smooth[-2])
        raw_m3.append((s, v_latest, a_latest, closes[-1]))

    m3_points = []
    m3_stats = {"mean_v": 0.0, "std_v": 1.0, "mean_a": 0.0, "std_a": 1.0, "rho": 0.0}

    if len(raw_m3) >= 10:
        V_arr = np.array([item[1] for item in raw_m3])
        A_arr = np.array([item[2] for item in raw_m3])
        N3 = len(raw_m3)
        mean_v = float(np.mean(V_arr))
        std_v = float(np.std(V_arr, ddof=1)) or 0.01
        mean_a = float(np.mean(A_arr))
        std_a = float(np.std(A_arr, ddof=1)) or 0.01

        z_v = (V_arr - mean_v) / std_v
        z_a = (A_arr - mean_a) / std_a

        rho_val = float(np.corrcoef(z_v, z_a)[0, 1])
        rho_val = max(-0.95, min(0.95, rho_val))

        denom3 = 1.0 - (rho_val ** 2)
        dm_sq = (z_v ** 2 - 2.0 * rho_val * z_v * z_a + z_a ** 2) / denom3
        dm_vals = np.sqrt(np.maximum(0.0, dm_sq))

        m3_stats = {
            "mean_v": round(mean_v * 100.0, 2),
            "std_v": round(std_v * 100.0, 2),
            "mean_a": round(mean_a * 100.0, 2),
            "std_a": round(std_a * 100.0, 2),
            "rho": round(rho_val, 4)
        }

        for i in range(N3):
            s_obj, v_val, a_val, p_last = raw_m3[i]
            zv_i = float(z_v[i])
            za_i = float(z_a[i])
            dm_i = float(dm_vals[i])

            if zv_i >= 0 and za_i >= 0:
                quad = 1
            elif zv_i < 0 and za_i >= 0:
                quad = 2
            elif zv_i < 0 and za_i < 0:
                quad = 3
            else:
                quad = 4

            is_inflection = bool(quad == 2 and dm_i > 2.0)

            m3_points.append({
                "ticker": s_obj["ticker"],
                "name": s_obj["name"],
                "sector": s_obj.get("sector", "Other"),
                "price": round(p_last, 2),
                "x": round(zv_i, 2),
                "y": round(za_i, 2),
                "raw_v": round(v_val * 100.0, 2),
                "raw_a": round(a_val * 100.0, 2),
                "mahalanobis_dist": round(dm_i, 2),
                "quadrant": quad,
                "is_inflection": is_inflection
            })

    # =========================================================================
    # MODEL 4: Ornstein-Uhlenbeck (OU) Mean Reversion
    # =========================================================================
    m4_points = []

    for s in stocks:
        rec = get_stock_history(s)
        if not rec or len(rec) < 50:
            continue
        aligned_s = []
        for r in rec[-120:]:
            d_str = r["date"]
            if d_str in master_date_map and r["close"] > 0 and master_date_map[d_str] > 0:
                aligned_s.append(np.log(r["close"] / master_date_map[d_str]))

        if len(aligned_s) < 40:
            continue

        S = np.array(aligned_s)
        y_ar = S[1:]
        x_ar = S[:-1]
        x_mean = np.mean(x_ar)
        y_mean = np.mean(y_ar)
        denom_ar = np.sum((x_ar - x_mean)**2)

        if denom_ar <= 1e-10:
            continue

        b = np.sum((x_ar - x_mean) * (y_ar - y_mean)) / denom_ar

        if 0 < b < 1:
            theta = -np.log(b)
            half_life = np.log(2.0) / theta
        else:
            half_life = 250.0

        half_life = min(250.0, max(0.5, float(half_life)))

        std_s = float(np.std(S, ddof=1)) or 0.01
        z_spread = float((S[-1] - np.mean(S)) / std_s)

        is_high_elasticity = bool(half_life < 10.0 and z_spread < -2.0)

        m4_points.append({
            "ticker": s["ticker"],
            "name": s["name"],
            "sector": s.get("sector", "Other"),
            "price": round(rec[-1]["close"], 2),
            "x": round(half_life, 1),
            "y": round(z_spread, 2),
            "half_life_days": round(half_life, 1),
            "spread_zscore": round(z_spread, 2),
            "ar1_b": round(float(b), 4),
            "is_high_elasticity": is_high_elasticity
        })

    # =========================================================================
    # MODEL 5: Fractal Regime (Hurst Exponent)
    # =========================================================================
    def compute_hurst(prices):
        if len(prices) < 120:
            return 0.5
        ts = np.log(prices[-120:] / np.roll(prices[-120:], 1))[1:]
        N = len(ts)
        lags = [10, 15, 20, 25, 30, 40]
        rs_vals = []
        for lag in lags:
            n_chunks = N // lag
            chunk_rs = []
            for i in range(n_chunks):
                chunk = ts[i * lag : (i + 1) * lag]
                m = np.mean(chunk)
                y = np.cumsum(chunk - m)
                r = np.max(y) - np.min(y)
                s = np.std(chunk, ddof=1)
                if s > 1e-8:
                    chunk_rs.append(r / s)
            if chunk_rs:
                rs_vals.append(np.mean(chunk_rs))
            else:
                rs_vals.append(1.0)
        x_h = np.log(lags)
        y_h = np.log(rs_vals)
        slope = np.polyfit(x_h, y_h, 1)[0]
        return float(np.clip(slope, 0.05, 0.95))

    m5_points = []
    for s in stocks:
        rec = get_stock_history(s)
        if not rec or len(rec) < 120:
            continue
        c_arr = np.array([r["close"] for r in rec], dtype=float)
        if any(c <= 0 for c in c_arr[-120:]):
            continue

        H_val = compute_hurst(c_arr)
        sma50 = float(np.mean(c_arr[-50:]))
        if sma50 <= 0:
            continue
        dist50_sma = round(((c_arr[-1] - sma50) / sma50) * 100.0, 2)

        is_anti_fade = bool(H_val < 0.40 and abs(dist50_sma) > 5.0)
        is_persist_breakout = bool(H_val > 0.60 and dist50_sma > 3.0)

        regime = "trending" if H_val > 0.55 else ("mean_reverting" if H_val < 0.45 else "random_walk")

        m5_points.append({
            "ticker": s["ticker"],
            "name": s["name"],
            "sector": s.get("sector", "Other"),
            "price": round(c_arr[-1], 2),
            "x": round(H_val, 3),
            "y": dist50_sma,
            "hurst_exponent": round(H_val, 3),
            "dist_50_sma": dist50_sma,
            "regime": regime,
            "is_anti_fade": is_anti_fade,
            "is_persist_breakout": is_persist_breakout
        })

    return {
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "total_stocks": len(stocks),
        "models": {
            "ema": {
                "name": "EMA Mean Reversion Risk",
                "x_label": "% Distance from 50 EMA",
                "y_label": "% Distance from 20 EMA",
                "stats": {
                    "bull_count": bull_count,
                    "bear_count": bear_count,
                    "pullback_buy_count": sum(1 for p in ema_points if p["is_pullback_buy"])
                },
                "points": sorted(ema_points, key=lambda p: -p["x"])
            },
            "momentum": {
                "name": "Cross-Sectional Residual Momentum",
                "x_label": "60-Day Log Return (%)",
                "y_label": "5-Day Log Return (%)",
                "regression": m2_regression,
                "stats": {
                    "outlier_count": sum(1 for p in m2_points if p["is_outlier"])
                },
                "points": sorted(m2_points, key=lambda p: -p["studentized_residual"])
            },
            "kinematic": {
                "name": "Kinematic Phase-Space",
                "x_label": "Standardized Velocity (Z-Score)",
                "y_label": "Standardized Acceleration (Z-Score)",
                "stats": {
                    **m3_stats,
                    "q2_inflection_count": sum(1 for p in m3_points if p["is_inflection"])
                },
                "points": sorted(m3_points, key=lambda p: -p["mahalanobis_dist"])
            },
            "ou": {
                "name": "Ornstein-Uhlenbeck Mean Reversion",
                "x_label": "Mean Reversion Half-Life (Days - Log Scale)",
                "y_label": "Spread Dislocation (Z-Score vs Master Index)",
                "stats": {
                    "high_elasticity_count": sum(1 for p in m4_points if p["is_high_elasticity"]),
                    "median_half_life": round(float(np.median([p["half_life_days"] for p in m4_points])) if m4_points else 0, 1)
                },
                "points": sorted(m4_points, key=lambda p: p["spread_zscore"])
            },
            "fractal": {
                "name": "Fractal Regime (Hurst Exponent)",
                "x_label": "Hurst Exponent (120-Day R/S)",
                "y_label": "% Distance from 50 SMA",
                "stats": {
                    "anti_fade_count": sum(1 for p in m5_points if p["is_anti_fade"]),
                    "persist_breakout_count": sum(1 for p in m5_points if p["is_persist_breakout"]),
                    "mean_hurst": round(float(np.mean([p["hurst_exponent"] for p in m5_points])) if m5_points else 0.5, 3)
                },
                "points": sorted(m5_points, key=lambda p: -p["hurst_exponent"])
            }
        }
    }


def process_mtf_watchlist(cache: dict, force_refresh: bool = False, batch_size: int = 18) -> dict:
    """Ingest MTF Stocks, compute MTF Heatmap and 5 Quantitative Models."""
    if not os.path.exists(MTF_STOCKS_FILE):
        print(f"[ERROR] MTF Stocks file not found at {MTF_STOCKS_FILE}")
        return cache

    with open(MTF_STOCKS_FILE, "r") as f:
        mtf_stocks = json.load(f)
    print(f"\n[INFO] Loaded {len(mtf_stocks)} MTF stocks from {MTF_STOCKS_FILE}")

    # Ingest / Delta-update price data into shared cache
    cache = ingest_data(mtf_stocks, force_refresh=force_refresh, batch_size=batch_size)

    # Compute equal-weighted benchmark candles for MTF (used for M4 OU spread dislocation)
    print("\n[INFO] Computing MTF Composite Reference Baseline...")
    mtf_ref_candles = compute_equal_weighted_index(mtf_stocks, cache, "MTF Composite")

    # Group MTF Stocks by Sector for Heatmap (include all sectors and stocks)
    print("\n[INFO] Building MTF Sector Heatmap Hierarchy...")
    sectors = {}
    for s in mtf_stocks:
        sec = s.get("sector", "Other")
        sectors.setdefault(sec, []).append(s)

    heatmap_sectors = []
    for sec_name, sec_stocks in sorted(sectors.items(), key=lambda x: x[0]):
        stock_count = len(sec_stocks)
        slug = slugify(sec_name)

        sec_constituents = []
        for s in sec_stocks:
            sym = get_yf_ticker(s)
            c_hist = cache.get(sym, [])
            l_close = c_hist[-1]["close"] if c_hist else 0.0
            p_close = c_hist[-2]["close"] if len(c_hist) > 1 else l_close
            st_chg = round(((l_close - p_close) / p_close) * 100, 2) if p_close > 0 else 0.0
            sec_constituents.append({
                "ticker": s["ticker"],
                "name": s["name"],
                "exchange": s.get("exchange", "NSE"),
                "sector": sec_name,
                "latest_close": l_close,
                "change_pct": st_chg,
                "weight_pct": round(100.0 / stock_count, 2),
                "returns": compute_multi_timeframe_returns(c_hist)
            })

        # Calculate average returns for sector from constituent returns
        sec_returns = {}
        for tf in ["1d", "1w", "1m", "3m", "6m", "1y"]:
            valid_rets = [sc["returns"][tf] for sc in sec_constituents if tf in sc["returns"]]
            sec_returns[tf] = round(float(np.mean(valid_rets)), 2) if valid_rets else 0.0

        heatmap_sectors.append({
            "name": sec_name,
            "slug": slug,
            "index_id": f"mtf_sector_{slug}",
            "constituents_count": stock_count,
            "returns": sec_returns,
            "stocks": sorted(sec_constituents, key=lambda x: -x["weight_pct"])
        })

    mtf_heatmap_payload = {
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "timeframes": ["1D", "1W", "1M", "3M", "6M", "1Y"],
        "total_stocks": len(mtf_stocks),
        "total_sectors": len(heatmap_sectors),
        "sectors": sorted(heatmap_sectors, key=lambda x: -x["constituents_count"])
    }

    with open(MTF_HEATMAP_FILE, "w") as f:
        json.dump(mtf_heatmap_payload, f, indent=2)
    print(f"[INFO] Successfully generated MTF Heatmap and saved to {MTF_HEATMAP_FILE}")

    # Compute 5 Quantitative Scatter Models for MTF Universe
    print("\n[INFO] Computing 5 Quantitative Models for MTF Universe...")
    mtf_quant_payload = compute_quant_models(mtf_stocks, cache, mtf_ref_candles)
    with open(MTF_QUANT_MODELS_FILE, "w") as f:
        json.dump(mtf_quant_payload, f, indent=2)
    print(f"[INFO] Successfully saved MTF Quantitative Models to {MTF_QUANT_MODELS_FILE}")

    return cache


def main():
    parser = argparse.ArgumentParser(description="Indian Stock Custom Index Engine")
    parser.add_argument("--force-refresh", action="store_true", help="Force complete re-ingestion")
    parser.add_argument("--skip-ingest", action="store_true", help="Skip yfinance download and compute from cache")
    parser.add_argument("--batch-size", type=int, default=18, help="Batch size for yfinance ingestion")
    parser.add_argument("--watchlist", choices=["all", "investment", "mtf"], default="all",
                        help="Select which watchlist to process (all, investment, or mtf)")
    args = parser.parse_args()

    # Load shared cache
    cache = load_cache() if args.skip_ingest else None

    # Process Alpha 132 Investment Watchlist
    if args.watchlist in ("all", "investment"):
        with open(STOCKS_FILE, "r") as f:
            stocks = json.load(f)
        print(f"[INFO] Loaded {len(stocks)} stocks from {STOCKS_FILE}")

        if args.skip_ingest:
            print("[INFO] Skipping ingestion as requested. Loading existing cache...")
            if cache is None:
                cache = load_cache()
        else:
            cache = ingest_data(stocks, force_refresh=args.force_refresh, batch_size=args.batch_size)

        print("\n[INFO] Computing Master Equal-Weighted Index (Base 1000)...")
        master_candles = compute_equal_weighted_index(stocks, cache, "Master Index")
        
        tv_master_candles = [{k: c[k] for k in ("time", "open", "high", "low", "close")} for c in master_candles]
        with open(MASTER_INDEX_FILE, "w") as f:
            json.dump(tv_master_candles, f, indent=2)
        print(f"[INFO] Saved Master Index to {MASTER_INDEX_FILE} ({len(tv_master_candles)} trading days)")

        sectors = {}
        for s in stocks:
            sec = s.get("sector", "Other")
            sectors.setdefault(sec, []).append(s)

        indices_summary = []
        if master_candles:
            latest = master_candles[-1]
            prev = master_candles[-2] if len(master_candles) > 1 else latest
            change_pts = round(latest["close"] - prev["close"], 2)
            change_pct = round((change_pts / prev["close"]) * 100, 2) if prev["close"] > 0 else 0.0
            highs = [c["high"] for c in master_candles]
            lows = [c["low"] for c in master_candles]

            master_constituents = []
            for s in stocks:
                sym = get_yf_ticker(s)
                c_hist = cache.get(sym, [])
                l_close = c_hist[-1]["close"] if c_hist else 0.0
                p_close = c_hist[-2]["close"] if len(c_hist) > 1 else l_close
                st_chg = round(((l_close - p_close) / p_close) * 100, 2) if p_close > 0 else 0.0
                master_constituents.append({
                    "ticker": s["ticker"],
                    "name": s["name"],
                    "exchange": s.get("exchange", "NSE"),
                    "sector": s.get("sector", "Other"),
                    "latest_close": l_close,
                    "change_pct": st_chg,
                    "weight_pct": round(100.0 / len(stocks), 2),
                    "returns": compute_multi_timeframe_returns(c_hist)
                })

            indices_summary.append({
                "id": "master_index",
                "name": "Master Composite Index",
                "type": "master",
                "file": "data/master_index.json",
                "current_value": latest["close"],
                "prev_close": prev["close"],
                "change_pts": change_pts,
                "change_pct": change_pct,
                "day_open": latest["open"],
                "day_high": latest["high"],
                "day_low": latest["low"],
                "high_52w": max(highs),
                "low_52w": min(lows),
                "all_time_return_pct": round(((latest["close"] - 1000.0) / 1000.0) * 100, 2),
                "returns": compute_multi_timeframe_returns(master_candles),
                "constituents_count": len(stocks),
                "constituents": sorted(master_constituents, key=lambda x: -x["change_pct"])
            })

        print("\n[INFO] Evaluating Sector Sub-Indices & Heatmap Hierarchy...")
        heatmap_sectors = []
        for sec_name, sec_stocks in sorted(sectors.items(), key=lambda x: x[0]):
            stock_count = len(sec_stocks)
            if stock_count < 4:
                print(f"[SKIP] Sector '{sec_name}' has only {stock_count} stocks (< 4 threshold). No index generated.")
                continue

            slug = slugify(sec_name)
            sec_filename = f"sector_{slug}.json"
            sec_file_path = os.path.join(DATA_DIR, sec_filename)

            print(f"[INFO] Computing Sub-Index for '{sec_name}' ({stock_count} stocks)...")
            sec_candles = compute_equal_weighted_index(sec_stocks, cache, sec_name)
            tv_sec_candles = [{k: c[k] for k in ("time", "open", "high", "low", "close")} for c in sec_candles]
            with open(sec_file_path, "w") as f:
                json.dump(tv_sec_candles, f, indent=2)

            if sec_candles:
                latest = sec_candles[-1]
                prev = sec_candles[-2] if len(sec_candles) > 1 else latest
                change_pts = round(latest["close"] - prev["close"], 2)
                change_pct = round((change_pts / prev["close"]) * 100, 2) if prev["close"] > 0 else 0.0
                highs = [c["high"] for c in sec_candles]
                lows = [c["low"] for c in sec_candles]
                sec_returns = compute_multi_timeframe_returns(sec_candles)

                sec_constituents = []
                for s in sec_stocks:
                    sym = get_yf_ticker(s)
                    c_hist = cache.get(sym, [])
                    l_close = c_hist[-1]["close"] if c_hist else 0.0
                    p_close = c_hist[-2]["close"] if len(c_hist) > 1 else l_close
                    st_chg = round(((l_close - p_close) / p_close) * 100, 2) if p_close > 0 else 0.0
                    sec_constituents.append({
                        "ticker": s["ticker"],
                        "name": s["name"],
                        "exchange": s.get("exchange", "NSE"),
                        "sector": sec_name,
                        "latest_close": l_close,
                        "change_pct": st_chg,
                        "weight_pct": round(100.0 / stock_count, 2),
                        "returns": compute_multi_timeframe_returns(c_hist)
                    })

                indices_summary.append({
                    "id": f"sector_{slug}",
                    "name": sec_name,
                    "type": "sector",
                    "file": f"data/{sec_filename}",
                    "current_value": latest["close"],
                    "prev_close": prev["close"],
                    "change_pts": change_pts,
                    "change_pct": change_pct,
                    "day_open": latest["open"],
                    "day_high": latest["high"],
                    "day_low": latest["low"],
                    "high_52w": max(highs),
                    "low_52w": min(lows),
                    "all_time_return_pct": round(((latest["close"] - 1000.0) / 1000.0) * 100, 2),
                    "returns": sec_returns,
                    "constituents_count": stock_count,
                    "constituents": sorted(sec_constituents, key=lambda x: -x["change_pct"])
                })

                heatmap_sectors.append({
                    "name": sec_name,
                    "slug": slug,
                    "index_id": f"sector_{slug}",
                    "constituents_count": stock_count,
                    "returns": sec_returns,
                    "stocks": sorted(sec_constituents, key=lambda x: -x["weight_pct"])
                })

        meta = {
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "total_stocks": len(stocks),
            "total_indices": len(indices_summary),
            "indices": indices_summary
        }
        with open(SUMMARY_FILE, "w") as f:
            json.dump(meta, f, indent=2)
        print(f"\n[INFO] Successfully generated {len(indices_summary)} indices and saved summary to {SUMMARY_FILE}")

        heatmap_payload = {
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "timeframes": ["1D", "1W", "1M", "3M", "6M", "1Y"],
            "total_stocks": len(stocks),
            "total_sectors": len(heatmap_sectors),
            "sectors": sorted(heatmap_sectors, key=lambda x: -x["constituents_count"])
        }
        with open(HEATMAP_FILE, "w") as f:
            json.dump(heatmap_payload, f, indent=2)
        print(f"[INFO] Successfully generated Heatmap dataset and saved to {HEATMAP_FILE}")

        print("\n[INFO] Computing 5 Quantitative Scatter Models (EMA, Momentum, Kinematics, OU, Fractal)...")
        quant_payload = compute_quant_models(stocks, cache, master_candles)
        with open(QUANT_MODELS_FILE, "w") as f:
            json.dump(quant_payload, f, indent=2)
        print(f"[INFO] Successfully saved Quantitative Models to {QUANT_MODELS_FILE}")

    # Process MTF Swing Trading Watchlist
    if args.watchlist in ("all", "mtf"):
        if cache is None:
            cache = load_cache()
        cache = process_mtf_watchlist(cache, force_refresh=args.force_refresh, batch_size=args.batch_size)

    # Synchronize generated files into public/data for Vite frontend
    sync_data_to_public()


if __name__ == "__main__":
    main()
