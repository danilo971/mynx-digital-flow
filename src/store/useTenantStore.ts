
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getTenantSupabaseClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export type Tenant = {
  id: string;
  name: string;
  supabase_url: string;
  supabase_anon_key: string;
  status: 'active' | 'inactive' | 'pending';
};

type TenantState = {
  currentTenant: Tenant | null;
  tenantClient: SupabaseClient<Database> | null;
  tenants: Tenant[];
  isLoading: boolean;
  fetchTenants: () => Promise<Tenant[]>;
  setCurrentTenant: (tenant: Tenant | null) => void;
  switchTenant: (tenantId: string) => Promise<boolean>;
};

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      currentTenant: null,
      tenantClient: null,
      tenants: [],
      isLoading: false,
      
      fetchTenants: async () => {
        try {
          set({ isLoading: true });
          
          // Get the current user
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            set({ tenants: [], isLoading: false });
            return [];
          }
          
          // Get the user's associated tenants
          const { data: tenantUsers, error: tuError } = await supabase
            .from('tenant_users')
            .select('tenant_id')
            .eq('user_id', user.id);
          
          if (tuError) {
            console.error('Error fetching tenant associations:', tuError);
            set({ isLoading: false });
            return [];
          }
          
          if (!tenantUsers || tenantUsers.length === 0) {
            set({ tenants: [], isLoading: false });
            return [];
          }
          
          // Get the tenant details
          const tenantIds = tenantUsers.map(tu => tu.tenant_id);
          const { data: tenants, error } = await supabase
            .from('tenants')
            .select('*')
            .in('id', tenantIds);
          
          if (error) {
            console.error('Error fetching tenants:', error);
            set({ isLoading: false });
            return [];
          }
          
          set({ 
            tenants: tenants as Tenant[],
            isLoading: false 
          });
          
          return tenants as Tenant[];
        } catch (error: any) {
          console.error('Unexpected error fetching tenants:', error);
          set({ isLoading: false });
          return [];
        }
      },
      
      setCurrentTenant: (tenant) => {
        if (tenant) {
          const tenantClient = getTenantSupabaseClient(
            tenant.supabase_url,
            tenant.supabase_anon_key
          );
          set({ 
            currentTenant: tenant,
            tenantClient
          });
        } else {
          set({ 
            currentTenant: null,
            tenantClient: null
          });
        }
      },
      
      switchTenant: async (tenantId) => {
        try {
          set({ isLoading: true });
          
          // Get the tenant details
          const { data: tenant, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .single();
          
          if (error) {
            console.error('Error fetching tenant:', error);
            toast.error(`Erro ao trocar de tenant: ${error.message}`);
            set({ isLoading: false });
            return false;
          }
          
          if (!tenant) {
            toast.error('Tenant não encontrado');
            set({ isLoading: false });
            return false;
          }
          
          // Create the tenant-specific client
          const tenantClient = getTenantSupabaseClient(
            tenant.supabase_url,
            tenant.supabase_anon_key
          );
          
          set({ 
            currentTenant: tenant as Tenant,
            tenantClient,
            isLoading: false
          });
          
          toast.success(`Conectado ao tenant: ${tenant.name}`);
          return true;
        } catch (error: any) {
          console.error('Unexpected error switching tenant:', error);
          toast.error(`Erro ao trocar de tenant: ${error?.message || 'Erro desconhecido'}`);
          set({ isLoading: false });
          return false;
        }
      }
    }),
    {
      name: 'tenant-storage',
    }
  )
);

// Initialize tenants on application load
export const initTenants = async () => {
  console.log('Initializing tenants...');
  const { fetchTenants } = useTenantStore.getState();
  const tenants = await fetchTenants();
  
  // If there's only one tenant, set it as current
  if (tenants.length === 1) {
    const { setCurrentTenant } = useTenantStore.getState();
    setCurrentTenant(tenants[0]);
  }
};
