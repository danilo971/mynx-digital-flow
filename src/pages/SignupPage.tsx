
import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import PaymentNotification from '@/components/ui/payment-notification';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const SignupPage = () => {
  const { isAuthenticated, signup } = useAuthStore();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPaymentNotification, setShowPaymentNotification] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: FormData) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast({
          variant: "destructive",
          title: "As senhas não coincidem",
          description: "Por favor, verifique se as senhas são iguais.",
        });
        return;
      }
      
      const success = await signup(data.email, data.password, data.name);
      
      if (success) {
        toast({
          title: "Cadastro bem-sucedido",
          description: "Sua conta foi criada com sucesso.",
        });
        navigate('/');
      } else {
        toast({
          variant: "destructive",
          title: "Falha no cadastro",
          description: "Não foi possível criar sua conta. Tente novamente.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro no cadastro. Tente novamente.",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Payment notification at the top */}
      {showPaymentNotification && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <PaymentNotification onClose={() => setShowPaymentNotification(false)} />
        </div>
      )}
      
      <div className={`flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 ${showPaymentNotification ? 'pt-20' : ''}`}>
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
            <UserPlus className="h-6 w-6 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight">Myn Digital</h1>
          <p className="text-sm text-muted-foreground">
            Crie sua conta para acessar o sistema
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              type="text"
              autoComplete="name"
              {...register("name", { 
                required: "Nome é obrigatório",
              })}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>
          
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
                autoComplete="new-password"
                {...register("password", { 
                  required: "Senha é obrigatória",
                  minLength: {
                    value: 6,
                    message: "Senha deve ter pelo menos 6 caracteres"
                  }
                })}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-xs text-primary hover:underline"
              >
                {showConfirmPassword ? (
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
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirmPassword", { 
                  required: "Confirmação de senha é obrigatória",
                  validate: value => 
                    value === watch('password') || "As senhas não coincidem"
                })}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Já possui uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
    </div>
  );
};

export default SignupPage;
