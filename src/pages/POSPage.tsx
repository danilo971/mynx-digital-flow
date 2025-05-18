
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Plus, Trash2, ShoppingCart, Printer, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductSearch } from '@/components/pos/ProductSearch';
import type { ProductSearchResult } from '@/services/productService';

type SaleProduct = {
  id: number;
  name: string;
  code: string;
  quantity: number;
  price: number;
  subtotal: number;
};

type SaleForm = {
  quantity: number;
  observations: string;
};

const POSPage = () => {
  const [cartItems, setCartItems] = useState<SaleProduct[]>([]);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    reset, 
    formState: { errors } 
  } = useForm<SaleForm>({
    defaultValues: {
      quantity: 1,
      observations: '',
    }
  });
  
  const quantity = watch('quantity');
  
  // Calculate sale total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  };
  
  // Add product to cart
  const addProductToCart = (product: ProductSearchResult) => {
    console.log("Adicionando produto ao carrinho:", product);
    
    if (quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Quantidade inválida",
        description: "A quantidade deve ser maior que zero.",
      });
      return;
    }
    
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // Update quantity if product already in cart
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { 
              ...item, 
              quantity: item.quantity + quantity, 
              subtotal: (item.quantity + quantity) * item.price 
            } 
          : item
      ));
    } else {
      // Add new product to cart
      setCartItems([
        ...cartItems, 
        { 
          id: product.id,
          name: product.name,
          code: product.code,
          quantity: quantity,
          price: product.price,
          subtotal: quantity * product.price
        }
      ]);
    }
    
    // Reset form and focus on product search
    setValue('quantity', 1);
    
    toast({
      title: "Produto adicionado",
      description: `${product.name} adicionado ao carrinho.`,
    });
  };
  
  // Remove product from cart
  const removeProduct = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    
    toast({
      title: "Produto removido",
      description: "Produto removido do carrinho.",
    });
  };
  
  // Update product quantity
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price } 
        : item
    ));
  };
  
  // Submit sale
  const handleFinalizeSale = (formData: SaleForm) => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrinho vazio",
        description: "Adicione produtos para finalizar a venda.",
      });
      return;
    }
    
    // Here you would typically send the sale data to your backend
    console.log('Sale finalized:', {
      items: cartItems,
      total: calculateTotal(),
      observations: formData.observations,
      date: new Date()
    });
    
    toast({
      title: "Venda finalizada com sucesso!",
      description: `Total: R$ ${calculateTotal().toFixed(2)}`,
    });
    
    // Reset cart and form
    setCartItems([]);
    reset();
  };
  
  // Format as currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ponto de Venda</h2>
          <p className="text-muted-foreground">Myn Digital | {currentDate}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Nova Venda
              </CardTitle>
              <CardDescription>Adicione produtos à venda atual</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-4">
                  {/* Product Search Component */}
                  <div className="sm:col-span-2">
                    <ProductSearch onProductSelect={addProductToCart} />
                  </div>
                  
                  {/* Quantity */}
                  <div>
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      {...register("quantity", { 
                        min: { value: 1, message: "Mínimo 1" } 
                      })}
                      ref={quantityInputRef}
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-xs text-destructive">{errors.quantity.message}</p>
                    )}
                  </div>
                  
                  {/* Add Button */}
                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        toast({
                          title: "Selecione um produto",
                          description: "Por favor, busque e selecione um produto da lista.",
                        });
                      }}
                      className="w-full"
                      type="button"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                </div>
                
                {/* Cart Items */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Código</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtde</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.length > 0 ? (
                        cartItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <span>-</span>
                                </Button>
                                <span className="w-10 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <span>+</span>
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => removeProduct(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Nenhum produto adicionado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Observations */}
                <div>
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    placeholder="Adicione observações sobre a venda"
                    {...register("observations")}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sale Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Venda</CardTitle>
              <CardDescription>
                {cartItems.length} {cartItems.length === 1 ? 'produto' : 'produtos'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Total Items */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantidade:</span>
                <span>
                  {cartItems.reduce((total, item) => total + item.quantity, 0)} itens
                </span>
              </div>
              
              {/* Total */}
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Vendedor: Admin User<br />
                  Data: {currentDate}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                className="w-full"
                onClick={handleSubmit(handleFinalizeSale)}
                disabled={cartItems.length === 0}
              >
                <Check className="mr-2 h-4 w-4" />
                Finalizar Venda
              </Button>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
                <Button variant="outline" className="w-full">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                className="w-full text-destructive hover:bg-destructive/10" 
                onClick={() => {
                  setCartItems([]);
                  reset();
                  toast({
                    title: "Venda cancelada",
                    description: "Todos os produtos foram removidos.",
                  });
                }}
                disabled={cartItems.length === 0}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar Venda
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default POSPage;
