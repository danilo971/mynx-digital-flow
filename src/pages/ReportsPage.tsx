
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { AreaChart, BarChart, PieChart } from '@/pages/DashboardPage';
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltipContent } from '@/pages/DashboardPage';

type ReportData = {
  name: string;
  total: number;
};

const ReportsPage = () => {
  const [reportType, setReportType] = useState('sales');
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
    to: new Date(),
  });
  const [salesData, setSalesData] = useState<ReportData[]>([]);
  const [productSalesData, setProductSalesData] = useState<ReportData[]>([]);
  const [categorySalesData, setCategorySalesData] = useState<ReportData[]>([]);

  useEffect(() => {
    // Mock data for demonstration
    const startDate = date?.from || new Date();
    const endDate = date?.to || new Date();
    const diffInDays = Math.abs(
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );

    const generateMockData = (prefix: string): ReportData[] => {
      const data: ReportData[] = [];
      for (let i = 1; i <= 5; i++) {
        data.push({
          name: `${prefix} ${i}`,
          total: Math.floor(Math.random() * 500) + 100,
        });
      }
      return data;
    };

    setSalesData(generateMockData('Venda'));
    setProductSalesData(generateMockData('Produto'));
    setCategorySalesData(generateMockData('Categoria'));
  }, [date]);

  const formattedDate = date?.from
    ? `${format(date.from, 'dd/MM/yyyy')} - ${
        date.to ? format(date.to, 'dd/MM/yyyy') : 'Hoje'
      }`
    : 'Selecione um período';

  // Define color configurations for charts
  const chartColors = ["#2563eb", "#f59e0b", "#4ade80", "#8b5cf6", "#ec4899"];

  // Create chart configs for each dataset
  const salesConfig = {
    ...salesData.reduce((acc, item, index) => ({
      ...acc,
      [item.name]: { color: chartColors[index % chartColors.length] }
    }), {})
  };

  const productConfig = {
    ...productSalesData.reduce((acc, item, index) => ({
      ...acc,
      [item.name]: { color: chartColors[index % chartColors.length] }
    }), {})
  };

  const categoryConfig = {
    ...categorySalesData.reduce((acc, item, index) => ({
      ...acc,
      [item.name]: { color: chartColors[index % chartColors.length] }
    }), {})
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">
            Análise de dados e desempenho do sistema
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Selecione o tipo de relatório e o período desejado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="reportType">Tipo de Relatório</Label>
                <Select
                  value={reportType}
                  onValueChange={setReportType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Vendas</SelectItem>
                    <SelectItem value="products">Produtos</SelectItem>
                    <SelectItem value="categories">Categorias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Período</Label>
                <div className="relative">
                  <Button
                    id="date"
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{formattedDate}</span>
                  </Button>
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    className="absolute z-50 rounded-md border bg-popover p-4 shadow-md outline-none focus:ring-2 focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral das Vendas</CardTitle>
            <CardDescription>
              Análise detalhada das vendas realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={salesConfig}
              className="h-[350px]"
            >
              <RechartsPrimitive.AreaChart data={salesData}>
                <defs>
                  {salesData.map((item, i) => (
                    <linearGradient
                      key={`gradient-${item.name}`}
                      id={`gradient-${item.name}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={chartColors[i % chartColors.length]}
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="100%"
                        stopColor={chartColors[i % chartColors.length]}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <RechartsPrimitive.XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsPrimitive.YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <RechartsPrimitive.Tooltip content={<ChartTooltipContent />} />
                <RechartsPrimitive.Area
                  type="monotone"
                  dataKey="total"
                  stackId="1"
                  stroke="#2563eb"
                  fill="url(#gradient-Venda 1)"
                />
              </RechartsPrimitive.AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Categoria</CardTitle>
              <CardDescription>
                Distribuição das vendas por categoria de produto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={categoryConfig}
                className="h-[350px]"
              >
                <RechartsPrimitive.PieChart>
                  <RechartsPrimitive.Pie
                    data={categorySalesData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="90%"
                    innerRadius="60%"
                    strokeWidth={0}
                  >
                    {categorySalesData.map((_, i) => (
                      <RechartsPrimitive.Cell
                        key={`cell-${i}`}
                        fill={chartColors[i % chartColors.length]}
                      />
                    ))}
                  </RechartsPrimitive.Pie>
                  <RechartsPrimitive.Tooltip content={<ChartTooltipContent />} />
                </RechartsPrimitive.PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Produtos Vendidos</CardTitle>
              <CardDescription>
                Lista dos produtos mais vendidos no período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={productConfig}
                className="h-[350px]"
              >
                <RechartsPrimitive.BarChart data={productSalesData}>
                  <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <RechartsPrimitive.XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <RechartsPrimitive.YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => `R$ ${value.toFixed(2)}`}
                  />
                  <RechartsPrimitive.Tooltip content={<ChartTooltipContent />} />
                  <RechartsPrimitive.Bar dataKey="total" fill="#2563eb" />
                </RechartsPrimitive.BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPage;
