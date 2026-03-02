import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const fallbackSupabaseUrl = 'https://placeholder-project.supabase.co';
const fallbackSupabaseAnonKey = 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
    console.warn('Supabase URL or Anon Key is missing. Check your environment variables.');
}

export const supabase = createClient(
    isSupabaseConfigured ? supabaseUrl : fallbackSupabaseUrl,
    isSupabaseConfigured ? supabaseAnonKey : fallbackSupabaseAnonKey,
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    },
);
