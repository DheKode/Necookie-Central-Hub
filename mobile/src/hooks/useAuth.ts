import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        if (!isSupabaseConfigured) return;

        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error signing out:', error.message);
    };

    return {
        session,
        user,
        loading,
        signOut,
        isAuthenticated: !!session?.user,
    };
}
