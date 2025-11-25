import React, { useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';
import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, run in demo mode
    if (!isSupabaseEnabled || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        // Test connectivity first
        const { checkSupabaseConnectivity } = await import('../lib/supabase');
        const isConnected = await checkSupabaseConnectivity();
        
        if (!isConnected || !supabase) {
          logger.debug('Supabase connectivity failed, running in demo mode');
          setLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          // Check if it's a network error
          if (error.message.includes('fetch') || error.message.includes('network')) {
            logger.warn('Network error getting session, running in demo mode:', error);
            setLoading(false);
            return;
          }
          logger.error('Error getting session', error instanceof Error ? error : new Error(String(error)));
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        logger.warn('Supabase connection failed, running in demo mode:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Try to set up auth state listener with error handling
    try {
      if (!supabase) {
        return;
      }
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          logger.debug('Auth state changed:', event, session?.user?.email);

          setSession(session);
          setUser(session?.user ?? null);

          if (event === 'SIGNED_IN') {
            toast.success('Successfully signed in!');
          } else if (event === 'SIGNED_OUT') {
            toast.success('Successfully signed out!');
          } else if (event === 'TOKEN_REFRESHED') {
            logger.debug('Token refreshed');
          }

          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      logger.warn('Failed to set up auth state listener, running in demo mode:', error);
      return () => {}; // Return empty cleanup function
    }
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      toast.error('Authentication is not available');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Please check your email to confirm your account!');
      } else {
        toast.success('Account created successfully!');
      }
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      toast.error('Authentication is not available');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Success toast will be shown by the auth state change listener
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!supabase) {
      toast.error('Authentication is not available');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      // Success toast will be shown by the auth state change listener
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      toast.error('Authentication is not available');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast.success('Password reset email sent!');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to send reset email');
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};