
import { supabase, handleApiError } from '@/lib/supabase';
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
      console.log('Buscando todos os produtos...');
      
      // Verifica se a tabela "products" existe
      const { data: tablesData, error: tablesError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      // Se houver erro de tabela não existente, retorna array vazio e mostra toast
      if (tablesError && tablesError.code === '42P01') {
        console.error('Tabela products não existe:', tablesError);
        toast.error('Tabela de produtos não encontrada. Por favor, crie a tabela products no Supabase.');
        
        // Retornar dados mockados para demonstração se a tabela não existir
        console.log('Retornando dados mockados para demonstração...');
        return [
          { 
            id: 1, 
            code: "P001", 
            name: "Produto Demo 1", 
            barcode: "7891234567890", 
            price: 99.90, 
            stock: 120, 
            category: "Categoria 1" 
          },
          { 
            id: 2, 
            code: "P002", 
            name: "Produto Demo 2", 
            barcode: "7891234567891", 
            price: 149.90, 
            stock: 45, 
            category: "Categoria 2" 
          },
          { 
            id: 3, 
            code: "P003", 
            name: "Produto Demo 3", 
            barcode: "7891234567892", 
            price: 199.90, 
            stock: 30, 
            category: "Categoria 1" 
          }
        ];
      }

      // Continua normalmente se a tabela existir
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
      console.log(`Buscando produto ${id}...`);
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
      console.log('Criando produto:', product);
      
      // Verificando se todos os campos obrigatórios estão presentes
      if (!product.code || !product.name || !product.price) {
        toast.error('Preencha todos os campos obrigatórios');
        return null;
      }

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
        // Se houver erro de tabela não existente, mostra toast específico
        if (error.code === '42P01') {
          console.error('Tabela products não existe:', error);
          toast.error('Tabela de produtos não encontrada. Por favor, crie a tabela products no Supabase.');
          alert('Tabela de produtos não encontrada. Por favor, crie a tabela products no Supabase.');
          return null;
        }
        
        console.error('Erro ao criar produto:', error);
        toast.error(`Erro ao criar produto: ${error.message}`);
        alert(`Erro ao criar produto: ${error.message}`);
        return null;
      }

      toast.success('Produto cadastrado com sucesso');
      alert('Produto cadastrado com sucesso');
      return data;
    } catch (e: any) {
      console.error('Erro inesperado ao criar produto:', e);
      toast.error(`Erro ao criar produto: ${e?.message || 'Erro desconhecido'}`);
      alert(`Erro ao criar produto: ${e?.message || 'Erro desconhecido'}`);
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
