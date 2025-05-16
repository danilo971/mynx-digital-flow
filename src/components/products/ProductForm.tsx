
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Product, productService } from '@/services/productService';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const isEditing = !!product;
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Product>({
    defaultValues: product || {
      code: '',
      name: '',
      barcode: '',
      price: 0,
      stock: 0,
      category: '',
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: Product) => {
    try {
      setIsLoading(true);
      
      if (isEditing && product.id) {
        await productService.updateProduct(product.id, data);
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso.",
        });
      } else {
        await productService.createProduct(data);
        toast({
          title: "Produto adicionado",
          description: "O produto foi adicionado com sucesso.",
        });
      }
      
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Não foi possível ${isEditing ? 'atualizar' : 'adicionar'} o produto.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (value: string) => {
    setValue('category', value);
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        <DialogDescription>
          {isEditing 
            ? 'Atualize as informações do produto abaixo.'
            : 'Preencha as informações do novo produto.'
          }
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                {...register("code", { 
                  required: "Código é obrigatório" 
                })}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de barras</Label>
              <Input
                id="barcode"
                {...register("barcode", { 
                  required: "Código de barras é obrigatório" 
                })}
              />
              {errors.barcode && (
                <p className="text-xs text-destructive">{errors.barcode.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do produto</Label>
            <Input
              id="name"
              {...register("name", { 
                required: "Nome do produto é obrigatório" 
              })}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register("price", { 
                  required: "Preço é obrigatório",
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: "Preço deve ser maior ou igual a 0"
                  }
                })}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...register("stock", { 
                  required: "Estoque é obrigatório",
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: "Estoque deve ser maior ou igual a 0"
                  }
                })}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                onValueChange={handleCategorySelect}
                defaultValue={watch('category')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Categoria 1">Categoria 1</SelectItem>
                  <SelectItem value="Categoria 2">Categoria 2</SelectItem>
                  <SelectItem value="Categoria 3">Categoria 3</SelectItem>
                  <SelectItem value="Categoria 4">Categoria 4</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default ProductForm;
