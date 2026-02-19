import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Debe contener mayúscula, minúscula y número'
    ),
  phone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register: authRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await authRegister({ ...data, role: 'DOCTOR' });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crear cuenta
        </h1>
        <p className="text-gray-500">
          Regístrate para comenzar tu viaje saludable
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          {...register('name')}
          type="text"
          label="Nombre completo"
          placeholder="Juan Pérez"
          error={errors.name?.message}
          leftIcon={<User className="w-5 h-5" />}
        />

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

        <Input
          {...register('phone')}
          type="tel"
          label="Teléfono (opcional)"
          placeholder="+57 600 000 000"
          error={errors.phone?.message}
          leftIcon={<Phone className="w-5 h-5" />}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Crear Cuenta
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-mint-600 hover:text-mint-700 font-semibold">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

