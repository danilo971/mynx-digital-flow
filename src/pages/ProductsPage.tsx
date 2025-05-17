
import { Search, Plus, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { ProductsList } from '@/components/products/ProductsList'; // This component should be created separately
import { useProducts } from '@/hooks/useProducts';
import { useState } from 'react';

export default function ProductsPage() {
  const {
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
    refreshProducts
  } = useProducts();
  
  const [search, setSearch] = useState('');
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.code.toLowerCase().includes(search.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(search.toLowerCase())) ||
    product.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground">
            Gerencie seu catálogo de produtos
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            {loading ? 'Carregando produtos...' : `Total de ${filteredProducts.length} produtos cadastrados`}
          </CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos por nome, código ou categoria"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ProductsList 
            products={filteredProducts}
            loading={loading}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
      
      <ProductFormModal
        open={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        product={selectedProduct}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
