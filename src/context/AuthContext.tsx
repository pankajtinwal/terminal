import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export type UserPlan = 'free' | 'pro' | 'pro_monthly' | 'pro_annual' | 'institutional';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
}

export interface UserSubscription {
  plan: UserPlan;
  status: 'trial' | 'active' | 'past_due' | 'canceled';
  validUntil?: string;
  lastPaymentId?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  subscription: UserSubscription;
  loading: boolean;
  isSupabaseLive: boolean;
  isPro: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  upgradePlan: (plan: UserPlan, paymentId: string) => Promise<void>;
}

const LOCAL_STORAGE_SESSION_KEY = 'quant_trader_session';

const defaultSubscription: UserSubscription = {
  plan: 'free',
  status: 'active',
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription>(defaultSubscription);
  const [loading, setLoading] = useState(true);

  // Load from Supabase or Local Storage
  const loadProfileAndSubscription = useCallback(async (userId: string, userEmail: string, metaName?: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileData) {
          setProfile({
            id: profileData.id,
            email: profileData.email || userEmail,
            fullName: profileData.full_name || metaName || 'Trader',
            role: profileData.role || 'user',
            avatarUrl: profileData.avatar_url,
          });
        } else {
          // Fallback profile if record not yet created by trigger
          setProfile({
            id: userId,
            email: userEmail,
            fullName: metaName || userEmail.split('@')[0] || 'Trader',
            role: 'user',
          });
        }

        // Fetch Subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (subData) {
          setSubscription({
            plan: (subData.plan as UserPlan) || 'free',
            status: subData.status || 'active',
            validUntil: subData.current_period_end,
            lastPaymentId: subData.razorpay_payment_id,
          });
        }
      } catch (err) {
        console.error('Error loading Supabase profile:', err);
      }
    } else {
      // Local fallback mode
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProfile(parsed.profile);
          setSubscription(parsed.subscription || defaultSubscription);
        } catch {
          // ignore parsing error
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Initialize with Supabase Auth
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          loadProfileAndSubscription(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.full_name || session.user.user_metadata?.name
          );
        }
        setLoading(false);
      });

      const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadProfileAndSubscription(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.full_name || session.user.user_metadata?.name
          );
        } else {
          setUser(null);
          setProfile(null);
          setSubscription(defaultSubscription);
        }
        setLoading(false);
      });

      return () => {
        authSub.unsubscribe();
      };
    } else {
      // Local demo / mock mode
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser({ id: parsed.profile.id, email: parsed.profile.email } as any);
          setProfile(parsed.profile);
          setSubscription(parsed.subscription || defaultSubscription);
        } catch {
          localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
        }
      } else {
        // Default demo profile for seamless testing
        const demoProfile: UserProfile = {
          id: 'demo_user_132',
          email: 'pankaj@terminal.quant',
          fullName: 'Pankaj Tinwal',
          role: 'user',
        };
        const demoSub: UserSubscription = {
          plan: 'pro',
          status: 'active',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
        setProfile(demoProfile);
        setSubscription(demoSub);
        setUser({ id: demoProfile.id, email: demoProfile.email } as any);
      }
      setLoading(false);
    }
  }, [loadProfileAndSubscription]);

  // Sign In with Email & Password
  const signInWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        await loadProfileAndSubscription(data.user.id, data.user.email || '');
      }
      return { error: null };
    }

    // Mock mode signIn
    const localProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      fullName: email.split('@')[0],
      role: 'user',
    };
    const localSub: UserSubscription = {
      plan: 'pro',
      status: 'active',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify({ profile: localProfile, subscription: localSub }));
    setUser({ id: localProfile.id, email } as any);
    setProfile(localProfile);
    setSubscription(localSub);
    setLoading(false);
    return { error: null };
  };

  // Sign Up with Email & Password
  const signUpWithEmail = async (email: string, password: string, fullName: string): Promise<{ error: string | null }> => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      setLoading(false);
      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        await loadProfileAndSubscription(data.user.id, email, fullName);
      }
      return { error: null };
    }

    // Mock mode signUp
    const localProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      fullName,
      role: 'user',
    };
    const localSub: UserSubscription = {
      plan: 'free',
      status: 'active',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify({ profile: localProfile, subscription: localSub }));
    setUser({ id: localProfile.id, email } as any);
    setProfile(localProfile);
    setSubscription(localSub);
    setLoading(false);
    return { error: null };
  };

  // Sign In with Google OAuth
  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    }

    // Mock Google sign-in
    const localProfile: UserProfile = {
      id: `usr_google_${Date.now()}`,
      email: 'trader.google@gmail.com',
      fullName: 'Google Trader',
      role: 'user',
    };
    const localSub: UserSubscription = {
      plan: 'pro',
      status: 'active',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify({ profile: localProfile, subscription: localSub }));
    setUser({ id: localProfile.id, email: localProfile.email } as any);
    setProfile(localProfile);
    setSubscription(localSub);
    return { error: null };
  };

  // Sign Out
  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    setUser(null);
    setProfile(null);
    setSubscription(defaultSubscription);
  };

  // Upgrade Plan after Razorpay success
  const upgradePlan = async (newPlan: UserPlan, paymentId: string) => {
    const isAnnual = newPlan === 'pro_annual';
    const days = isAnnual ? 365 : 30;
    const validUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const updatedSub: UserSubscription = {
      plan: newPlan,
      status: 'active',
      validUntil,
      lastPaymentId: paymentId,
    };

    setSubscription(updatedSub);

    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            plan: newPlan,
            status: 'active',
            razorpay_payment_id: paymentId,
            current_period_end: validUntil,
            updated_at: new Date().toISOString(),
          });

        await supabase
          .from('payment_logs')
          .insert({
            user_id: user.id,
            razorpay_payment_id: paymentId,
            amount: isAnnual ? 671000 : 79900,
            plan: newPlan,
            status: 'captured',
          });
      } catch (err) {
        console.error('Failed to update subscription in Supabase:', err);
      }
    } else {
      // Update local storage
      if (profile) {
        localStorage.setItem(
          LOCAL_STORAGE_SESSION_KEY,
          JSON.stringify({ profile, subscription: updatedSub })
        );
      }
    }
  };

  const isPro = subscription.plan !== 'free';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        loading,
        isSupabaseLive: isSupabaseConfigured,
        isPro,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        upgradePlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
