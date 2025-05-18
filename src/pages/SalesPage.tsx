
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Download, Filter, ShoppingBag, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { saleService, type Sale } from '@/services/saleService';
import { useToast } from '@/hooks/use-toast';

const SalesPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  // Fetch sales on component mount
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const data = await saleService.getAllSales();
        setSales(data);
      } catch (error) {
        console.error('Erro ao carregar vendas:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar vendas",
          description: "Não foi possível buscar as vendas. Tente novamente mais tarde.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSales();
  }, [toast]);
  
  // Format as currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Filter sales based on search term
  const filteredSales = sales.filter(sale => 
    // Filtrar por data, valor ou ID
    formatDate(sale.date).toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.total.toString().includes(searchTerm) ||
    sale.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
          <p className="text-muted-foreground">
            Acompanhe e gerencie o histórico de vendas
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Nova Venda
          </Button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar vendas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
        <Button variant="outline" className="w-full sm:w-auto">
          <Calendar className="mr-2 h-4 w-4" />
          Período
        </Button>
      </div>
      
      {/* Sales Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Vendas</CardDescription>
            <CardTitle className="text-2xl">
              {filteredSales.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Valor Total</CardDescription>
            <CardTitle className="text-2xl text-primary">
              {formatCurrency(filteredSales.reduce((acc, sale) => acc + Number(sale.total), 0))}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Itens Vendidos</CardDescription>
            <CardTitle className="text-2xl">
              {filteredSales.reduce((acc, sale) => acc + sale.item_count, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      {/* Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Histórico de Vendas
            </CardTitle>
            <CardDescription>
              {filteredSales.length} vendas encontradas
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Carregando vendas...</p>
              </div>
            </div>
          ) : filteredSales.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <motion.tr
                      key={sale.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="border-b"
                    >
                      <TableCell className="font-mono text-xs">{sale.id.split('-')[0]}...</TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell>{sale.item_count}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(Number(sale.total))}</TableCell>
                      <TableCell>
                        <span className="inline-flex h-6 items-center rounded-full bg-green-100 px-2.5 text-xs font-medium text-green-800 dark:bg-green-700/20 dark:text-green-300">
                          {sale.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Detalhes
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Nenhuma venda encontrada</p>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar seus filtros ou criar uma nova venda.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPage;
