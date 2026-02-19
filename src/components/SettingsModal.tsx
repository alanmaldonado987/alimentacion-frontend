import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authApi } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { Modal, Button, Input } from '@/components/ui';
import { Mail, Phone, Lock, User, Upload, X } from 'lucide-react';

const updateProfileSchema = z.object({
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.union([
    z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    z.literal(''),
  ]).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== '' && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        phone: user.phone || '',
        password: '',
        confirmPassword: '',
      });
      if (user.avatar) {
        if (user.avatar.startsWith('http')) {
          setAvatarPreview(user.avatar);
        } else if (user.avatar.startsWith('/uploads')) {
          const apiUrl = window.location.origin.includes('localhost') 
            ? 'http://localhost:3001' 
            : window.location.origin;
          setAvatarPreview(`${apiUrl}${user.avatar}`);
        } else {
          setAvatarPreview(user.avatar);
        }
      } else {
        setAvatarPreview(null);
      }
      setAvatarFile(null);
    }
  }, [user, reset]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = async () => {
    if (user?.avatar) {
      try {
        const updatedUser = await authApi.deleteAvatar();
        updateUser(updatedUser);
        toast.success('Avatar eliminado exitosamente');
      } catch (error: any) {
        toast.error(error?.response?.data?.error || 'Error al eliminar el avatar');
        return;
      }
    }
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: UpdateProfileForm) => {
    setIsSubmitting(true);
    try {
      let updatedUser = user;

      if (avatarFile) {
        updatedUser = await authApi.uploadAvatar(avatarFile);
      }

      const updateData: { email?: string; phone?: string; password?: string } = {};
      
      if (data.email !== user?.email) {
        updateData.email = data.email;
      }
      if (data.phone !== user?.phone) {
        updateData.phone = data.phone || undefined;
      }
      if (data.password && data.password.trim() !== '') {
        updateData.password = data.password;
      }

      if (Object.keys(updateData).length > 0) {
        updatedUser = await authApi.updateProfile(updateData);
      }

      if (!avatarFile && Object.keys(updateData).length === 0) {
        toast.error('No hay cambios para guardar');
        return;
      }

      updateUser(updatedUser);
      toast.success('Perfil actualizado exitosamente');
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar Cuenta" size="2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Header con información del usuario */}
        <div className="bg-gradient-to-br from-mint-500 via-mint-400 to-emerald-500 rounded-xl p-8 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-xl ring-4 ring-white/30">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name.charAt(0).toUpperCase()
                )}
              </div>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl font-bold mb-2">{user?.name}</h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 opacity-90" />
                  <p className="text-white/90">{user?.email}</p>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 opacity-90" />
                    <p className="text-white/90">{user?.phone}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-center sm:justify-start gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAvatarClick}
                  leftIcon={<Upload className="w-4 h-4" />}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Cambiar Foto de Perfil
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Layout de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda - Información Personal */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                  <p className="text-sm text-gray-600">Actualiza tus datos de contacto y perfil</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    {...register('email')}
                    type="email"
                    label="Correo Electrónico"
                    placeholder="tu@email.com"
                    error={errors.email?.message}
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">
                    Este correo se utilizará para notificaciones y recuperación de cuenta
                  </p>
                </div>

                <div>
                  <Input
                    {...register('phone')}
                    type="tel"
                    label="Teléfono"
                    placeholder="+1234567890"
                    error={errors.phone?.message}
                    leftIcon={<Phone className="w-4 h-4" />}
                  />
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">
                    Número de teléfono opcional para contacto directo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Seguridad */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Seguridad</h3>
                  <p className="text-sm text-gray-600">Protege tu cuenta con una contraseña segura</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    {...register('password')}
                    type="password"
                    label="Nueva Contraseña"
                    placeholder="Mínimo 8 caracteres"
                    error={errors.password?.message}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                  <div className="text-xs text-gray-500 mt-1.5 ml-1 space-y-0.5">
                    <p>La contraseña debe contener:</p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      <li>Mínimo 8 caracteres</li>
                      <li>Al menos una mayúscula</li>
                      <li>Al menos una minúscula</li>
                      <li>Al menos un número</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <Input
                    {...register('confirmPassword')}
                    type="password"
                    label="Confirmar Nueva Contraseña"
                    placeholder="Repite la contraseña"
                    error={errors.confirmPassword?.message}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">
                    Debe coincidir con la nueva contraseña ingresada
                  </p>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Consejos de Seguridad</h4>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>No compartas tu contraseña con nadie</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Usa una contraseña única para esta cuenta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Cambia tu contraseña periódicamente</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            Los cambios se aplicarán inmediatamente después de guardar
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1 sm:flex-none">
              Guardar Cambios
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

