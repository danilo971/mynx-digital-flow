
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Product {
  id?: number;
  code: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string | null;
}

export const productService = {
  // Obter todos os produtos
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        toast.error('Não foi possível carregar os produtos');
        return [];
      }

      return data || [];
    } catch (e) {
      console.error('Erro inesperado ao buscar produtos:', e);
      toast.error('Erro ao carregar produtos');
      return [];
    }
  },

  // Obter um produto pelo ID
  async getProductById(id: number): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Erro ao buscar produto ${id}:`, error);
        toast.error('Não foi possível carregar o produto');
        return null;
      }

      return data;
    } catch (e) {
      console.error(`Erro inesperado ao buscar produto ${id}:`, e);
      toast.error('Erro ao carregar o produto');
      return null;
    }
  },

  // Adicionar um novo produto
  async createProduct(product: Product): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          code: product.code,
          name: product.name,
          barcode: product.barcode,
          price: product.price,
          stock: product.stock,
          category: product.category,
          image_url: product.image_url,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar produto:', error);
        toast.error(`Erro ao criar produto: ${error.message}`);
        return null;
      }

      toast.success('Produto cadastrado com sucesso');
      return data;
    } catch (e) {
      console.error('Erro inesperado ao criar produto:', e);
      toast.error('Erro ao criar produto');
      return null;
    }
  },

  // Atualizar um produto existente
  async updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...product,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Erro ao atualizar produto ${id}:`, error);
        toast.error(`Erro ao atualizar produto: ${error.message}`);
        return null;
      }

      toast.success('Produto atualizado com sucesso');
      return data;
    } catch (e) {
      console.error(`Erro inesperado ao atualizar produto ${id}:`, e);
      toast.error('Erro ao atualizar produto');
      return null;
    }
  },

  // Excluir um produto
  async deleteProduct(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Erro ao excluir produto ${id}:`, error);
        toast.error(`Erro ao excluir produto: ${error.message}`);
        return false;
      }

      toast.success('Produto excluído com sucesso');
      return true;
    } catch (e) {
      console.error(`Erro inesperado ao excluir produto ${id}:`, e);
      toast.error('Erro ao excluir produto');
      return false;
    }
  },

  // Filtrar produtos
  async searchProducts(query: string): Promise<Product[]> {
    try {
      if (!query || query.trim() === '') {
        return this.getAllProducts();
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,code.ilike.%${query}%,barcode.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        toast.error('Não foi possível realizar a busca');
        return [];
      }

      return data || [];
    } catch (e) {
      console.error('Erro inesperado ao buscar produtos:', e);
      toast.error('Erro ao realizar busca');
      return [];
    }
  }
};
