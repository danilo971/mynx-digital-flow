import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, BarChart, PieChart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { supabase } from '@/integrations/supabase/client';
import * as RechartsPrimitive from "recharts";

type DateRange = 'day' | 'week' | 'month' | 'year';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState<DateRange>('month');
  
  // Estados para armazenar dados reais
  const [salesData, setSalesData] = useState({
    day: [],
    week: [],
    month: [],
    year: []
  });
  
  const [totalSales, setTotalSales] = useState(0);
  const [averageTicket, setAverageTicket] = useState(0);
  const [totalProductsSold, setTotalProductsSold] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
  const [productCategoryData, setProductCategoryData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [stockAnalysisData, setStockAnalysisData] = useState({
    critical: [],
    low: []
  });
  
  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Função para obter datas de início e fim com base no período selecionado
  const getDateRange = (range: DateRange) => {
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return {
      start: startDate.toISOString(),
      end: now.toISOString()
    };
  };
  
  // Função para obter datas de início e fim do período anterior
  const getPreviousPeriodRange = (range: DateRange) => {
    const { start, end } = getDateRange(range);
    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = endDate.getTime() - startDate.getTime();
    
    const previousEndDate = new Date(startDate);
    const previousStartDate = new Date(previousEndDate.getTime() - duration);
    
    return {
      start: previousStartDate.toISOString(),
      end: previousEndDate.toISOString()
    };
  };
  
  // Função para calcular taxa de crescimento
  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };
  
  // Função para formatar dados de vendas para gráficos
  const formatSalesDataForChart = (data) => {
    if (!data || data.length === 0) return [];
    
    switch (dateRange) {
      case 'day':
        return data.map(item => ({
          name: item.name,
          total: item.total
        }));
      case 'week':
        return data.map(item => ({
          name: item.name,
          total: item.total
        }));
      case 'month':
        return data.map(item => ({
          name: item.name,
          total: item.total
        }));
      case 'year':
        return data.map(item => ({
          name: item.name,
          total: item.total
        }));
      default:
        return [];
    }
  };
  
  // Função para buscar dados de vendas
  const fetchSalesData = async () => {
    try {
      // Buscar dados para cada período
      await Promise.all([
        fetchPeriodSalesData('day'),
        fetchPeriodSalesData('week'),
        fetchPeriodSalesData('month'),
        fetchPeriodSalesData('year')
      ]);
      
      // Buscar dados para o período atual
      const { start, end } = getDateRange(dateRange);
      
      // Total de vendas em reais
      const { data: salesData } = await supabase
        .from('sales')
        .select('total')
        .gte('created_at', start)
        .lte('created_at', end);
      
      const totalSalesAmount = salesData?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;
      setTotalSales(totalSalesAmount);
      
      // Total de vendas (contagem)
      const { count: salesCount } = await supabase
        .from('sales')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', start)
        .lte('created_at', end);
      
      setTotalCustomers(salesCount || 0);
      
      // Ticket médio
      const avgTicket = salesCount > 0 ? totalSalesAmount / salesCount : 0;
      setAverageTicket(avgTicket);
      
      // Total de produtos vendidos
      const { data: saleItemsData } = await supabase
        .from('sale_items')
        .select('quantity')
        .gte('created_at', start)
        .lte('created_at', end);
      
      const totalItems = saleItemsData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      setTotalProductsSold(totalItems);
      
      // Taxa de crescimento (comparação com período anterior)
      const { start: prevStart, end: prevEnd } = getPreviousPeriodRange(dateRange);
      
      const { data: prevSalesData } = await supabase
        .from('sales')
        .select('total')
        .gte('created_at', prevStart)
        .lte('created_at', prevEnd);
      
      const prevTotalSales = prevSalesData?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;
      const growth = calculateGrowthRate(totalSalesAmount, prevTotalSales);
      setGrowthRate(growth);
      
      // Buscar dados de categorias de produtos
      await fetchProductCategoryData();
      
      // Buscar dados de produtos mais vendidos
      await fetchTopProductsData();
      
      // Buscar dados de análise de estoque
      await fetchStockAnalysisData();
      
    } catch (error) {
      console.error('Erro ao buscar dados de vendas:', error);
    }
  };
  
  // Função para buscar dados de vendas por período
  const fetchPeriodSalesData = async (period: DateRange) => {
    try {
      const { start, end } = getDateRange(period);
      let formattedData = [];
      
      switch (period) {
        case 'day': {
          // Agrupar vendas por hora do dia
          const { data } = await supabase
            .from('sales')
            .select('created_at, total')
            .gte('created_at', start)
            .lte('created_at', end);
          
          // Criar buckets de horas (00:00, 03:00, 06:00, etc.)
          const hourlyData = {};
          const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
          
          hours.forEach(hour => {
            hourlyData[hour] = 0;
          });
          
          data?.forEach(sale => {
            const saleDate = new Date(sale.created_at);
            const hour = saleDate.getHours();
            const bucket = Math.floor(hour / 3) * 3;
            const formattedHour = bucket.toString().padStart(2, '0') + ':00';
            
            hourlyData[formattedHour] += sale.total || 0;
          });
          
          formattedData = Object.entries(hourlyData).map(([name, total]) => ({ name, total }));
          break;
        }
        case 'week': {
          // Agrupar vendas por dia da semana
          const { data } = await supabase
            .from('sales')
            .select('created_at, total')
            .gte('created_at', start)
            .lte('created_at', end);
          
          const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
          const weekdayData = {};
          
          weekdayNames.forEach(day => {
            weekdayData[day] = 0;
          });
          
          data?.forEach(sale => {
            const saleDate = new Date(sale.created_at);
            const weekday = weekdayNames[saleDate.getDay()];
            weekdayData[weekday] += sale.total || 0;
          });
          
          formattedData = Object.entries(weekdayData).map(([name, total]) => ({ name, total }));
          break;
        }
        case 'month': {
          // Agrupar vendas por semana do mês
          const { data } = await supabase
            .from('sales')
            .select('created_at, total')
            .gte('created_at', start)
            .lte('created_at', end);
          
          const weekData = {
            'Semana 1': 0,
            'Semana 2': 0,
            'Semana 3': 0,
            'Semana 4': 0
          };
          
          data?.forEach(sale => {
            const saleDate = new Date(sale.created_at);
            const dayOfMonth = saleDate.getDate();
            
            if (dayOfMonth <= 7) {
              weekData['Semana 1'] += sale.total || 0;
            } else if (dayOfMonth <= 14) {
              weekData['Semana 2'] += sale.total || 0;
            } else if (dayOfMonth <= 21) {
              weekData['Semana 3'] += sale.total || 0;
            } else {
              weekData['Semana 4'] += sale.total || 0;
            }
          });
          
          formattedData = Object.entries(weekData).map(([name, total]) => ({ name, total }));
          break;
        }
        case 'year': {
          // Agrupar vendas por mês do ano
          const { data } = await supabase
            .from('sales')
            .select('created_at, total')
            .gte('created_at', start)
            .lte('created_at', end);
          
          const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          const monthData = {};
          
          monthNames.forEach(month => {
            monthData[month] = 0;
          });
          
          data?.forEach(sale => {
            const saleDate = new Date(sale.created_at);
            const month = monthNames[saleDate.getMonth()];
            monthData[month] += sale.total || 0;
          });
          
          formattedData = Object.entries(monthData).map(([name, total]) => ({ name, total }));
          break;
        }
      }
      
      setSalesData(prevState => ({
        ...prevState,
        [period]: formattedData
      }));
      
    } catch (error) {
      console.error(`Erro ao buscar dados de vendas para o período ${period}:`, error);
    }
  };
  
  // Função para buscar dados de categorias de produtos
  const fetchProductCategoryData = async () => {
    try {
      const { start, end } = getDateRange(dateRange);
      
      // Buscar produtos vendidos no período
      const { data: saleItems } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          product_id,
          products:product_id (
            category
          )
        `)
        .gte('created_at', start)
        .lte('created_at', end);
      
      // Agrupar por categoria
      const categoryData = {};
      
      saleItems?.forEach(item => {
        const category = item.products?.category || 'Sem categoria';
        
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        
        categoryData[category] += item.quantity || 0;
      });
      
      // Formatar para o gráfico de pizza
      const formattedData = Object.entries(categoryData).map(([name, value]) => ({
        name,
        value
      }));
      
      setProductCategoryData(formattedData);
      
    } catch (error) {
      console.error('Erro ao buscar dados de categorias de produtos:', error);
    }
  };
  
  // Função para buscar dados de produtos mais vendidos
  const fetchTopProductsData = async () => {
    try {
      const { start, end } = getDateRange(dateRange);
      
      // Buscar produtos vendidos no período
      const { data: saleItems } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          product_id,
          products:product_id (
            name
          )
        `)
        .gte('created_at', start)
        .lte('created_at', end);
      
      // Agrupar por produto
      const productData = {};
      
      saleItems?.forEach(item => {
        const productId = item.product_id;
        const productName = item.products?.name || `Produto ${productId}`;
        
        if (!productData[productId]) {
          productData[productId] = {
            name: productName,
            quantity: 0
          };
        }
        
        productData[productId].quantity += item.quantity || 0;
      });
      
      // Converter para array, ordenar e pegar os top 10
      const formattedData = Object.values(productData)
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 10);
      
      setTopProductsData(formattedData);
      
    } catch (error) {
      console.error('Erro ao buscar dados de produtos mais vendidos:', error);
    }
  };
  
  // Função para buscar dados de análise de estoque
  const fetchStockAnalysisData = async () => {
    try {
      // Buscar produtos com estoque crítico (< 10) ou baixo (< 20)
      const { data: products } = await supabase
        .from('products')
        .select('id, name, stock')
        .lt('stock', 20)
        .order('stock');
      
      const criticalStock = products?.filter(product => product.stock < 10) || [];
      const lowStock = products?.filter(product => product.stock >= 10 && product.stock < 20) || [];
      
      setStockAnalysisData({
        critical: criticalStock,
        low: lowStock
      });
      
    } catch (error) {
      console.error('Erro ao buscar dados de análise de estoque:', error);
    }
  };
  
  // Função para exportar relatório em PDF
  const exportToPDF = () => {
    try {
      // Aqui usaremos uma abordagem mais simples sem depender de bibliotecas externas
      // Vamos criar uma nova janela com o conteúdo formatado para impressão
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('Por favor, permita popups para exportar o PDF');
        return;
      }
      
      // Criar conteúdo HTML para impressão
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Vendas - ${dateRange}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .section { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Vendas</h1>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          
          <div class="section">
            <h2>Resumo Geral</h2>
            <table>
              <tr>
                <th>Métrica</th>
                <th>Valor</th>
              </tr>
              <tr>
                <td>Total de Vendas</td>
                <td>${formatCurrency(totalSales)}</td>
              </tr>
              <tr>
                <td>Ticket Médio</td>
                <td>${formatCurrency(averageTicket)}</td>
              </tr>
              <tr>
                <td>Total de Produtos Vendidos</td>
                <td>${totalProductsSold}</td>
              </tr>
              <tr>
                <td>Total de Clientes Atendidos</td>
                <td>${totalCustomers}</td>
              </tr>
              <tr>
                <td>Taxa de Crescimento</td>
                <td>${growthRate.toFixed(2)}%</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h2>Produtos Mais Vendidos</h2>
            <table>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
              </tr>
              ${topProductsData.map((product: any) => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.quantity}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <div class="section">
            <h2>Análise de Estoque</h2>
            <table>
              <tr>
                <th>Produto</th>
                <th>Estoque</th>
                <th>Status</th>
              </tr>
              ${stockAnalysisData.critical.map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.stock}</td>
                  <td style="color: red;">Crítico</td>
                </tr>
              `).join('')}
              ${stockAnalysisData.low.map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.stock}</td>
                  <td style="color: orange;">Baixo</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(content);
      printWindow.document.close();
      
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
  };
  
  // Função para exportar relatório em Excel
  const exportToExcel = () => {
    try {
      // Criar um CSV para download
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Cabeçalho
      csvContent += "Relatório de Vendas - " + new Date().toLocaleDateString('pt-BR') + "\r\n\r\n";
      
      // Resumo Geral
      csvContent += "Resumo Geral\r\n";
      csvContent += "Métrica,Valor\r\n";
      csvContent += `Total de Vendas,${totalSales}\r\n`;
      csvContent += `Ticket Médio,${averageTicket}\r\n`;
      csvContent += `Total de Produtos Vendidos,${totalProductsSold}\r\n`;
      csvContent += `Total de Clientes Atendidos,${totalCustomers}\r\n`;
      csvContent += `Taxa de Crescimento,${growthRate.toFixed(2)}%\r\n\r\n`;
      
      // Vendas por período
      csvContent += `Vendas por Período (${dateRange})\r\n`;
      csvContent += "Período,Total\r\n";
      salesData[dateRange].forEach((item: any) => {
        csvContent += `${item.name},${item.total}\r\n`;
      });
      csvContent += "\r\n";
      
      // Produtos mais vendidos
      csvContent += "Produtos Mais Vendidos\r\n";
      csvContent += "Produto,Quantidade\r\n";
      topProductsData.forEach((product: any) => {
        csvContent += `${product.name},${product.quantity}\r\n`;
      });
      csvContent += "\r\n";
      
      // Análise de estoque
      csvContent += "Análise de Estoque\r\n";
      csvContent += "Produto,Estoque,Status\r\n";
      stockAnalysisData.critical.forEach(product => {
        csvContent += `${product.name},${product.stock},Crítico\r\n`;
      });
      stockAnalysisData.low.forEach(product => {
        csvContent += `${product.name},${product.stock},Baixo\r\n`;
      });
      
      // Criar link para download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `relatorio-vendas-${dateRange}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      alert('Erro ao gerar Excel. Verifique o console para mais detalhes.');
    }
  };
  
  // Efeito para buscar dados quando o período muda
  useEffect(() => {
    fetchSalesData();
    
    // Configurar subscription para atualização em tempo real
    const salesSubscription = supabase
      .channel('sales-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'sales' 
      }, () => {
        fetchSalesData(); // Recarregar dados quando houver mudanças
      })
      .subscribe();
      
    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, () => {
        fetchSalesData(); // Recarregar dados quando houver mudanças
      })
      .subscribe();
      
    const saleItemsSubscription = supabase
      .channel('sale-items-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'sale_items' 
      }, () => {
        fetchSalesData(); // Recarregar dados quando houver mudanças
      })
      .subscribe();
    
    // Limpar subscriptions ao desmontar
    return () => {
      salesSubscription.unsubscribe();
      productsSubscription.unsubscribe();
      saleItemsSubscription.unsubscribe();
    };
  }, [dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">
            Análise de vendas e desempenho
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportToPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Vendas
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
                <p className="text-xs text-muted-foreground">
                  {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(2)}% comparado com {
                    dateRange === 'day' ? 'ontem' :
                    dateRange === 'week' ? 'semana anterior' :
                    dateRange === 'month' ? 'mês anterior' : 'ano anterior'
                  }
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ticket Médio
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(averageTicket)}</div>
                <p className="text-xs text-muted-foreground">
                  Por venda
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Produtos
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProductsSold}</div>
                <p className="text-xs text-muted-foreground">
                  Unidades vendidas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Período
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRange)}
                >
                  <option value="day">Dia</option>
                  <option value="week">Semana</option>
                  <option value="month">Mês</option>
                  <option value="year">Ano</option>
                </select>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Evolução das Vendas</CardTitle>
              <CardDescription>
                {dateRange === 'day' ? 'Vendas por hora do dia' :
                 dateRange === 'week' ? 'Vendas por dia da semana' :
                 dateRange === 'month' ? 'Vendas por semana do mês' : 'Vendas por mês do ano'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer
                className="aspect-[4/3]"
                config={{
                  total: { color: "#8b5cf6" }
                }}
              >
                <RechartsPrimitive.AreaChart 
                  data={formatSalesDataForChart(salesData[dateRange]) || []}
                >
                  <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <RechartsPrimitive.XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsPrimitive.YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <RechartsPrimitive.Tooltip />
                  <RechartsPrimitive.Area
                    type="monotone"
                    dataKey="total"
                    stackId={1}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                  />
                </RechartsPrimitive.AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Vendas por Categoria</CardTitle>
                <CardDescription>
                  Distribuição de vendas por categoria de produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="aspect-[4/3]"
                  config={{
                    category: { color: "#8b5cf6" }
                  }}
                >
                  <RechartsPrimitive.PieChart>
                    <RechartsPrimitive.Pie
                      data={productCategoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="90%"
                      innerRadius="60%"
                      strokeWidth={0}
                      fill="#8b5cf6"
                    >
                      {productCategoryData && productCategoryData.map ? productCategoryData.map((entry, index) => (
                        <RechartsPrimitive.Cell 
                          key={`cell-${index}`} 
                          fill={['#8b5cf6', '#4f46e5', '#2563eb', '#3b82f6', '#60a5fa'][index % 5]} 
                        />
                      )) : null}
                    </RechartsPrimitive.Pie>
                    <RechartsPrimitive.Tooltip formatter={(value) => [`${value}`, 'Quantidade']} />
                    <RechartsPrimitive.Legend />
                  </RechartsPrimitive.PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
                <CardDescription>
                  Top 10 produtos com maior volume de vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="aspect-[4/3]"
                  config={{
                    quantity: { color: "#8b5cf6" }
                  }}
                >
                  <RechartsPrimitive.BarChart
                    data={topProductsData}
                    layout="vertical"
                    margin={{ left: 120 }}
                  >
                    <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <RechartsPrimitive.XAxis type="number" />
                    <RechartsPrimitive.YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100} 
                      tick={{ fontSize: 12 }}
                    />
                    <RechartsPrimitive.Tooltip />
                    <RechartsPrimitive.Bar dataKey="quantity" fill="#8b5cf6" />
                  </RechartsPrimitive.BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Análise de Estoque</CardTitle>
              <CardDescription>
                Produtos com estoque crítico ou baixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-red-500 mb-2">Estoque Crítico (Abaixo de 10)</h4>
                  {stockAnalysisData.critical.length > 0 ? (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left">Produto</th>
                            <th className="p-2 text-right">Estoque</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockAnalysisData.critical.map((product) => (
                            <tr key={product.id} className="border-b">
                              <td className="p-2">{product.name}</td>
                              <td className="p-2 text-right font-medium text-red-500">{product.stock}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum produto com estoque crítico.</p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-amber-500 mb-2">Estoque Baixo (Entre 10 e 20)</h4>
                  {stockAnalysisData.low.length > 0 ? (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left">Produto</th>
                            <th className="p-2 text-right">Estoque</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockAnalysisData.low.map((product) => (
                            <tr key={product.id} className="border-b">
                              <td className="p-2">{product.name}</td>
                              <td className="p-2 text-right font-medium text-amber-500">{product.stock}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum produto com estoque baixo.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Resumo Geral</CardTitle>
              <CardDescription>
                Visão geral do desempenho de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Métrica</th>
                      <th className="p-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Total de Vendas (Mês)</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(totalSales)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Ticket Médio</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(averageTicket)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Total de Produtos Vendidos</td>
                      <td className="p-2 text-right font-medium">{totalProductsSold}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Total de Clientes Atendidos</td>
                      <td className="p-2 text-right font-medium">{totalCustomers}</td>
                    </tr>
                    <tr>
                      <td className="p-2">Taxa de Crescimento</td>
                      <td className={`p-2 text-right font-medium ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(2)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Relatórios Disponíveis</CardTitle>
              <CardDescription>
                Lista de relatórios que podem ser exportados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <BarChart className="h-6 w-6" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Relatório de Vendas por Período
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Análise detalhada de vendas por dia, semana, mês ou ano
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <PieChart className="h-6 w-6" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Análise de Estoque
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Relatório de produtos com estoque crítico ou baixo
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <BarChart className="h-6 w-6" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Top Produtos Vendidos
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ranking dos produtos mais vendidos no período
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <Calendar className="h-6 w-6" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Histórico de Vendas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Registro completo de todas as vendas realizadas
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <FileText className="h-6 w-6" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Relatório Financeiro
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Resumo financeiro com receitas, ticket médio e crescimento
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;