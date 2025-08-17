import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Replace these with your actual Supabase project credentials
// You'll get these when you create a free Supabase project at supabase.com
const supabaseUrl = 'https://tngjmzywpcgcxwxcpdrm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2ptenl3cGNnY3h3eGNwZHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTY2NDksImV4cCI6MjA3MTAzMjY0OX0.YtKfu1wf3qIzD9wcJrilcQ_bOxBICZ7DXFNsdZ5Rp9s';

// Create storage based on platform
const getStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  }
  return AsyncStorage;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  user?: User;
}
