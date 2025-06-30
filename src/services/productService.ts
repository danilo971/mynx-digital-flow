
import { supabase, handleApiError, SALES_UNITS } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductSearchResult = {
  id: number;
  code: string;
  name: string;
  barcode: string | null;
  price: number;
  stock: number;
};

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
   * Busca produtos por termo (nome, código ou código de barras)
   * Utiliza a função RPC search_products criada no Supabase
   */
  async searchProducts(searchTerm: string): Promise<ProductSearchResult[]> {
    try {
      // Validação do termo de busca
      if (!searchTerm || searchTerm.trim() === '') {
        console.log('Termo de busca vazio, retornando array vazio');
        return [];
      }

      console.log('Buscando produtos com termo:', searchTerm.trim());
      
      // Chamada à função RPC search_products
      const { data, error } = await supabase
        .rpc('search_products', { search_term: searchTerm.trim() });
      
      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }
      
      // Log dos resultados para depuração
      console.log('Resultados da busca:', data?.length || 0, 'produtos encontrados');
      if (data && data.length > 0) {
        console.log('Primeiro resultado:', data[0]);
      }
      
      return data || [];
    } catch (error) {
      console.error('Exceção ao buscar produtos:', error);
      return [];
    }
  },

  /**
   * Verificar estoque disponível para um produto
   */
  async checkStockAvailability(productId: number, quantity: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('check_stock_availability', {
          product_id_param: productId,
          quantity_param: quantity
        });

      if (error) {
        console.error('Erro ao verificar estoque:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade de estoque:', error);
      return false;
    }
  },

  /**
   * Atualizar estoque de um produto manualmente
   */
  async updateProductStock(id: number, newStock: number): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) {
        handleApiError(error, 'Erro ao atualizar estoque');
        return null;
      }
      return data?.[0] || null;
    } catch (error) {
      handleApiError(error, 'Erro ao atualizar estoque');
      return null;
    }
  },
  
  /**
   * Get all sales units/categories 
   */
  getSalesUnits() {
    return SALES_UNITS;
  }
};
