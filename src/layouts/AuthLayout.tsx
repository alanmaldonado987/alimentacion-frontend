import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Utensils } from 'lucide-react';

export const AuthLayout = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    if (user.role === 'DOCTOR') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    return <Navigate to="/patient/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-mint-500 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Utensils className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold">NutriPlan</span>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Tu camino hacia una<br />
            <span className="text-white/90">alimentación saludable</span>
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Conectamos doctores y pacientes para crear planes alimenticios 
            personalizados y alcanzar objetivos de salud.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white/50" />
              <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white/50" />
              <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white/50" />
            </div>
            <p className="text-white/80 text-sm">
              +500 profesionales confían en NutriPlan
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

