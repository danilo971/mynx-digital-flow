
-- Primeiro, vamos remover a constraint existente e recriar com ON DELETE CASCADE
ALTER TABLE public.sale_items 
DROP CONSTRAINT IF EXISTS fk_sale_items_product;

-- Recriar a constraint com ON DELETE CASCADE para permitir exclusão segura
ALTER TABLE public.sale_items 
ADD CONSTRAINT fk_sale_items_product 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Limpar todos os dados de teste das tabelas (preservando a estrutura)
-- Primeiro limpar sale_items (devido às dependências)
DELETE FROM public.sale_items;

-- Depois limpar sales 
DELETE FROM public.sales;

-- Por último limpar products
DELETE FROM public.products;

-- Reiniciar a sequência do ID dos produtos para começar do 1 novamente
ALTER SEQUENCE products_id_seq RESTART WITH 1;
