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
   * Verificar disponibilidade de estoque para um produto
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
   * Validar estoque para todos os itens de uma venda
   */
  async validateSaleStock(items: SaleProduct[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    for (const item of items) {
      const stockAvailable = await this.checkStockAvailability(item.id, item.quantity);
      if (!stockAvailable) {
        errors.push(`Estoque insuficiente para ${item.name} (Código: ${item.code})`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Criar uma nova venda com validação de estoque
   */
  async createSale(saleData: NewSale): Promise<Sale | null> {
    try {
      console.log('Iniciando criação de venda:', saleData);
      
      // Validar estoque antes de criar a venda
      const stockValidation = await this.validateSaleStock(saleData.items);
      if (!stockValidation.valid) {
        const errorMessage = stockValidation.errors.join(', ');
        console.error('Validação de estoque falhou:', errorMessage);
        throw new Error(`Estoque insuficiente: ${errorMessage}`);
      }
      
      // Validate numeric fields to prevent NaN issues
      const total = Number(saleData.total) || 0;
      const itemCount = Number(saleData.itemCount) || 0;
      
      // Criar registro principal da venda
      const saleId = uuidv4();
      const { data: saleResult, error: saleError } = await supabase
        .from('sales')
        .insert([{
          id: saleId,
          total: total,
          item_count: itemCount,
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
      
      // Criar itens da venda com validação de números
      const saleItems = saleData.items.map(item => ({
        sale_id: saleId,
        product_id: item.id,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
        subtotal: Number(item.subtotal) || 0
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
