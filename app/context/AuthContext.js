'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getUserProfile } from '../lib/userProfile';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [basePriceMultiplier, setBasePriceMultiplier] = useState(1.0);

  const fetchAndSetProfile = async (userId) => {
    const profile = await getUserProfile(userId);
    if (profile) {
      setRole(profile.role);
      setDisplayName(profile.display_name);
      setBasePriceMultiplier(profile.base_price_multiplier);
    }
  };

  const clearProfile = () => {
    setRole(null);
    setDisplayName(null);
    setBasePriceMultiplier(1.0);
  };

  useEffect(() => {
    // Check active session on mount
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchAndSetProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchAndSetProfile(session.user.id);
        } else {
          clearProfile();
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearProfile();

    // Redirect to login after sign out
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
      role,
      displayName,
      basePriceMultiplier,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
