
import { supabase, handleApiError } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';
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
  paymentMethod: string;
};

export const saleService = {
  /**
   * Criar uma nova venda
   */
  async createSale(saleData: NewSale): Promise<Sale | null> {
    try {
      console.log('Iniciando criação de venda:', saleData);
      
      // Garantir que total é um número válido
      const total = Number(saleData.total);
      if (isNaN(total)) {
        throw new Error('O valor total da venda é inválido');
      }

      // Verificar se há itens na venda
      if (!saleData.items || saleData.items.length === 0) {
        throw new Error('A venda deve conter pelo menos um item');
      }

      // Verificar se o método de pagamento foi selecionado
      if (!saleData.paymentMethod) {
        throw new Error('A forma de pagamento deve ser selecionada');
      }
      
      // Criar registro principal da venda
      const saleId = uuidv4();
      const { data: saleResult, error: saleError } = await supabase
        .from('sales')
        .insert([{
          id: saleId,
          total: total,
          item_count: saleData.itemCount,
          observations: saleData.observations || null,
          customer: saleData.customer || null,
          payment_method: saleData.paymentMethod
        }])
        .select()
        .single();
      
      if (saleError) {
        console.error('Erro ao criar venda:', saleError);
        throw saleError;
      }
      
      console.log('Venda criada com sucesso:', saleResult);
      
      // Criar itens da venda
      const saleItems = saleData.items.map(item => {
        // Garantir que os valores numéricos são tratados como números
        const quantity = Number(item.quantity);
        const price = Number(item.price);
        const subtotal = quantity * price;
        
        if (isNaN(quantity) || isNaN(price) || isNaN(subtotal)) {
          throw new Error(`Valores inválidos para o produto ${item.name}`);
        }
        
        return {
          sale_id: saleId,
          product_id: item.id,
          quantity: quantity,
          price: price,
          subtotal: subtotal
        };
      });
      
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
