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
    let timeoutId;

    // Check active session on mount with 5s timeout to prevent infinite hang
    const getSession = async () => {
      try {
        timeoutId = setTimeout(() => {
          console.warn('⚠️ Auth check timed out after 5s — proceeding without session');
          setLoading(false);
        }, 5000);

        const { data: { session } } = await supabase.auth.getSession();
        clearTimeout(timeoutId);

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchAndSetProfile(session.user.id);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('⚠️ Auth session expired or invalid, signing out:', error.message);
        setUser(null);
        clearProfile();
        await supabase.auth.signOut().catch(() => {});
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchAndSetProfile(session.user.id);
          } else {
            clearProfile();
          }
        } catch (error) {
          console.warn('⚠️ Auth state change error, clearing session:', error.message);
          setUser(null);
          clearProfile();
        }
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
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
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Sign out error (proceeding anyway):', error.message);
    }
    clearProfile();
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
