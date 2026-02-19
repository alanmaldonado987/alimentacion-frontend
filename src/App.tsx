import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

// Layouts
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Doctor Pages
import { DoctorDashboard } from '@/pages/doctor/DoctorDashboard';
import { PatientsPage } from '@/pages/doctor/PatientsPage';
import { PlansPage } from '@/pages/doctor/PlansPage';
import { PlanDetailPage } from '@/pages/doctor/PlanDetailPage';

// Patient Pages
import { PatientDashboard } from '@/pages/patient/PatientDashboard';
import { PatientPlansPage } from '@/pages/patient/PatientPlansPage';
import { PatientPlanDetailPage } from '@/pages/patient/PatientPlanDetailPage';

// Settings Page
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  const { setLoading } = useAuthStore();

  useEffect(() => {
    // Check if we have stored auth
    setLoading(false);
  }, [setLoading]);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor" element={<DashboardLayout />}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="plans/:id" element={<PlanDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Patient Routes */}
      <Route path="/patient" element={<DashboardLayout />}>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="plans" element={<PatientPlansPage />} />
        <Route path="plans/:id" element={<PatientPlanDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

