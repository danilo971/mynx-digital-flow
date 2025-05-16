
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pshcwcgumsxcazimiaev.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzaGN3Y2d1bXN4Y2F6aW1pYWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MzE0MDcsImV4cCI6MjA2MzAwNzQwN30.Hho36dHiy0AjOsHNhNRlPSDxzEbsRya6U-TwhdNjTOc';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage
    }
  }
);
