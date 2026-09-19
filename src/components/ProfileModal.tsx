import { useAuth } from '../context/AuthContext';
import { triggerRazorpayCheckout } from '../utils/razorpay';
import { useState } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { profile, subscription, isSupabaseLive, isPro, signOut, upgradePlan } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = (plan: 'pro_monthly' | 'pro_annual') => {
    setUpgrading(true);
    setMessage('Initializing Razorpay Checkout...');

    const isAnnual = plan === 'pro_annual';
    triggerRazorpayCheckout({
      planId: isAnnual ? 'pro_annual' : 'pro_monthly',
      planName: isAnnual ? 'KoshX Pro Annual (30% OFF)' : 'KoshX Pro Monthly',
      amountInRupees: isAnnual ? 6710 : 799,
      userEmail: profile?.email,
      userName: profile?.fullName,
      onSuccess: async (res) => {
        await upgradePlan(isAnnual ? 'pro_annual' : 'pro_monthly', res.razorpay_payment_id);
        setMessage(`Payment successful! Upgraded to ${isAnnual ? 'PRO ANNUAL' : 'PRO MONTHLY'}.`);
        setUpgrading(false);
      },
      onFailure: (err) => {
        console.warn('Payment failed or cancelled:', err);
        setMessage('Payment was cancelled or failed.');
        setUpgrading(false);
      },
    });
  };

  const formattedDate = subscription.validUntil
    ? new Date(subscription.validUntil).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-[#121215] border border-zinc-800 p-6 sm:p-7 shadow-2xl text-left font-mono">
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-lg font-bold">
            {profile?.fullName?.slice(0, 2).toUpperCase() || 'PT'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-sans">
                {profile?.fullName || 'Trader'}
              </h3>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                  isPro
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {subscription.plan.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{profile?.email || 'trader@domain.com'}</p>
          </div>
        </div>

        {/* Subscription Info Card */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-2.5 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Current Plan</span>
            <span className="text-white font-semibold capitalize">{subscription.plan.replace('_', ' ')} Tier</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Status</span>
            <span className="text-emerald-400 font-semibold capitalize flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {subscription.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Valid Until</span>
            <span className="text-zinc-200">{formattedDate}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800">
            <span className="text-zinc-400">Data Host</span>
            <span className="text-[11px] text-zinc-300 flex items-center gap-1">
              {isSupabaseLive ? (
                <>
                  <span className="text-emerald-400">●</span> Supabase (AWS Mumbai)
                </>
              ) : (
                <>
                  <span className="text-amber-400">●</span> Local Demo Mode
                </>
              )}
            </span>
          </div>
        </div>

        {/* Upgrade Actions */}
        {subscription.plan !== 'pro_annual' && (
          <div className="mb-5 space-y-2">
            <label className="block text-[10px] text-zinc-400 uppercase tracking-wider">
              {subscription.plan === 'free' ? 'Upgrade Subscription' : 'Upgrade to Annual (Save 30%)'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {subscription.plan === 'free' && (
                <button
                  type="button"
                  disabled={upgrading}
                  onClick={() => handleUpgrade('pro_monthly')}
                  className="p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <span>Pro Monthly</span>
                    <span className="text-[10px] text-emerald-400 font-bold">₹799/m</span>
                  </div>
                  <div className="text-[10px] font-normal text-zinc-400 mt-0.5">Flexible monthly access</div>
                </button>
              )}
              <button
                type="button"
                disabled={upgrading}
                onClick={() => handleUpgrade('pro_annual')}
                className={`p-2.5 rounded-lg bg-gradient-to-r from-emerald-950/60 to-zinc-900 hover:from-emerald-900/60 border border-emerald-500/50 text-white text-xs font-bold transition cursor-pointer text-left ${
                  subscription.plan !== 'free' ? 'col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Pro Annual</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">SAVE 30%</span>
                </div>
                <div className="text-[10px] font-normal text-emerald-300 mt-0.5">
                  ₹6,710 / yr <span className="text-zinc-400 font-normal">(₹559/mo)</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="mb-4 p-2.5 rounded bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-200 text-center">
            {message}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={async () => {
              await signOut();
              onClose();
            }}
            className="flex-1 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            Sign Out
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
