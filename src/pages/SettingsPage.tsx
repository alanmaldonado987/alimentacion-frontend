import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authApi } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { User, Mail, Phone, Save } from 'lucide-react';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

export const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateProfileForm) => {
    setIsSubmitting(true);
    try {
      const updatedUser = await authApi.updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
      });
      updateUser(updatedUser);
      toast.success('Perfil actualizado exitosamente');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Administra tu información personal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('name')}
              label="Nombre"
              placeholder="Tu nombre completo"
              error={errors.name?.message}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              {...register('email')}
              type="email"
              label="Email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              {...register('phone')}
              type="tel"
              label="Teléfono (opcional)"
              placeholder="+1234567890"
              error={errors.phone?.message}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={isSubmitting} icon={<Save className="w-4 h-4" />}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

