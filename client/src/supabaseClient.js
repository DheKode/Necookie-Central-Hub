// --- SUPABASE CLIENT SETUP ---
// Supabase is our Database-as-a-Service (BaaS) provider. It handles authentication, 
// a PostgreSQL database, real-time subscriptions, and storage.

import { createClient } from '@supabase/supabase-js';

// 1. Load Environment Variables
// In Vite (our build tool), environment variables must be prefixed with VITE_ to be exposed to the client.
// These values are securely stored outside our codebase in a `.env` file so we don't accidentally commit secrets to GitHub.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// The "Anon Key" is a public key intended for use in the browser. It allows access to the database,
// but operations are strictly constrained by Row Level Security (RLS) policies set up in the Supabase dashboard.
// NEVER expose the SUPABASE_SERVICE_ROLE_KEY here on the client.
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Initialize the Client
// This creates the main connection to our database that we will import and use throughout the app 
// to fetch data, listen for changes, or handle user login.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);