
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Use the consistent key from the project
const supabaseUrl = "https://pshcwcgumsxcazimiaev.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzaGN3Y2d1bXN4Y2F6aW1pYWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MzA0MTQsImV4cCI6MjA2MzAwNjQxNH0.XPgnNe6rN5y-_-LS2DLmhG0bxrUDwCGwIg1o1gfpQeM";

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
