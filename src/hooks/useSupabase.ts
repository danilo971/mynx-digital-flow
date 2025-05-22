
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantStore } from '@/store/useTenantStore';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export function useSupabase() {
  const { currentTenant, tenantClient } = useTenantStore();
  const [client, setClient] = useState<SupabaseClient<Database>>(supabase);
  
  // Use the tenant-specific client if available, otherwise use the main client
  useEffect(() => {
    if (tenantClient) {
      setClient(tenantClient);
    } else {
      setClient(supabase);
    }
  }, [tenantClient]);

  return {
    supabase: client,
    isTenantConnection: !!tenantClient,
    currentTenant,
  };
}
