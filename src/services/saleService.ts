
import { supabase, handleApiError } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { v4 as uuidv4 } from 'uuid';

export type Sale = Database['public']['Tables']['sales']['Row'];
export type SaleItem = Database['public']['Tables']['sale_items']['Row'];

export type SaleProduct = {
  id: number;
  name: string;
  code: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type NewSale = {
  items: SaleProduct[];
  total: number;
  itemCount: number;
  observations?: string;
  customer?: string;
};

export const saleService = {
  /**
   * Criar uma nova venda
   */
  async createSale(saleData: NewSale): Promise<Sale | null> {
    try {
      console.log('Iniciando criação de venda:', saleData);
      
      // Criar registro principal da venda
      const saleId = uuidv4();
      const { data: saleResult, error: saleError } = await supabase
        .from('sales')
        .insert([{
          id: saleId,
          total: saleData.total,
          item_count: saleData.itemCount,
          observations: saleData.observations || null,
          customer: saleData.customer || null
        }])
        .select()
        .single();
      
      if (saleError) {
        console.error('Erro ao criar venda:', saleError);
        throw saleError;
      }
      
      console.log('Venda criada com sucesso:', saleResult);
      
      // Criar itens da venda
      const saleItems = saleData.items.map(item => ({
        sale_id: saleId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      }));
      
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);
      
      if (itemsError) {
        console.error('Erro ao criar itens da venda:', itemsError);
        throw itemsError;
      }
      
      console.log('Itens da venda criados com sucesso');
      
      return saleResult;
    } catch (error) {
      console.error('Erro ao processar venda:', error);
      handleApiError(error, 'Erro ao finalizar venda');
      return null;
    }
  },
  
  /**
   * Obter todas as vendas
   */
  async getAllSales(): Promise<Sale[]> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        handleApiError(error, 'Erro ao buscar vendas');
        return [];
      }
      
      return data || [];
    } catch (error) {
      handleApiError(error, 'Erro ao buscar vendas');
      return [];
    }
  },
  
  /**
   * Obter uma venda específica com seus itens
   */
  async getSaleById(id: string): Promise<{ sale: Sale, items: SaleItem[] } | null> {
    try {
      // Buscar a venda
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', id)
        .single();
      
      if (saleError) {
        handleApiError(saleError, 'Erro ao buscar venda');
        return null;
      }
      
      // Buscar os itens da venda
      const { data: items, error: itemsError } = await supabase
        .from('sale_items')
        .select('*, products(name, code)')
        .eq('sale_id', id);
      
      if (itemsError) {
        handleApiError(itemsError, 'Erro ao buscar itens da venda');
        return { sale, items: [] };
      }
      
      return { sale, items: items || [] };
    } catch (error) {
      handleApiError(error, 'Erro ao buscar detalhes da venda');
      return null;
    }
  }
};
