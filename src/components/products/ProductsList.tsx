
import { Loader2, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useProducts';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductsListProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => Promise<void>;
}

export function ProductsList({ products, loading, onEdit, onDelete }: ProductsListProps) {
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const handleDeleteClick = (product: Product) => {
    setDeleteProduct(product);
  };
  
  const confirmDelete = async () => {
    if (!deleteProduct) return;
    
    try {
      setDeleting(true);
      await onDelete(deleteProduct.id);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto.",
      });
    } finally {
      setDeleting(false);
      setDeleteProduct(null);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Sem estoque
      </Badge>;
    } else if (stock <= 5) {
      return <Badge variant="secondary" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Estoque baixo
      </Badge>;
    } else {
      return <Badge variant="default">Em estoque</Badge>;
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center text-center">
        <p className="text-muted-foreground">Nenhum produto encontrado</p>
        <p className="text-sm text-muted-foreground">
          Clique em "Novo Produto" para adicionar um produto ao seu catálogo.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow 
                key={product.id}
                className={product.stock === 0 ? 'bg-destructive/5' : ''}
              >
                <TableCell className="font-medium">{product.code}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  {product.price.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </TableCell>
                <TableCell className="font-medium">
                  <span className={product.stock <= 5 ? 'text-amber-600' : product.stock === 0 ? 'text-destructive' : ''}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell>
                  {getStockBadge(product.stock)}
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto {deleteProduct?.name} será 
              permanentemente removido do seu catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
