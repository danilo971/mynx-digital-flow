
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

// Sales units for product categories
export const SALES_UNITS = [
  "ampola", "arranjo", "balde", "bandeja", "barra", "bisnaga", "bloco", "bobina", 
  "bombona", "cápsula", "cartela", "caixa", "caixa com 2 unidades", "caixa com 3 unidades", 
  "caixa com 5 unidades", "caixa com 10 unidades", "caixa com 15 unidades", "caixa com 20 unidades", 
  "caixa com 25 unidades", "caixa com 50 unidades", "caixa com 100 unidades", "cento", 
  "centímetro", "centímetro quadrado", "conjunto", "display", "dúzia", "embalagem", "fardo", 
  "folha", "frasco", "galão", "garrafa", "gramas", "jogo", "quilograma", "kit", "lata", 
  "litro", "metro", "metro quadrado", "metro cúbico", "milheiro", "mililitro", "megawatt hora", 
  "pacote", "palete", "par", "pares", "peça", "pote", "quilate", "resma", "rolo", "saco", 
  "sacola", "tambor", "tanque", "tonelada", "tubo", "unidade", "vasilhame", "vidro"
];

// Utility function to handle API errors
export const handleApiError = (error: any, message: string) => {
  console.error(`${message}:`, error);
  if (typeof window !== 'undefined') {
    alert(`Erro: ${message}. ${error?.message || 'Tente novamente mais tarde.'}`);
  }
  return null;
};
