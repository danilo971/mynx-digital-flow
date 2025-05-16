
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';

type FormData = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const { isAuthenticated, login } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: FormData) => {
    try {
      const success = await login(data.email, data.password);
      
      if (success) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
        navigate('/');
      } else {
        toast({
          variant: "destructive",
          title: "Falha no login",
          description: "E-mail ou senha incorretos.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro no login. Tente novamente.",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-xl bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm p-8 shadow-lg"
      >
        <div className="flex flex-col items-center space-y-2 text-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            className="rounded-full bg-primary p-2"
          >
            <LogIn className="h-6 w-6 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight">Myn Digital</h1>
          <p className="text-sm text-muted-foreground">
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              placeholder="seu@email.com"
              type="email"
              autoComplete="email"
              {...register("email", { 
                required: "E-mail é obrigatório",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "E-mail inválido"
                }
              })}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-primary hover:underline"
              >
                {showPassword ? (
                  <span className="flex items-center">
                    <EyeOff className="h-3 w-3 mr-1" /> Ocultar
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" /> Mostrar
                  </span>
                )}
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password", { 
                  required: "Senha é obrigatória",
                  minLength: {
                    value: 5,
                    message: "Senha deve ter pelo menos 5 caracteres"
                  }
                })}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <div className="text-sm text-right">
            <a href="#" className="text-primary hover:underline">
              Esqueceu a senha?
            </a>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Problemas para acessar? Entre em contato com o administrador.
          </p>
        </div>
      </motion.div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Use demo@example.com / password para testar
      </p>
    </div>
  );
};

export default LoginPage;
