import { useState } from 'react';

interface PricingSectionProps {
  onSelectPlan: (plan: string) => void;
  onLaunchTerminal: () => void;
}

export default function PricingSection({ onSelectPlan, onLaunchTerminal }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const plans = [
    {
      id: 'free',
      name: 'Explorer Tier',
      tagline: 'Ideal for inspecting equal-weighted benchmark basics',
      priceMonthly: '₹0',
      priceAnnual: '₹0',
      period: 'forever free',
      highlighted: false,
      features: [
        'KoshX Core investment basket',
        '1D Treemap Heatmap view',
        'Equal-weighted candlestick index chart',
        'Constituent breakdown table',
        'Community documentation access',
      ],
      missing: [
        '216 MTF Leveraged Screener (3.5x+)',
        '5 Quant Alpha Models & Scatter Plots',
        'Multi-timeframe 1W/1M/3M/6M/1Y heatmaps',
        'CSV raw constituent exports',
      ],
      ctaText: 'Launch Free Terminal',
      onCta: onLaunchTerminal,
    },
    {
      id: 'pro',
      name: 'Pro Swing Trader',
      tagline: 'Engineered for active leveraged swing traders on Indian brokerages',
      priceMonthly: '₹1,499',
      priceAnnual: '₹999',
      annualTotal: '₹11,999 / billed annually',
      period: billingCycle === 'annual' ? '/ month (billed annually)' : '/ month',
      badge: 'MOST POPULAR',
      highlighted: true,
      features: [
        'Full 216 MTF Stocks Watchlist (3.5x - 4x margin)',
        'All 5 Quantitative Models (EMA, Momentum, Kinematic, OU, Fractal)',
        'Multi-timeframe Treemaps (1D, 1W, 1M, 3M, 6M, 1Y)',
        'Return bracket filters & magnitude sizing',
        'Kinematic rocket & springboard buy flags',
        'Full CSV & JSON data downloads',
        'Daily post-market sync schedule',
      ],
      missing: [],
      ctaText: 'Get Pro Access Now',
      onCta: () => onSelectPlan('pro'),
    },
    {
      id: 'institutional',
      name: 'Institutional / API',
      tagline: 'For systematic funds, prop desks, and quant developers',
      priceMonthly: '₹4,999',
      priceAnnual: '₹3,499',
      annualTotal: '₹41,999 / billed annually',
      period: billingCycle === 'annual' ? '/ month (billed annually)' : '/ month',
      highlighted: false,
      features: [
        'Everything in Pro Swing Trader',
        'REST / JSON API endpoints for trading algorithms',
        'Custom synthetic index synthesizer (build bespoke baskets)',
        'Direct Python SDK & Jupyter integration',
        'Private Discord alpha alerts & priority support',
        'SEBI compliant institutional audit logs',
      ],
      missing: [],
      ctaText: 'Upgrade to Institutional',
      onCta: () => onSelectPlan('institutional'),
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 border-b border-zinc-800/80 bg-[#0c0c0e] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            Predictable Pricing
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Invest in an Institutional Decision Engine
          </p>
          <p className="text-sm text-zinc-400">
            One good MTF swing trade easily pays for an entire year of access. Cancel anytime.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <div className="inline-flex items-center p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
                  billingCycle === 'annual' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-950/80 text-emerald-300 font-mono">
                  SAVE 33%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((p) => {
            const displayPrice = billingCycle === 'annual' ? p.priceAnnual : p.priceMonthly;

            return (
              <div
                key={p.id}
                className={`relative rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                  p.highlighted
                    ? 'p-8 bg-gradient-to-b from-zinc-900 to-[#101314] border-2 border-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.15)] -translate-y-2'
                    : 'p-7 bg-zinc-900/40 border border-zinc-800/90 hover:border-zinc-700'
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-mono text-[11px] font-extrabold tracking-wider uppercase shadow-md">
                    {p.badge}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">{p.tagline}</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-4xl font-extrabold text-white">{displayPrice}</span>
                      <span className="text-xs text-zinc-400">{p.period}</span>
                    </div>
                    {billingCycle === 'annual' && p.annualTotal && (
                      <p className="text-[11px] font-mono text-emerald-400/90 mt-1">{p.annualTotal}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={p.onCta}
                    className={`w-full py-3 rounded-lg font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                      p.highlighted
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80'
                    }`}
                  >
                    <span>{p.ctaText}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <div className="pt-5 border-t border-zinc-800 space-y-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                      What's Included:
                    </span>
                    <ul className="space-y-2.5">
                      {p.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{feat}</span>
                        </li>
                      ))}
                      {p.missing.map((miss, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-600 line-through">
                          <svg className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          <span>{miss}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-800/80 text-center">
                  <span className="text-[11px] font-mono text-zinc-400">
                    Instant access via Razorpay / Stripe / UPI
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
