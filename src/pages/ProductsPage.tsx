
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2, FileText, Package, ArrowUpDown, Filter, UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Product, productService } from '@/services/productService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    barcode: '',
    price: 0,
    stock: 0,
    category: 'Categoria 1',
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Carregar produtos usando React Query
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAllProducts,
  });
  
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos.",
      });
    }
  }, [error, toast]);
  
  // Filter products by search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.code.toLowerCase().includes(search.toLowerCase()) ||
    (product.barcode && product.barcode.includes(search))
  );
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    if (!sortField) return 0;
    
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (sortDirection === 'asc') {
      return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
    } else {
      return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
    }
  });
  
  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  // Toggle sort
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle product creation
  const handleAddProduct = async () => {
    try {
      console.log('Adicionando novo produto:', newProduct);
      
      if (!newProduct.name || !newProduct.code) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios.",
        });
        return;
      }
      
      setSubmitting(true);
      
      const result = await productService.createProduct({
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock)
      });
      
      if (result) {
        toast({
          title: "Produto adicionado",
          description: "O produto foi adicionado com sucesso.",
        });
        
        // Refresh product list
        queryClient.invalidateQueries({ queryKey: ['products'] });
        
        setShowAddProductDialog(false);
        setNewProduct({
          code: '',
          name: '',
          barcode: '',
          price: 0,
          stock: 0,
          category: 'Categoria 1',
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar produto",
        description: "Não foi possível criar o novo produto.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete product
  const handleDeleteProduct = useCallback(async (id: number) => {
    try {
      console.log(`Excluindo produto ${id}...`);
      
      if (window.confirm('Tem certeza que deseja excluir este produto?')) {
        const success = await productService.deleteProduct(id);
        
        if (success) {
          toast({
            title: "Produto excluído",
            description: "O produto foi excluído com sucesso.",
          });
          
          // Refresh product list
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto.",
      });
    }
  }, [toast, queryClient]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground">
            Gerencie seu catálogo de produtos
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row">
          <Button variant="outline">
            <UploadCloud className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button onClick={() => setShowAddProductDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Produtos</CardTitle>
            <CardDescription>
              {isLoading 
                ? "Carregando produtos..." 
                : `Total de ${filteredProducts.length} produtos encontrados`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, código ou código de barras"
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filtrar por:</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Todos os produtos
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Estoque baixo
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Sem estoque
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Categoria 1
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Categoria 2
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Categoria 3
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Products Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('code')}
                    >
                      <div className="flex items-center">
                        Código
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center">
                        Nome
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('category')}
                    >
                      <div className="flex items-center">
                        Categoria
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => toggleSort('price')}
                    >
                      <div className="flex items-center justify-end">
                        Preço
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => toggleSort('stock')}
                    >
                      <div className="flex items-center justify-end">
                        Estoque
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          Carregando produtos...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : sortedProducts.length > 0 ? (
                    sortedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.code}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                              <Package className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div>{product.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {product.barcode}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={
                              product.stock > 100 ? "default" :
                              product.stock > 50 ? "outline" : "destructive"
                            }
                          >
                            {product.stock} unid
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Abrir menu</span>
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 15 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                >
                                  <path
                                    d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => product.id && handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Product Dialog */}
      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha os dados para adicionar um novo produto ao catálogo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Código
              </Label>
              <Input
                id="code"
                value={newProduct.code}
                onChange={(e) => setNewProduct({...newProduct, code: e.target.value})}
                className="col-span-3"
                placeholder="P001"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="col-span-3"
                placeholder="Nome do produto"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right">
                Código de barras
              </Label>
              <Input
                id="barcode"
                value={newProduct.barcode}
                onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                className="col-span-3"
                placeholder="7891234567890"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Preço (R$)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                className="col-span-3"
                placeholder="99.90"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Estoque
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                className="col-span-3"
                placeholder="100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <select
                id="category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Categoria 1">Categoria 1</option>
                <option value="Categoria 2">Categoria 2</option>
                <option value="Categoria 3">Categoria 3</option>
                <option value="Categoria 4">Categoria 4</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddProductDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddProduct}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>Adicionar Produto</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
