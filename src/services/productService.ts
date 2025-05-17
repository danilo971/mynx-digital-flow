
import { supabase, handleApiError, SALES_UNITS } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

export type Product = Database['public']['Tables']['products']['Row'];

export const productService = {
  /**
   * Create a new product
   */
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    try {
      console.log('Criando produto:', productData);
      
      const { data, error } = await supabase.from('products').insert([productData]).select();
      
      if (error) {
        console.error('Erro ao criar produto:', error);
        throw error;
      }
      
      return data?.[0] || null;
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },

  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) {
        handleApiError(error, 'Erro ao buscar produtos');
        return [];
      }
      return data || [];
    } catch (error) {
      handleApiError(error, 'Erro ao buscar produtos');
      return [];
    }
  },
  
  /**
   * Get a product by id
   */
  async getProductById(id: number): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        handleApiError(error, 'Erro ao buscar produto');
        return null;
      }
      return data;
    } catch (error) {
      handleApiError(error, 'Erro ao buscar produto');
      return null;
    }
  },
  
  /**
   * Update a product
   */
  async updateProduct(id: number, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select();
      
      if (error) {
        handleApiError(error, 'Erro ao atualizar produto');
        return null;
      }
      return data?.[0] || null;
    } catch (error) {
      handleApiError(error, 'Erro ao atualizar produto');
      return null;
    }
  },
  
  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        handleApiError(error, 'Erro ao excluir produto');
        return false;
      }
      
      return true;
    } catch (error) {
      handleApiError(error, 'Erro ao excluir produto');
      return false;
    }
  },
  
  /**
   * Get all sales units/categories 
   */
  getSalesUnits() {
    return SALES_UNITS;
  }
};
