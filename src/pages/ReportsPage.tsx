
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, BarChart, PieChart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, BarChart as RechartBarChart, PieChart as RechartPieChart } from '@/components/ui/chart';

type DateRange = 'day' | 'week' | 'month' | 'year';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState<DateRange>('month');
  
  const salesData = {
    day: [
      { name: '00:00', total: 400 },
      { name: '03:00', total: 300 },
      { name: '06:00', total: 200 },
      { name: '09:00', total: 600 },
      { name: '12:00', total: 1400 },
      { name: '15:00', total: 1800 },
      { name: '18:00', total: 2000 },
      { name: '21:00', total: 1000 },
    ],
    week: [
      { name: 'Seg', total: 4500 },
      { name: 'Ter', total: 6100 },
      { name: 'Qua', total: 5200 },
      { name: 'Qui', total: 7800 },
      { name: 'Sex', total: 8200 },
      { name: 'Sab', total: 7500 },
      { name: 'Dom', total: 9900 },
    ],
    month: [
      { name: 'Semana 1', total: 18500 },
      { name: 'Semana 2', total: 22100 },
      { name: 'Semana 3', total: 19200 },
      { name: 'Semana 4', total: 24800 },
    ],
    year: [
      { name: 'Jan', total: 45000 },
      { name: 'Fev', total: 48000 },
      { name: 'Mar', total: 52000 },
      { name: 'Abr', total: 49000 },
      { name: 'Mai', total: 58000 },
      { name: 'Jun', total: 62000 },
      { name: 'Jul', total: 67000 },
      { name: 'Ago', total: 70000 },
      { name: 'Set', total: 65000 },
      { name: 'Out', total: 72000 },
      { name: 'Nov', total: 78000 },
      { name: 'Dez', total: 81000 },
    ],
  };
  
  const productCategoryData = [
    { name: 'Categoria 1', value: 40 },
    { name: 'Categoria 2', value: 30 },
    { name: 'Categoria 3', value: 20 },
    { name: 'Categoria 4', value: 10 },
  ];
  
  const topProductsData = [
    { name: 'Produto A', total: 87 },
    { name: 'Produto B', total: 75 },
    { name: 'Produto C', total: 56 },
    { name: 'Produto D', total: 43 },
    { name: 'Produto E', total: 38 },
  ];
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">
            Análise e exportação de dados
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>
      
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <div className="inline-flex items-center rounded-md border p-1">
          <Button
            variant={dateRange === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDateRange('day')}
          >
            Dia
          </Button>
          <Button
            variant={dateRange === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDateRange('week')}
          >
            Semana
          </Button>
          <Button
            variant={dateRange === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDateRange('month')}
          >
            Mês
          </Button>
          <Button
            variant={dateRange === 'year' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDateRange('year')}
          >
            Ano
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Vendas</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Produtos</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Resumo</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <motion.div
            key={`sales-${dateRange}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {/* KPI Cards */}
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Evolução de Vendas</CardTitle>
                  <CardDescription>
                    {dateRange === 'day' && 'Vendas das últimas 24 horas'}
                    {dateRange === 'week' && 'Vendas da última semana'}
                    {dateRange === 'month' && 'Vendas do último mês'}
                    {dateRange === 'year' && 'Vendas do último ano'}
                  </CardDescription>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={salesData[dateRange]}
                  categories={['total']}
                  index="name"
                  colors={['#8B5CF6']}
                  valueFormatter={(value) => `R$ ${value.toLocaleString()}`}
                  className="aspect-[3/1]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total de Vendas</CardTitle>
                <CardDescription>
                  {dateRange === 'day' && 'Hoje'}
                  {dateRange === 'week' && 'Esta semana'}
                  {dateRange === 'month' && 'Este mês'}
                  {dateRange === 'year' && 'Este ano'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(salesData[dateRange].reduce((acc, cur) => acc + cur.total, 0))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +18% em relação ao período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ticket Médio</CardTitle>
                <CardDescription>
                  {dateRange === 'day' && 'Hoje'}
                  {dateRange === 'week' && 'Esta semana'}
                  {dateRange === 'month' && 'Este mês'}
                  {dateRange === 'year' && 'Este ano'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(salesData[dateRange].reduce((acc, cur) => acc + cur.total, 0) / (35 + Math.floor(Math.random() * 20)))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +5.2% em relação ao período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total de Vendas</CardTitle>
                <CardDescription>
                  {dateRange === 'day' && 'Hoje'}
                  {dateRange === 'week' && 'Esta semana'}
                  {dateRange === 'month' && 'Este mês'}
                  {dateRange === 'year' && 'Este ano'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {35 + Math.floor(Math.random() * 20)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +12.5% em relação ao período anterior
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Categoria</CardTitle>
                <CardDescription>
                  Distribuição de vendas por categoria de produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RechartPieChart
                  data={productCategoryData}
                  index="name"
                  category="value"
                  valueFormatter={(value) => `${value}%`}
                  colors={['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']}
                  className="aspect-square"
                />
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  {productCategoryData.map((category, index) => (
                    <div key={category.name} className="flex items-center">
                      <div
                        className="h-3 w-3 rounded-full mr-2"
                        style={{
                          backgroundColor: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'][index],
                        }}
                      />
                      <div className="text-sm">
                        {category.name}: {category.value}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
                <CardDescription>
                  Top 5 produtos mais vendidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RechartBarChart
                  data={topProductsData}
                  categories={['total']}
                  index="name"
                  colors={['#8B5CF6']}
                  valueFormatter={(value) => `${value} unid.`}
                  className="aspect-[4/3]"
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Análise de Estoque</CardTitle>
                <CardDescription>
                  Produtos com estoque baixo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">Código</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Produto</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Categoria</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Estoque</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4 align-middle font-medium">E005</td>
                        <td className="p-4 align-middle">Produto E</td>
                        <td className="p-4 align-middle">Categoria 2</td>
                        <td className="p-4 align-middle text-right">30</td>
                        <td className="p-4 align-middle text-right">
                          <span className="inline-flex h-6 items-center rounded-md bg-red-100 px-2 text-xs font-medium text-red-800">
                            Crítico
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 align-middle font-medium">C003</td>
                        <td className="p-4 align-middle">Produto C</td>
                        <td className="p-4 align-middle">Categoria 1</td>
                        <td className="p-4 align-middle text-right">50</td>
                        <td className="p-4 align-middle text-right">
                          <span className="inline-flex h-6 items-center rounded-md bg-yellow-100 px-2 text-xs font-medium text-yellow-800">
                            Baixo
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Resumo Geral</CardTitle>
                <CardDescription>
                  Visão geral dos principais indicadores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total de Vendas (Mês)</span>
                  <span className="font-medium">{formatCurrency(84600)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Ticket Médio</span>
                  <span className="font-medium">{formatCurrency(153.82)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total de Produtos Vendidos</span>
                  <span className="font-medium">550 unidades</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total de Clientes Atendidos</span>
                  <span className="font-medium">128</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de Crescimento</span>
                  <span className="font-medium text-green-600">+18.5%</span>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Resumo
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
                <CardDescription>
                  Relatórios que podem ser gerados e exportados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Relatório de Vendas por Período
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Análise de Estoque
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Top Produtos Vendidos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Histórico de Vendas
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Relatório Financeiro
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
