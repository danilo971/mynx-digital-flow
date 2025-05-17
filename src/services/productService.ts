
import { supabase, handleApiError, SALES_UNITS } from '@/lib/supabase';

export const productService = {
  /**
   * Create a new product
   */
  async createProduct(productData: {
    code: string;
    name: string;
    barcode?: string | null;
    price: number;
    stock: number;
    category: string;
    image_url?: string | null;
  }) {
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
  async getAllProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) return handleApiError(error, 'Erro ao buscar produtos');
      return data || [];
    } catch (error) {
      return handleApiError(error, 'Erro ao buscar produtos');
    }
  },
  
  /**
   * Get a product by id
   */
  async getProductById(id: number) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) return handleApiError(error, 'Erro ao buscar produto');
      return data;
    } catch (error) {
      return handleApiError(error, 'Erro ao buscar produto');
    }
  },
  
  /**
   * Update a product
   */
  async updateProduct(id: number, productData: Partial<{
    code: string;
    name: string;
    barcode?: string | null;
    price: number;
    stock: number;
    category: string;
    image_url?: string | null;
  }>) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select();
      
      if (error) return handleApiError(error, 'Erro ao atualizar produto');
      return data?.[0] || null;
    } catch (error) {
      return handleApiError(error, 'Erro ao atualizar produto');
    }
  },
  
  /**
   * Delete a product
   */
  async deleteProduct(id: number) {
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
