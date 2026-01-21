import { useState } from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import {
  Utensils,
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  X,
  User,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { ConfirmDialog } from '@/components/ui';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const doctorNavItems: NavItem[] = [
  { to: '/doctor/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/doctor/patients', icon: <Users className="w-5 h-5" />, label: 'Pacientes' },
  { to: '/doctor/plans', icon: <ClipboardList className="w-5 h-5" />, label: 'Planes' },
];

const patientNavItems: NavItem[] = [
  { to: '/patient/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/patient/plans', icon: <ClipboardList className="w-5 h-5" />, label: 'Mis Planes' },
];

export const DashboardLayout = () => {
  const { user, isAuthenticated, isDoctor, logout } = useAuth();
  const { isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-mint-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is on correct dashboard
  const isOnDoctorRoutes = location.pathname.startsWith('/doctor');
  const isOnPatientRoutes = location.pathname.startsWith('/patient');

  if (isDoctor && isOnPatientRoutes) {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  if (!isDoctor && isOnDoctorRoutes) {
    return <Navigate to="/patient/dashboard" replace />;
  }

  const navItems = isDoctor ? doctorNavItems : patientNavItems;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 lg:transform-none flex-shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-mint-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900">NutriPlan</span>
            </div>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'sidebar-link',
                    isActive && 'sidebar-link-active'
                  )
                }
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-3">
              <div className="w-10 h-10 rounded-full bg-mint-500 flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between lg:justify-end flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>{isDoctor ? 'Doctor' : 'Paciente'}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium text-gray-900">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Logout confirmation dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={async () => {
          setIsLoggingOut(true);
          try {
            await logout();
          } finally {
            setIsLoggingOut(false);
            setShowLogoutDialog(false);
          }
        }}
        title="¿Cerrar sesión?"
        message="¿Estás seguro de que deseas cerrar tu sesión? Tendrás que iniciar sesión nuevamente para acceder a tu cuenta."
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isLoggingOut}
        icon="logout"
      />
    </div>
  );
};

