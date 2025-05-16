
import { supabase } from '@/lib/supabase';

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
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Não foi possível carregar os produtos');
    }

    return data || [];
  },

  // Obter um produto pelo ID
  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erro ao buscar produto ${id}:`, error);
      throw new Error('Não foi possível carregar o produto');
    }

    return data;
  },

  // Adicionar um novo produto
  async createProduct(product: Product): Promise<Product> {
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
      throw new Error('Não foi possível criar o produto');
    }

    return data;
  },

  // Atualizar um produto existente
  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
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
      throw new Error('Não foi possível atualizar o produto');
    }

    return data;
  },

  // Excluir um produto
  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erro ao excluir produto ${id}:`, error);
      throw new Error('Não foi possível excluir o produto');
    }
  },

  // Filtrar produtos
  async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,barcode.ilike.%${query}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Não foi possível realizar a busca');
    }

    return data || [];
  }
};
