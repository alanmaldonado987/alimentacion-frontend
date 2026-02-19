import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { authApi, LoginData, RegisterData } from '@/api/auth';
import { AxiosError } from 'axios';

interface ApiError {
  error: string;
  details?: unknown;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const { login: storeLogin, logout: storeLogout, user, isAuthenticated, refreshToken, setUser } = useAuthStore();

  const updateUser = useCallback((updatedUser: typeof user) => {
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, [setUser]);

  const login = useCallback(async (data: LoginData) => {
    try {
      const response = await authApi.login(data);
      storeLogin(response.user, response.accessToken, response.refreshToken);
      toast.success(`¡Bienvenido, ${response.user.name}!`);
      
      // Redirect based on role
      if (response.user.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const message = axiosError.response?.data?.error || 'Error al iniciar sesión';
      toast.error(message);
      throw error;
    }
  }, [storeLogin, navigate]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      await authApi.register(data);
      toast.success('¡Cuenta creada exitosamente! Por favor, inicia sesión.');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const message = axiosError.response?.data?.error || 'Error al registrarse';
      toast.error(message);
      throw error;
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      storeLogout();
      toast.success('Sesión cerrada');
      navigate('/login');
    }
  }, [storeLogout, navigate, refreshToken]);

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    isDoctor: user?.role === 'DOCTOR',
    isPatient: user?.role === 'PATIENT',
  };
};

