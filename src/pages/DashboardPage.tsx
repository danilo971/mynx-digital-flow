import { motion } from 'framer-motion';
import { ArrowRight, ArrowUp, ArrowDown, Package, ShoppingCart, Plus, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { AreaChart, BarChart } from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DashboardPage = () => {
  const { user } = useAuthStore();
  
  // Estados para armazenar os valores reais
  const [totalVendas, setTotalVendas] = useState(0);
  const [estoque, setEstoque] = useState(0);
  const [produtosCadastrados, setProdutosCadastrados] = useState(0);
  const [faturamentoMes, setFaturamentoMes] = useState(0);
  const [vendasSemanais, setVendasSemanais] = useState([]);
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);
  const [vendasRecentes, setVendasRecentes] = useState([]);
  
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Função para calcular o início do mês atual
  const getInicioMesAtual = () => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
  };

  // Função para obter as datas das últimas 7 semanas
  const getUltimas7Semanas = () => {
    const datas = [];
    const hoje = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(hoje.getDate() - (i * 7));
      datas.push(data.toISOString());
    }
    
    return datas;
  };

  // Função para formatar valor monetário
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Função para calcular a variação percentual
  const calcularVariacao = (atual, anterior) => {
    if (anterior === 0) return 100;
    return ((atual - anterior) / anterior) * 100;
  };

  // Buscar dados do Supabase
  useEffect(() => {
    const fetchDados = async () => {
      try {
        // 1. Total de vendas (contagem de registros na tabela sales)
        const { count: countVendas } = await supabase
          .from('sales')
          .select('*', { count: 'exact', head: true });
        
        setTotalVendas(countVendas || 0);
        
        // 2. Estoque total (soma do estoque de todos os produtos)
        const { data: dadosEstoque } = await supabase
          .from('products')
          .select('stock');
        
        const totalEstoque = dadosEstoque?.reduce((acc, item) => acc + item.stock, 0) || 0;
        setEstoque(totalEstoque);
        
        // 3. Produtos cadastrados (contagem de registros na tabela products)
        const { count: countProdutos } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        setProdutosCadastrados(countProdutos || 0);
        
        // 4. Faturamento do mês (soma do total das vendas do mês atual)
        const inicioMes = getInicioMesAtual();
        const { data: vendasMes } = await supabase
          .from('sales')
          .select('total')
          .gte('created_at', inicioMes);
        
        const totalMes = vendasMes?.reduce((acc, item) => acc + item.total, 0) || 0;
        setFaturamentoMes(totalMes);
        
        // 5. Vendas semanais (últimas 7 semanas)
        const datas = getUltimas7Semanas();
        const dadosVendasSemanais = [];
        
        for (let i = 0; i < datas.length - 1; i++) {
          const { data: vendasSemana } = await supabase
            .from('sales')
            .select('total')
            .gte('created_at', datas[i])
            .lt('created_at', datas[i + 1]);
          
          const totalSemana = vendasSemana?.reduce((acc, item) => acc + item.total, 0) || 0;
          
          // Formatar data para exibição (semana X)
          const dataInicio = new Date(datas[i]);
          const semana = `Sem ${i+1}`;
          
          dadosVendasSemanais.push({
            name: semana,
            total: totalSemana
          });
        }
        
        setVendasSemanais(dadosVendasSemanais);
        
        // 6. Produtos mais vendidos (top 5 do mês)
        const { data: itensMes } = await supabase
          .from('sale_items')
          .select(`
            quantity,
            product_id,
            products:product_id (
              name,
              price
            )
          `)
          .gte('created_at', inicioMes);
        
        // Agrupar por produto e somar quantidades
        const produtosAgrupados = {};
        
        itensMes?.forEach(item => {
          if (!produtosAgrupados[item.product_id]) {
            produtosAgrupados[item.product_id] = {
              id: item.product_id,
              nome: item.products?.name || 'Produto não encontrado',
              quantidade: 0,
              valor: item.products?.price || 0
            };
          }
          
          produtosAgrupados[item.product_id].quantidade += item.quantity;
        });
        
        // Converter para array, ordenar e pegar os top 5
        const produtosArray = Object.values(produtosAgrupados)
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5);
        
        setProdutosMaisVendidos(produtosArray);
        
        // 7. Vendas recentes (últimas 5 vendas)
        const { data: ultimasVendas } = await supabase
          .from('sales')
          .select(`
            id,
            date,
            total,
            customer,
            payment_method
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        setVendasRecentes(ultimasVendas || []);
        
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };
    
    fetchDados();
    
    // Configurar subscription para atualização em tempo real
    const salesSubscription = supabase
      .channel('sales-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'sales' 
      }, () => {
        fetchDados(); // Recarregar dados quando houver mudanças
      })
      .subscribe();
      
    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, () => {
        fetchDados(); // Recarregar dados quando houver mudanças
      })
      .subscribe();
      
    const saleItemsSubscription = supabase
      .channel('sale-items-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'sale_items' 
      }, () => {
        fetchDados(); // Recarregar dados quando houver mudanças
      })
      .subscribe();
    
    // Limpar subscriptions ao desmontar
    return () => {
      salesSubscription.unsubscribe();
      productsSubscription.unsubscribe();
      saleItemsSubscription.unsubscribe();
    };
  }, []);

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
              <div className="text-2xl font-bold">{totalVendas}</div>
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
              <div className="text-2xl font-bold">{estoque}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500 flex items-center">
                  <ArrowDown className="mr-1 h-3 w-3" />-2.5%
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
              <div className="text-2xl font-bold">{produtosCadastrados}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="mr-1 h-3 w-3" />+7.2%
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
              <div className="text-2xl font-bold">{formatarMoeda(faturamentoMes)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="mr-1 h-3 w-3" />+18.1%
                </span> desde o mês passado
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Vendas Semanais</CardTitle>
            <CardDescription>Análise das últimas 7 semanas</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={vendasSemanais}
              index="name"
              categories={['total']}
              colors={['blue']}
              valueFormatter={(value) => formatarMoeda(value)}
              className="aspect-[4/3]"
            />
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Top 5 produtos do mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {produtosMaisVendidos.map((produto, index) => (
                <div key={produto.id} className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 
                    index === 2 ? 'bg-yellow-500' : 
                    index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1 flex justify-between items-center">
                    <span className="font-medium truncate max-w-[180px]">{produto.nome}</span>
                    <span className="text-muted-foreground">{produto.quantidade} un.</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas Recentes</CardTitle>
          <CardDescription>Últimas 5 vendas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vendasRecentes.map((venda) => (
              <div key={venda.id} className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {venda.customer || 'Cliente não identificado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(venda.date).toLocaleDateString('pt-BR')} • {venda.payment_method || 'Método não especificado'}
                  </p>
                </div>
                <div className="font-medium">{formatarMoeda(venda.total)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
