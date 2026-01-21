import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { plansApi } from '@/api/plans';
import { Card, Badge, StatCardSkeleton } from '@/components/ui';
import { PatientStats, MealPlan, MEAL_TYPE_LABELS, MEAL_TYPE_COLORS } from '@/types';
import {
  ClipboardList,
  CheckCircle,
  Calendar,
  ArrowRight,
  Utensils,
  Apple,
  Flame,
  Heart,
  User,
  Clock,
} from 'lucide-react';
import { format, isToday, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, plansData] = await Promise.all([
          plansApi.getPatientStats(),
          plansApi.getAll(),
        ]);
        setStats(statsData);

        // Find active plan
        const active = plansData.find(
          (p) =>
            p.isActive &&
            new Date(p.startDate) <= new Date() &&
            new Date(p.endDate) >= new Date()
        );
        setActivePlan(active || null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate current day of the plan
  const getCurrentDayNumber = () => {
    if (!activePlan) return 0;
    const start = new Date(activePlan.startDate);
    const today = new Date();
    return Math.max(1, differenceInDays(today, start) + 1);
  };

  const currentDayNumber = getCurrentDayNumber();
  const todayMeals = activePlan?.dailyMeals.find(
    (dm) => dm.dayNumber === currentDayNumber
  );

  const statCards = [
    {
      label: 'Planes Totales',
      value: stats?.plansCount || 0,
      icon: ClipboardList,
      color: 'bg-sky-500',
    },
    {
      label: 'Planes Activos',
      value: stats?.activePlansCount || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Hola, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Aquí tienes un resumen de tu plan alimenticio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {loading
          ? Array(2)
              .fill(0)
              .map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat) => (
              <Card key={stat.label} className="flex items-center gap-4">
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
            ))}
      </div>

      {/* Current Plan */}
      {loading ? (
        <Card>
          <div className="skeleton h-6 w-48 mb-4" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-3/4" />
        </Card>
      ) : activePlan ? (
        <Card className="bg-mint-500 text-white border-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 text-white">Plan Activo</Badge>
                <span className="text-white/80 text-sm">
                  Día {currentDayNumber} de{' '}
                  {differenceInDays(
                    new Date(activePlan.endDate),
                    new Date(activePlan.startDate)
                  ) + 1}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-1">{activePlan.title}</h2>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Dr. {activePlan.doctor.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Hasta {format(new Date(activePlan.endDate), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            </div>
            <Link
              to={`/patient/plans/${activePlan.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-mint-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Ver Plan Completo
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="bg-gray-50 border-2 border-dashed border-gray-200">
          <div className="text-center py-8">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes un plan activo
            </h3>
            <p className="text-gray-500">
              Contacta con tu doctor para que te asigne un plan alimenticio
            </p>
          </div>
        </Card>
      )}

      {/* Today's Meals */}
      {activePlan && todayMeals && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Comidas de hoy - {todayMeals.dayName}
            </h2>
            <span className="text-sm text-gray-500">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayMeals.meals
              .sort((a, b) => {
                const order = [
                  'BREAKFAST',
                  'MORNING_SNACK',
                  'LUNCH',
                  'AFTERNOON_SNACK',
                  'DINNER',
                  'EVENING_SNACK',
                ];
                return order.indexOf(a.type) - order.indexOf(b.type);
              })
              .map((meal) => (
                <Card key={meal.id} variant="interactive">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        MEAL_TYPE_COLORS[meal.type]
                      }`}
                    >
                      <Utensils className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          {MEAL_TYPE_LABELS[meal.type]}
                        </span>
                        {meal.time && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {meal.time}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {meal.name}
                      </h3>
                      {meal.calories && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-orange-600">
                          <Flame className="w-4 h-4" />
                          <span>{meal.calories} kcal</span>
                        </div>
                      )}
                      {meal.foods.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {meal.foods.slice(0, 3).map((food) => (
                            <span
                              key={food.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                            >
                              <Apple className="w-3 h-3 text-green-500" />
                              {food.name}
                            </span>
                          ))}
                          {meal.foods.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-gray-500">
                              +{meal.foods.length - 3} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Recommendations Preview */}
      {activePlan && activePlan.recommendations.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recomendaciones
            </h2>
            <Link
              to={`/patient/plans/${activePlan.id}`}
              className="text-mint-600 hover:text-mint-700 font-medium text-sm flex items-center gap-1"
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePlan.recommendations.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-mint-50 rounded-xl border border-mint-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-mint-600" />
                  <h3 className="font-medium text-gray-900">{rec.title}</h3>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Motivational Card */}
      <Card className="bg-amber-500 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            💪
          </div>
          <div>
            <h3 className="font-semibold text-lg">¡Sigue así!</h3>
            <p className="text-white/90">
              La constancia es la clave del éxito. Cada comida saludable te acerca más a tus objetivos.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

