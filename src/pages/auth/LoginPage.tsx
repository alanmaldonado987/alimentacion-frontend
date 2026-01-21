import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data);
    } catch {
      // Error handled in useAuth
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido de nuevo
        </h1>
        <p className="text-gray-500">
          Ingresa tus credenciales para acceder
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          {...register('email')}
          type="email"
          label="Email"
          placeholder="example@email.com"
          error={errors.email?.message}
          leftIcon={<Mail className="w-5 h-5" />}
        />

        <Input
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          label="Contraseña"
          placeholder="••••••••"
          error={errors.password?.message}
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          }
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-mint-600 hover:text-mint-700 font-semibold">
            Regístrate
          </Link>
        </p>
      </div>

      {/* Demo credentials */}
      <div className="mt-8 p-4 bg-mint-50 rounded-xl">
        <p className="text-sm font-medium text-mint-800 mb-2">
          Credenciales de prueba:
        </p>
        <div className="text-sm text-mint-700 space-y-1">
          <p><strong>Doctor:</strong> doctor@nutriplan.com</p>
          <p><strong>Paciente:</strong> carlos@email.com</p>
          <p><strong>Contraseña:</strong> Password123</p>
        </div>
      </div>
    </div>
  );
};

