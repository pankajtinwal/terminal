# Project: Indian Stock Custom Index Engine & Visualizer

## 1. Project Overview & Scope
We are building a custom tracking and index generation platform for a private watchlist of 132 Indian stocks. The platform operates on a static JAMstack architecture (Python data pipeline -> committed static JSON -> Cloudflare Pages) updating 2–3 times daily via GitHub Actions without a database.

### Project Phases
- **Phase 1 (Current Focus):** Data pipeline with delta-caching, synthetic Equal-Weighted Index engine (Master + Sector indices), and an interactive TradingView Lightweight Charts frontend.
- **Phase 2 (Upcoming):** Advanced quantitative mathematics, multi-factor technical screening models, weekly return heatmaps, and aggregate summary filters.

---

## 2. Phase 1 Core Architecture

### A. Delta-Caching Data Ingestion (`yfinance`)
- All tickers must append `.NS` for National Stock Exchange of India (NSE).
- **Zero-Waste / Anti-Ban Strategy:** 
  - On the first run, pull 1 year of daily 1D OHLC data and store it locally (`history.parquet` or `history.json`).
  - On subsequent runs, check the latest timestamp in the local cache and query `yfinance` **only** for the missing dates.
  - Query in batches of 15–20 tickers with random 1.5–3s `time.sleep()` delays to avoid rate-limiting.
  - Merge the incremental delta into the local cache.

### B. Index Mathematical Engine (Equal-Weighted, Base 1000)
Initialize all indices exactly 1 year ago at a **Base Value of 1000** on Day 0 ($t_0$).

For every subsequent trading day $t$, where $n$ is the number of active stocks in the index:

1. **Daily Composite Return ($R_t$):**
   $$R_t = \frac{1}{n} \sum_{i=1}^{n} \left( \frac{Close_{i,t} - Close_{i,t-1}}{Close_{i,t-1}} \right)$$

2. **Index Close:**
   $$Index\_Close_t = Index\_Close_{t-1} \times (1 + R_t)$$

3. **Synthesized OHLC (Candlestick Geometry):**
   $$Index\_Open_t = Index\_Close_{t-1} \times \left[ 1 + \frac{1}{n} \sum_{i=1}^{n} \left( \frac{Open_{i,t} - Close_{i,t-1}}{Close_{i,t-1}} \right) \right]$$
   $$Index\_High_t = Index\_Close_{t-1} \times \left[ 1 + \frac{1}{n} \sum_{i=1}^{n} \left( \frac{High_{i,t} - Close_{i,t-1}}{Close_{i,t-1}} \right) \right]$$
   $$Index\_Low_t  = Index\_Close_{t-1} \times \left[ 1 + \frac{1}{n} \sum_{i=1}^{n} \left( \frac{Low_{i,t} - Close_{i,t-1}}{Close_{i,t-1}} \right) \right]$$

### C. Index Generation Rules
1. **Master Index:** Calculate for the entire basket of 132 stocks.
2. **Sector Sub-Indices:** Group the 132 stocks by sector. If a sector contains **4 or more stocks**, generate a dedicated index following the exact same math ($n = \text{stocks in sector}$). Sectors with fewer than 4 stocks do not get an index.
3. **Data Export:** Output clean JSON files formatted for Lightweight Charts:
   `[{"time": "YYYY-MM-DD", "open": 1000.0, "high": 1005.2, "low": 998.4, "close": 1002.1}, ...]`

---

## 3. Frontend Visualizer (TradingView Style)
- **File:** Standalone `index.html` styled with Tailwind CSS (dark mode by default).
- **Library:** TradingView Lightweight Charts v5 (`standalone.production.js`).
- **UI Components:**
  - Header with current Index Value, Daily Change (pts and %), and High/Low range.
  - Dropdown selector to switch between the **Master Index** and any generated **Sector Sub-Indices**.
  - High-performance, responsive Candlestick Chart with interactive crosshair, price scale, and volume/time navigation.
  - Toggle between Candlestick mode and Line mode.

---

## 4. Next Step
Acknowledge receipt of this blueprint. I will provide the list of 132 Indian stocks with their respective sectors. Once provided, write `build_indices.py` and `index.html`.