import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Plus, Trash2, ShoppingCart, Printer, Save, Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductSearch } from '@/components/pos/ProductSearch';
import type { ProductSearchResult } from '@/services/productService';
import { saleService, type SaleProduct } from '@/services/saleService';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SaleForm = {
  quantity: number;
  observations: string;
  paymentMethod: string;
};

const POSPage = () => {
  const [cartItems, setCartItems] = useState<SaleProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
      paymentMethod: '',
    }
  });
  
  // Observar o valor do campo de quantidade para UI e validação
  const watchedQuantity = watch('quantity');
  
  // Obter o valor do paymentMethod para UI
  const paymentMethod = watch('paymentMethod');
  
  // Calculate sale total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  };
  
  // Handle product selection from search
  const handleProductSelect = (product: ProductSearchResult | null) => {
    setSelectedProduct(product);
    if (product) {
      // Focus on quantity input after selecting a product
      setTimeout(() => {
        if (quantityInputRef.current) {
          quantityInputRef.current.focus();
        }
      }, 0);
    }
  };
  
  // Add product to cart via the Add button
  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast({
        variant: "destructive",
        title: "Nenhum produto selecionado",
        description: "Por favor, selecione um produto antes de adicionar.",
      });
      return;
    }
    
    // Obter o valor diretamente do DOM para garantir precisão
    const inputValue = quantityInputRef.current ? quantityInputRef.current.value : '1';
    console.log('Valor direto do input DOM:', inputValue, typeof inputValue);
    
    // Conversão explícita com parseInt para garantir número inteiro
    const safeQuantity = parseInt(inputValue, 10) || 1;
    console.log('Quantidade final usada no carrinho:', safeQuantity, typeof safeQuantity);
    
    if (safeQuantity <= 0) {
      toast({
        variant: "destructive",
        title: "Quantidade inválida",
        description: "A quantidade deve ser maior que zero.",
      });
      return;
    }
    
    // Guaranteed safe price
    const price = Number(selectedProduct.price) || 0;
    // Calculate subtotal with the correct quantity
    const subtotal = safeQuantity * price;
    
    console.log('Preço:', price);
    console.log('Quantidade segura:', safeQuantity);
    console.log('Subtotal calculado:', subtotal);
    
    // Add product to cart with safe values
    const newItem: SaleProduct = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      code: selectedProduct.code,
      quantity: safeQuantity, // Usar o valor obtido diretamente do DOM
      price: price,
      subtotal: subtotal
    };
    
    console.log('Item adicionado ao carrinho:', newItem);
    
    setCartItems([...cartItems, newItem]);
    
    // Reset form and selection with explicit validation
    setValue('quantity', 1, { shouldValidate: true });
    setSelectedProduct(null);
    
    console.log('Valor após reset:', watch('quantity'));
    
    toast({
      title: "Produto adicionado",
      description: `${selectedProduct.name} adicionado ao carrinho.`,
    });
  };
  
  // Remove product from cart
  const removeProduct = (id: number, index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
    
    toast({
      title: "Produto removido",
      description: "Produto removido do carrinho.",
    });
  };
  
  // Submit sale
  const handleFinalizeSale = async (formData: SaleForm) => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrinho vazio",
        description: "Adicione produtos para finalizar a venda.",
      });
      return;
    }
    
    if (!formData.paymentMethod) {
      toast({
        variant: "destructive",
        title: "Forma de pagamento não selecionada",
        description: "Por favor, selecione uma forma de pagamento para finalizar a venda.",
      });
      return;
    }
    
    try {
      // Prepare sale data
      const saleData = {
        items: cartItems,
        total: calculateTotal(),
        itemCount: cartItems.reduce((total, item) => total + item.quantity, 0),
        observations: formData.observations,
        paymentMethod: formData.paymentMethod
      };
      
      // Send to API
      const result = await saleService.createSale(saleData);
      
      if (result) {
        toast({
          title: "Venda finalizada com sucesso!",
          description: `Total: ${formatCurrency(calculateTotal())}`,
        });
        
        // Reset cart and form
        setCartItems([]);
        reset();
        
        // Redirect to sales page
        navigate('/sales');
      } else {
        throw new Error("Não foi possível finalizar a venda");
      }
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast({
        variant: "destructive",
        title: "Erro ao finalizar venda",
        description: "Ocorreu um erro ao processar a venda.",
      });
    }
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
                    <ProductSearch 
                      onProductSelect={handleProductSelect} 
                      selectedProduct={selectedProduct}
                    />
                  </div>
                  
                  {/* Quantity */}
                  <div>
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      {...register("quantity", { 
                        min: { value: 1, message: "Mínimo 1" },
                        valueAsNumber: true
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
                      onClick={handleAddToCart}
                      className="w-full"
                      type="button"
                      disabled={!selectedProduct}
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
                        cartItems.map((item, index) => (
                          <TableRow key={`${item.id}-${index}`}>
                            <TableCell className="font-medium">{item.code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => removeProduct(item.id, index)}
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
                
                {/* Payment Method */}
                <div>
                  <Label htmlFor="paymentMethod" className="mb-1 block">Forma de Pagamento *</Label>
                  <Select 
                    value={paymentMethod} 
                    onValueChange={(value) => setValue("paymentMethod", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                    </SelectContent>
                  </Select>
                  {!paymentMethod && cartItems.length > 0 && (
                    <p className="mt-1 text-xs text-amber-500">
                      Selecione uma forma de pagamento para finalizar
                    </p>
                  )}
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
              
              {/* Payment Method */}
              {paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forma de pagamento:</span>
                  <span className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" />
                    {paymentMethod === 'pix' ? 'PIX' : 
                     paymentMethod === 'dinheiro' ? 'Dinheiro' : 'Cartão'}
                  </span>
                </div>
              )}
              
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
                disabled={cartItems.length === 0 || !paymentMethod}
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
                  setSelectedProduct(null);
                  toast({
                    title: "Venda cancelada",
                    description: "Todos os produtos foram removidos.",
                  });
                }}
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
