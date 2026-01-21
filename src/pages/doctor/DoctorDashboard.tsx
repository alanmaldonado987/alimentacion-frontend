import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { plansApi } from '@/api/plans';
import { patientsApi } from '@/api/patients';
import { Card, StatCardSkeleton, Badge } from '@/components/ui';
import { DoctorStats, Patient, MealPlan } from '@/types';
import {
  Users,
  ClipboardList,
  CheckCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recentPlans, setRecentPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, patientsData, plansData] = await Promise.all([
          plansApi.getDoctorStats(),
          patientsApi.getAll(),
          plansApi.getAll(),
        ]);
        setStats(statsData);
        setPatients(patientsData.slice(0, 5));
        setRecentPlans(plansData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Pacientes',
      value: stats?.patientsCount || 0,
      icon: Users,
      color: 'bg-mint-500',
      link: '/doctor/patients',
    },
    {
      label: 'Planes Totales',
      value: stats?.plansCount || 0,
      icon: ClipboardList,
      color: 'bg-sky-500',
      link: '/doctor/plans',
    },
    {
      label: 'Planes Activos',
      value: stats?.activePlansCount || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      link: '/doctor/plans',
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Aquí tienes un resumen de tu actividad
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/doctor/patients"
            className="btn-secondary"
          >
            <Plus className="w-5 h-5" />
            Nuevo Paciente
          </Link>
          <Link
            to="/doctor/plans"
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            Nuevo Plan
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading
          ? Array(3)
              .fill(0)
              .map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat) => (
              <Link key={stat.label} to={stat.link}>
                <Card variant="interactive" className="flex items-center gap-4">
                  <div
                    className={`stat-icon ${stat.color} text-white shadow-lg`}
                  >
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Patients */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Pacientes Recientes
            </h2>
            <Link
              to="/doctor/patients"
              className="text-mint-600 hover:text-mint-700 font-medium text-sm flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="skeleton w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <div className="skeleton h-4 w-32 mb-2" />
                      <div className="skeleton h-3 w-24" />
                    </div>
                  </div>
                ))}
            </div>
          ) : patients.length > 0 ? (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold text-lg">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {patient.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {patient.email}
                    </p>
                  </div>
                  <Badge variant={patient.plansCount ? 'success' : 'warning'}>
                    {patient.plansCount || 0} planes
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No tienes pacientes aún</p>
            </div>
          )}
        </Card>

        {/* Recent Plans */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Planes Recientes
            </h2>
            <Link
              to="/doctor/plans"
              className="text-mint-600 hover:text-mint-700 font-medium text-sm flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-xl">
                    <div className="skeleton h-4 w-48 mb-2" />
                    <div className="skeleton h-3 w-32 mb-3" />
                    <div className="skeleton h-6 w-20 rounded-full" />
                  </div>
                ))}
            </div>
          ) : recentPlans.length > 0 ? (
            <div className="space-y-4">
              {recentPlans.map((plan) => (
                <Link
                  key={plan.id}
                  to={`/doctor/plans/${plan.id}`}
                  className="block p-4 border border-gray-100 rounded-xl hover:border-mint-200 hover:bg-mint-50/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {plan.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Para: {plan.patient.name}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(plan.startDate), 'dd MMM', { locale: es })} -{' '}
                        {format(new Date(plan.endDate), 'dd MMM yyyy', { locale: es })}
                      </div>
                    </div>
                    <Badge variant={plan.isActive ? 'success' : 'default'}>
                      {plan.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay planes creados</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick tip */}
      <Card className="bg-mint-500 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Consejo del día</h3>
            <p className="text-white/80">
              Recuerda revisar los planes de tus pacientes regularmente y ajustarlos según su progreso.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

