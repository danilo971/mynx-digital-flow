
-- Adicionar foreign key entre sale_items e products se não existir
ALTER TABLE public.sale_items 
ADD CONSTRAINT fk_sale_items_product 
FOREIGN KEY (product_id) REFERENCES public.products(id);

-- Função para atualizar estoque após venda
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar o estoque do produto subtraindo a quantidade vendida
    UPDATE public.products 
    SET stock = stock - NEW.quantity,
        updated_at = now()
    WHERE id = NEW.product_id;
    
    -- Verificar se o estoque ficou negativo (não deveria acontecer com validação)
    IF (SELECT stock FROM public.products WHERE id = NEW.product_id) < 0 THEN
        RAISE EXCEPTION 'Estoque insuficiente para o produto ID %', NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar estoque quando um item de venda for inserido
DROP TRIGGER IF EXISTS trigger_update_stock ON public.sale_items;
CREATE TRIGGER trigger_update_stock
    AFTER INSERT ON public.sale_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- Função para verificar estoque disponível
CREATE OR REPLACE FUNCTION check_stock_availability(product_id_param integer, quantity_param integer)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT stock >= quantity_param
    FROM public.products 
    WHERE id = product_id_param;
$$;

-- Habilitar realtime para a tabela products
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.products;
