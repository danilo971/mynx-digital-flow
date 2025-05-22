
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore, initAuth } from "./store/useAuthStore";
import { initTenants } from "./store/useTenantStore";
import { useThemeStore } from "./store/useThemeStore";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import POSPage from "./pages/POSPage";
import SalesPage from "./pages/SalesPage";
import ProductsPage from "./pages/ProductsPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import TenantsPage from "./pages/TenantsPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import SignupPage from "./pages/SignupPage";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// System admin route component
const SystemAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, isSystemAdmin } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isSystemAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const { theme } = useThemeStore();
  
  // Inicializa a autenticação e os tenants
  useEffect(() => {
    initAuth().then(() => {
      // Initialize tenants after auth is initialized
      initTenants();
    });
  }, []);
  
  // Apply theme class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="pos" element={<POSPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="tenants" element={<TenantsPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
