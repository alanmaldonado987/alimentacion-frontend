import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { plansApi } from '@/api/plans';
import { MealPlan } from '@/types';
import { Card, Badge, EmptyState, CardSkeleton } from '@/components/ui';
import {
  ClipboardList,
  Calendar,
  User,
  ArrowRight,
  Eye,
  CheckCircle,
  Clock,
} from 'lucide-react';

export const PatientPlansPage = () => {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await plansApi.getAll();
        setPlans(data);
      } catch (error) {
        toast.error('Error al cargar los planes');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const activePlans = plans.filter((p) => p.isActive);
  const inactivePlans = plans.filter((p) => !p.isActive);

  const getPlanProgress = (plan: MealPlan) => {
    if (!plan.startDate || !plan.endDate) return 0;
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const today = new Date();
    const totalDays = differenceInDays(end, start) + 1;
    const daysPassed = Math.max(0, Math.min(differenceInDays(today, start) + 1, totalDays));
    return Math.round((daysPassed / totalDays) * 100);
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <CardSkeleton key={i} />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Planes</h1>
        <p className="text-gray-500 mt-1">
          Todos los planes alimenticios asignados por tu doctor
        </p>
      </div>

      {plans.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ClipboardList className="w-10 h-10" />}
            title="Sin planes asignados"
            description="Tu doctor aún no te ha asignado ningún plan alimenticio"
          />
        </Card>
      ) : (
        <>
          {/* Active Plans */}
          {activePlans.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Planes Activos
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activePlans.map((plan) => {
                  const progress = getPlanProgress(plan);
                  const isCurrentlyActive = plan.startDate && plan.endDate &&
                    new Date(plan.startDate) <= new Date() &&
                    new Date(plan.endDate) >= new Date();

                  return (
                    <Card
                      key={plan.id}
                      className="border-2 border-mint-200 bg-mint-50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {plan.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            <span>Dr. {plan.doctor.name}</span>
                          </div>
                        </div>
                        <Badge variant={isCurrentlyActive ? 'success' : 'info'}>
                          {isCurrentlyActive ? 'En curso' : 'Programado'}
                        </Badge>
                      </div>

                      {plan.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {plan.description}
                        </p>
                      )}

                      {plan.startDate && plan.endDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(plan.startDate), 'dd MMM', { locale: es })} -{' '}
                            {format(new Date(plan.endDate), 'dd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                      )}

                      {/* Progress bar */}
                      {isCurrentlyActive && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">Progreso</span>
                            <span className="font-medium text-mint-600">{progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-mint-500 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-mint-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{plan.dailyMeals.length} días</span>
                          <span>{plan.recommendations.length} recomendaciones</span>
                        </div>
                        <Link
                          to={`/patient/plans/${plan.id}`}
                          className="inline-flex items-center gap-1 text-mint-600 hover:text-mint-700 font-medium"
                        >
                          Ver plan
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inactive Plans */}
          {inactivePlans.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Planes Anteriores
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inactivePlans.map((plan) => (
                  <Card key={plan.id} className="opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {plan.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="w-4 h-4" />
                          <span>Dr. {plan.doctor.name}</span>
                        </div>
                      </div>
                      <Badge variant="default">Completado</Badge>
                    </div>

                    {plan.startDate && plan.endDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(plan.startDate), 'dd MMM', { locale: es })} -{' '}
                          {format(new Date(plan.endDate), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                    )}

                    <Link
                      to={`/patient/plans/${plan.id}`}
                      className="inline-flex items-center gap-1 text-gray-600 hover:text-mint-600 font-medium text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Ver detalles
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

