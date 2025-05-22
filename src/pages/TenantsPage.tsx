
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useTenantStore, Tenant } from '@/store/useTenantStore';
import { Loader2, Plus, Building, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const TenantsPage = () => {
  const { toast } = useToast();
  const { user, isSystemAdmin } = useAuthStore();
  const { tenants, fetchTenants, switchTenant, currentTenant } = useTenantStore();
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    supabase_url: '',
    supabase_anon_key: '',
    supabase_service_key: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadTenants = async () => {
      setLoading(true);
      await fetchTenants();
      setLoading(false);
    };

    loadTenants();
  }, [fetchTenants]);

  const handleAddTenant = async () => {
    if (!newTenant.name || !newTenant.supabase_url || !newTenant.supabase_anon_key) {
      toast({
        variant: "destructive", 
        title: "Campos obrigatórios", 
        description: "Nome, URL e chave anônima são obrigatórios."
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Insert into tenants table
      const { data, error } = await supabase
        .from('tenants')
        .insert({
          name: newTenant.name,
          supabase_url: newTenant.supabase_url,
          supabase_anon_key: newTenant.supabase_anon_key,
          supabase_service_key: newTenant.supabase_service_key || null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Associate the current user with the tenant as an owner
      const { error: userError } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: data.id,
          user_id: user?.id,
          role: 'owner'
        });

      if (userError) {
        throw userError;
      }

      toast({ title: "Tenant criado com sucesso" });
      setShowAddDialog(false);
      setNewTenant({
        name: '',
        supabase_url: '',
        supabase_anon_key: '',
        supabase_service_key: ''
      });
      
      // Refresh the tenant list
      fetchTenants();

    } catch (error: any) {
      console.error('Erro ao criar tenant:', error);
      toast({
        variant: "destructive", 
        title: "Erro ao criar tenant", 
        description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchTenant = async (tenant: Tenant) => {
    await switchTenant(tenant.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">
            Gerenciamento de tenants do sistema
          </p>
        </div>
        {isSystemAdmin && (
          <Button
            className="mt-4 sm:mt-0"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Tenant
          </Button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Tenants Disponíveis</CardTitle>
            <CardDescription>
              {loading ? 'Carregando tenants...' : `${tenants.length} tenants encontrados`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : tenants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tenants.map((tenant) => (
                  <Card 
                    key={tenant.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      currentTenant?.id === tenant.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleSwitchTenant(tenant)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-sm text-muted-foreground truncate" title={tenant.supabase_url}>
                            {tenant.supabase_url}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {tenant.status === 'active' ? 
                              <span className="text-green-500 flex items-center">
                                <Check className="h-3 w-3 mr-1" /> Ativo
                              </span> 
                            : tenant.status}
                          </div>
                        </div>
                        {currentTenant?.id === tenant.id && (
                          <div className="h-3 w-3 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum tenant encontrado. {isSystemAdmin && 'Clique em "Novo Tenant" para adicionar.'}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Tenant Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Tenant</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newTenant.name}
                onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                placeholder="Nome da empresa ou organização"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supabase_url">URL do Supabase</Label>
              <Input
                id="supabase_url"
                value={newTenant.supabase_url}
                onChange={(e) => setNewTenant({...newTenant, supabase_url: e.target.value})}
                placeholder="https://example.supabase.co"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="anon_key">Chave Anônima</Label>
              <Input
                id="anon_key"
                value={newTenant.supabase_anon_key}
                onChange={(e) => setNewTenant({...newTenant, supabase_anon_key: e.target.value})}
                placeholder="eyJhbGci..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service_key">Chave de Serviço (opcional)</Label>
              <Input
                id="service_key"
                type="password"
                value={newTenant.supabase_service_key}
                onChange={(e) => setNewTenant({...newTenant, supabase_service_key: e.target.value})}
                placeholder="eyJhbGci..."
              />
              <p className="text-xs text-muted-foreground">
                A chave de serviço permite operações administrativas e é armazenada com segurança.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTenant} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>Adicionar Tenant</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantsPage;
