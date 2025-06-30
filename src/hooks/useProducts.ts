
import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/services/productService';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Product = Database['public']['Tables']['products']['Row'];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get all sales units/categories
  const salesUnits = productService.getSalesUnits();
  
  // Fetch products on component mount
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getAllProducts();
      setProducts(data || []);  // Ensure we always have an array, even if data is null
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar produtos",
        description: "Não foi possível obter a lista de produtos.",
      });
      setProducts([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Set up real-time updates for products
  useEffect(() => {
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Produto atualizado em tempo real:', payload);
          
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [...prev, payload.new as Product]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts(prev => 
              prev.map(product => 
                product.id === payload.new.id ? payload.new as Product : product
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => 
              prev.filter(product => product.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Open modal to add new product
  const openAddModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };
  
  // Open modal to edit product
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };
  
  // Handle product submission (create or update)
  const handleSubmit = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    try {
      if (selectedProduct) {
        // Update existing product
        const updatedProduct = await productService.updateProduct(selectedProduct.id, productData);
        if (updatedProduct) {
          // Real-time update will handle the state change
          toast({
            title: "Produto atualizado",
            description: "O produto foi atualizado com sucesso.",
          });
          closeModal();
        }
      } else {
        // Create new product
        const newProduct = await productService.createProduct(productData);
        if (newProduct) {
          // Real-time update will handle the state change
          toast({
            title: "Produto adicionado",
            description: "O novo produto foi criado com sucesso.",
          });
          closeModal();
        }
      }
    } catch (error: any) {
      console.error('Error submitting product:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar produto",
        description: error?.message || "Não foi possível salvar o produto.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete product
  const handleDelete = async (id: number) => {
    try {
      const success = await productService.deleteProduct(id);
      if (success) {
        // Real-time update will handle the state change
        toast({
          title: "Produto excluído",
          description: "O produto foi excluído com sucesso.",
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto.",
      });
    }
  };
  
  return {
    products,
    loading,
    selectedProduct,
    isModalOpen,
    isSubmitting,
    salesUnits,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
    refreshProducts: fetchProducts
  };
}
