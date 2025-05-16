
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUp, ArrowDown, Package, ShoppingCart, Plus, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { AreaChart, BarChart } from '@/components/ui/chart';

const DashboardPage = () => {
  const { user } = useAuthStore();

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.name}! | {currentDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Hoje
          </Button>
          <Button variant="outline">
            Este Mês
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 15.456,00</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="mr-1 h-3 w-3" />+12.5%
                </span> desde o mês passado
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Estoque</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.245</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500 flex items-center">
                  <ArrowDown className="mr-1 h-3 w-3" />-3.2%
                </span> desde o mês passado
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Produtos Cadastrados</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">432</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="mr-1 h-3 w-3" />+8.1%
                </span> desde o mês passado
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Faturamento do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 45.870,00</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="mr-1 h-3 w-3" />+18.2%
                </span> desde o mês passado
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card className="card-hover bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>Acesse as principais funções</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <ShoppingCart className="h-5 w-5 mb-1" />
              Nova Venda
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Package className="h-5 w-5 mb-1" />
              Novo Produto
            </Button>
          </CardContent>
        </Card>

        {/* Charts */}
        <Card className="col-span-2 card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Vendas Semanais</CardTitle>
              <CardDescription>Análise das últimas 7 semanas</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={[
                { name: 'Sem 1', total: 4500 },
                { name: 'Sem 2', total: 6100 },
                { name: 'Sem 3', total: 5200 },
                { name: 'Sem 4', total: 7800 },
                { name: 'Sem 5', total: 8200 },
                { name: 'Sem 6', total: 7500 },
                { name: 'Sem 7', total: 9900 },
              ]}
              categories={['total']}
              index="name"
              colors={['#8B5CF6']}
              valueFormatter={(value) => `R$ ${value.toLocaleString()}`}
              className="aspect-[4/3]"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Products Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Top Products */}
        <Card className="lg:col-span-1 card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
              <CardDescription>Top 5 produtos do mês</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <BarChart
              data={[
                { name: 'Produto A', total: 87 },
                { name: 'Produto B', total: 75 },
                { name: 'Produto C', total: 56 },
                { name: 'Produto D', total: 43 },
                { name: 'Produto E', total: 38 },
              ]}
              categories={['total']}
              index="name"
              colors={['#8B5CF6']}
              valueFormatter={(value) => `${value} unid.`}
              className="aspect-[4/3]"
            />
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="lg:col-span-2 card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>Últimas 5 vendas realizadas</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center gap-4 rounded-md border p-3">
                  <div className="flex-1">
                    <div className="font-medium">Venda #{1000 + item}</div>
                    <div className="text-sm text-muted-foreground">Cliente: Cliente {item}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">R$ {(Math.random() * 1000).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
