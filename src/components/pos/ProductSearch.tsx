
import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { productService, type ProductSearchResult } from '@/services/productService';

interface ProductSearchProps {
  onProductSelect: (product: ProductSearchResult | null) => void;
  selectedProduct: ProductSearchResult | null;
}

export function ProductSearch({ onProductSelect, selectedProduct }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format as currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Update search term when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(selectedProduct.name);
    } else {
      setSearchTerm('');
    }
  }, [selectedProduct]);

  // Debounce search
  useEffect(() => {
    const searchProducts = async () => {
      const term = searchTerm || '';
      if (term.trim().length > 0) {
        setIsLoading(true);
        setHasSearched(true);
        try {
          console.log('Iniciando busca por:', term);
          const results = await productService.searchProducts(term);
          console.log('Resultados recebidos:', results);
          setSearchResults(results);
          setIsSearching(results.length > 0);
        } catch (error) {
          console.error('Erro na busca de produtos:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    };

    // Criar debounce para não disparar a busca a cada tecla
    const timeoutId = setTimeout(() => {
      searchProducts();
    }, 300);  // 300ms de debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <Label htmlFor="productSearch">Produto</Label>
      <Input
        id="productSearch"
        placeholder="Nome, código ou código de barras"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          // If currently selected product and user types, clear the selection
          if (selectedProduct) {
            onProductSelect(null);
          }
        }}
        ref={inputRef}
        autoComplete="off"
        onClick={() => {
          if (searchResults.length > 0) {
            setIsSearching(true);
          }
        }}
      />
      
      {/* Search Results */}
      {isSearching && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-card shadow-lg">
          <div className="max-h-60 overflow-y-auto p-2">
            {searchResults.length > 0 ? (
              searchResults.map(product => (
                <div
                  key={product.id}
                  className="cursor-pointer rounded-md p-2 hover:bg-accent"
                  onClick={() => {
                    onProductSelect(product);
                    setIsSearching(false);
                  }}
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="flex justify-between text-sm">
                    <span>{product.code}</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(Number(product.price))}
                    </span>
                  </div>
                </div>
              ))
            ) : hasSearched && !isLoading ? (
              <div className="p-2 text-center text-muted-foreground">
                Nenhum produto encontrado
              </div>
            ) : null}
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-card p-2 shadow-lg">
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <p className="text-sm text-muted-foreground">Buscando produtos...</p>
          </div>
        </div>
      )}
    </div>
  );
}
