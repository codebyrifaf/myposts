import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { createUserProfile } from './database';

// Demo mode flag - set to true for offline demo
const DEMO_MODE = false; // Production mode - use real Supabase database

// Demo user for testing
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@example.com',
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  user_metadata: {
    username: 'demouser',
    full_name: 'Demo User'
  }
} as unknown as User;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      // In demo mode, auto-login with demo user
      setTimeout(() => {
        setUser(DEMO_USER);
        setSession({ user: DEMO_USER } as Session);
        setLoading(false);
      }, 1000);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // If user signs in and we have a session, ensure user profile exists
      if (session?.user && _event === 'SIGNED_IN') {
        console.log('User signed in, checking profile...');
        const profileExists = await createUserProfile(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
        );
        console.log('Profile check/creation result:', profileExists);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    if (DEMO_MODE) {
      // In demo mode, simulate successful signup
      const demoUser = {
        ...DEMO_USER,
        email,
        user_metadata: { username, full_name: fullName }
      };
      setUser(demoUser);
      setSession({ user: demoUser } as unknown as Session);
      return { data: { user: demoUser }, error: null };
    }

    try {
      console.log('Attempting to sign up with email:', email, 'username:', username, 'fullName:', fullName);
      
      // Create the user account with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          },
        },
      });

      console.log('Sign up result:', data, 'error:', error);

      // Don't try to create user profile if there's an auth error
      if (error) {
        console.error('Auth signup error:', error);
        return { data, error };
      }

      if (data.user) {
        console.log('User created successfully with ID:', data.user.id);
        console.log('User email confirmed?', data.user.email_confirmed_at);
        
        // Create user profile using our helper function
        const profileCreated = await createUserProfile(
          data.user.id,
          data.user.email || email,
          fullName
        );
        
        if (!profileCreated) {
          console.warn('Failed to create user profile, but signup was successful');
        }
      }

      return { data, error };
    } catch (error) {
      console.error('Sign up catch error:', error);
      return { data: null, error: error as any };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (DEMO_MODE) {
      // In demo mode, simulate successful login
      const demoUser = {
        ...DEMO_USER,
        email,
      };
      setUser(demoUser);
      setSession({ user: demoUser } as unknown as Session);
      return { data: { user: demoUser, session: { user: demoUser } }, error: null };
    }

    try {
      console.log('Attempting to sign in with email:', email);
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log('Sign in result:', result);
      return result;
    } catch (error) {
      console.error('Sign in catch error:', error);
      return { data: null, error: error as any };
    }
  };

  const signOut = async () => {
    if (DEMO_MODE) {
      setUser(null);
      setSession(null);
      return;
    }

    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
