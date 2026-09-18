import { useState } from 'react';

interface AuthCheckoutModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  selectedPlan?: string;
  onClose: () => void;
  onSuccessLaunch: () => void;
}

export default function AuthCheckoutModal({
  isOpen,
  initialMode,
  selectedPlan = 'pro',
  onClose,
  onSuccessLaunch,
}: AuthCheckoutModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [plan, setPlan] = useState<string>(selectedPlan);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMsg('Connecting to secure payment gateway / auth provider...');

    setTimeout(() => {
      setIsProcessing(false);
      setStatusMsg('Account verified! Launching your terminal session...');
      setTimeout(() => {
        onSuccessLaunch();
        onClose();
      }, 700);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#121215] border border-zinc-800 p-6 sm:p-8 shadow-2xl shadow-black text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-zinc-100 uppercase">
            TERMINAL • ALPHA ACCESS
          </span>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 rounded-lg bg-zinc-900 border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 rounded-md text-xs font-mono font-semibold transition cursor-pointer ${
              mode === 'signup' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account & Plan
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 rounded-md text-xs font-mono font-semibold transition cursor-pointer ${
              mode === 'login' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Existing Member Sign In
          </button>
        </div>

        {/* Form Title */}
        <div className="mb-5">
          <h3 className="text-lg font-bold text-white">
            {mode === 'signup' ? 'Unlock Full Quantitative Terminal' : 'Welcome Back Trader'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'signup'
              ? 'Get instant access to 216 MTF stocks, 5 quant models, and live treemaps.'
              : 'Enter your credentials to enter your live terminal session.'}
          </p>
        </div>

        {/* Plan Selector (if signup) */}
        {mode === 'signup' && (
          <div className="mb-4">
            <label className="block text-[11px] font-mono text-zinc-300 uppercase tracking-wider mb-1.5">
              Select Your Plan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPlan('pro')}
                className={`p-2.5 rounded-lg border text-left font-mono transition cursor-pointer ${
                  plan === 'pro'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Pro Swing</span>
                  <span className="text-[10px] text-emerald-400">₹1,499/m</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">216 MTF + 5 Models</div>
              </button>

              <button
                type="button"
                onClick={() => setPlan('institutional')}
                className={`p-2.5 rounded-lg border text-left font-mono transition cursor-pointer ${
                  plan === 'institutional'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Institutional</span>
                  <span className="text-[10px] text-cyan-400">₹4,999/m</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Full API + Custom Baskets</div>
              </button>
            </div>
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono text-zinc-300 mb-1">Trader Name / Handle</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-zinc-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@domain.com"
              className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {statusMsg && (
            <div className="p-2.5 rounded bg-emerald-950/50 border border-emerald-500/40 text-xs font-mono text-emerald-300">
              {statusMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-2.5 mt-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{mode === 'signup' ? `Proceed to Secure Checkout (${plan === 'pro' ? '₹1,499' : '₹4,999'})` : 'Sign In & Launch Terminal'}</span>
            )}
          </button>
        </form>

        {/* Demo Fast-Track notice */}
        <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
          <p className="text-[11px] font-mono text-zinc-400">
            Want to test right now without signing up?{' '}
            <button
              type="button"
              onClick={() => {
                onSuccessLaunch();
                onClose();
              }}
              className="text-emerald-400 hover:underline font-bold cursor-pointer"
            >
              Launch Live Demo Terminal →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
