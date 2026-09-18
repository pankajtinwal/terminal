import { useState } from 'react';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import FeatureHighlights from './FeatureHighlights';
import QuantModelsShowcase from './QuantModelsShowcase';
import PricingSection from './PricingSection';
import FAQSection from './FAQSection';
import LandingFooter from './LandingFooter';
import AuthCheckoutModal from './AuthCheckoutModal';

interface LandingPageProps {
  onLaunchTerminal: () => void;
}

export default function LandingPage({ onLaunchTerminal }: LandingPageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const handleOpenAuth = (mode: 'login' | 'signup', plan: string = 'pro') => {
    setAuthMode(mode);
    setSelectedPlan(plan);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      <LandingNavbar
        onLaunchTerminal={onLaunchTerminal}
        onOpenAuth={(mode) => handleOpenAuth(mode, 'pro')}
      />

      <main>
        <HeroSection
          onLaunchTerminal={onLaunchTerminal}
          onOpenAuth={handleOpenAuth}
        />

        <FeatureHighlights />

        <QuantModelsShowcase
          onLaunchTerminal={onLaunchTerminal}
        />

        <PricingSection
          onLaunchTerminal={onLaunchTerminal}
          onSelectPlan={(plan) => handleOpenAuth('signup', plan)}
        />

        <FAQSection />
      </main>

      <LandingFooter onLaunchTerminal={onLaunchTerminal} />

      <AuthCheckoutModal
        isOpen={authModalOpen}
        initialMode={authMode}
        selectedPlan={selectedPlan}
        onClose={() => setAuthModalOpen(false)}
        onSuccessLaunch={onLaunchTerminal}
      />
    </div>
  );
}
