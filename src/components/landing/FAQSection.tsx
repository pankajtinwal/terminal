import { useState } from 'react';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is Margin Trading Facility (MTF) and why filter for 3.5x+ margin?',
      a: 'Margin Trading Facility (MTF) is a SEBI-approved mechanism offered by leading Indian brokers (like Zerodha, Dhan, Angel One, Groww, etc.) that allows you to buy and hold equities for swing trades by paying only 20% to 28% of the capital (giving you 3.5x to 4x leverage). Our MTF Radar specifically screens the 216 most liquid equities eligible for this maximum margin tier, allowing you to optimize your swing trade capital efficiency.',
    },
    {
      q: 'Why use an Equal-Weighted Synthetic Benchmark instead of Nifty 50?',
      a: 'Market-cap weighted indices like Nifty 50 are heavily distorted: just HDFC Bank, Reliance Industries, and ICICI Bank account for ~30% of the entire index weight! If Reliance rallies while 40 other stocks are crashing, the Nifty index prints green, misleading retail traders. Our Alpha 132 synthetic benchmark assigns each constituent exactly 1/n weight, revealing genuine market breadth, accumulation, and sector rotation.',
    },
    {
      q: 'Are the 5 quantitative alpha models subjective?',
      a: 'Zero subjectivity. Each model is rooted in deterministic mathematics: EMA Mean Reversion isolates geometric pullbacks, Cross-Sectional Residual Momentum strips out market beta, Kinematics calculates velocity and acceleration vectors, Ornstein-Uhlenbeck determines mean-reversion drift half-life, and Fractal Dimension calculates the Hurst exponent to confirm whether a trend is statistically genuine or random noise.',
    },
    {
      q: 'Which Indian brokers can I use with these watchlist setups?',
      a: 'You can execute these setups across any SEBI-registered broker offering equity cash and MTF. The ticker symbols and ISINs match standard NSE tickers used by Zerodha (Kite), Dhan, Groww, Angel One, Upstox, Kotak Neo, and ICICI Direct.',
    },
    {
      q: 'How frequently is the terminal data refreshed?',
      a: 'The terminal dataset updates after every trading day close once official NSE Bhavcopy and closing prices are published. All quantitative models, phase-space vectors, and multi-timeframe return brackets re-index automatically.',
    },
    {
      q: 'Can I test the terminal before paying?',
      a: 'Yes! The Explorer Tier lets you launch the full interactive terminal to experience the equal-weighted benchmark and treemap heatmap. You can upgrade to Pro at any time to unlock the 216 MTF Stock Radar and all 5 Quant Alpha Engines.',
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 border-b border-zinc-800/80 bg-[#09090b]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          <h2 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            Common Inquiries
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </p>
          <p className="text-sm text-zinc-400">
            Everything you need to know about the terminal architecture, MTF leverage, and quantitative modeling.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-zinc-900/40 border border-zinc-800/90 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-800/30 transition"
                >
                  <span className="text-sm font-semibold text-zinc-200">
                    {faq.q}
                  </span>
                  <svg
                    className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 bg-zinc-950/40 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
