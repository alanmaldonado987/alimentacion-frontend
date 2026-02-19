import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { plansApi } from '@/api/plans';
import {
  MealPlan,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  MealType,
} from '@/types';
import { Card, Badge, CardSkeleton } from '@/components/ui';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Flame,
  Utensils,
  Apple,
  AlertCircle,
  Droplets,
  Dumbbell,
  Moon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  'Hidratación': <Droplets className="w-5 h-5" />,
  'Ejercicio': <Dumbbell className="w-5 h-5" />,
  'Descanso': <Moon className="w-5 h-5" />,
  'Hábitos': <AlertCircle className="w-5 h-5" />,
  'Nutrición': <Apple className="w-5 h-5" />,
};

export const PatientPlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      try {
        const data = await plansApi.getById(id);
        setPlan(data);

        // Set current day as selected if plan is active
        if (data.isActive && data.dailyMeals.length > 0) {
          const start = new Date(data.startDate);
          const today = new Date();
          const currentDay = Math.max(1, Math.min(
            differenceInDays(today, start) + 1,
            data.dailyMeals.length
          ));
          
          const dayExists = data.dailyMeals.some((dm) => dm.dayNumber === currentDay);
          setSelectedDay(dayExists ? currentDay : data.dailyMeals[0].dayNumber);
        } else if (data.dailyMeals.length > 0) {
          setSelectedDay(data.dailyMeals[0].dayNumber);
        }
      } catch (error) {
        toast.error('Error al cargar el plan');
        navigate('/patient/plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, navigate]);

  const currentDayMeals = plan?.dailyMeals.find((dm) => dm.dayNumber === selectedDay);

  const mealTypeOrder: MealType[] = [
    'BREAKFAST',
    'MORNING_SNACK',
    'LUNCH',
    'AFTERNOON_SNACK',
    'DINNER',
    'EVENING_SNACK',
  ];

  const sortedMeals = currentDayMeals?.meals.sort(
    (a, b) => mealTypeOrder.indexOf(a.type) - mealTypeOrder.indexOf(b.type)
  );

  const totalCalories = sortedMeals?.reduce((acc, meal) => acc + (meal.calories || 0), 0) || 0;
  const totalProtein = sortedMeals?.reduce((acc, meal) => acc + (meal.protein || 0), 0) || 0;
  const totalCarbs = sortedMeals?.reduce((acc, meal) => acc + (meal.carbs || 0), 0) || 0;
  const totalFats = sortedMeals?.reduce((acc, meal) => acc + (meal.fats || 0), 0) || 0;

  const navigateDay = (direction: 'prev' | 'next') => {
    if (!plan) return;
    const currentIndex = plan.dailyMeals.findIndex((dm) => dm.dayNumber === selectedDay);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedDay(plan.dailyMeals[currentIndex - 1].dayNumber);
    } else if (direction === 'next' && currentIndex < plan.dailyMeals.length - 1) {
      setSelectedDay(plan.dailyMeals[currentIndex + 1].dayNumber);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="skeleton h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div>
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <Card>
        <p className="text-center text-gray-500">Plan no encontrado</p>
      </Card>
    );
  }

  const currentIndex = plan.dailyMeals.findIndex((dm) => dm.dayNumber === selectedDay);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < plan.dailyMeals.length - 1;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link
          to="/patient/plans"
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Dr. {plan.doctor.name}
            </span>
            {plan.startDate && plan.endDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(plan.startDate), 'dd MMM', { locale: es })} -{' '}
                {format(new Date(plan.endDate), 'dd MMM yyyy', { locale: es })}
              </span>
            )}
            <Badge variant={plan.isActive ? 'success' : 'default'}>
              {plan.isActive ? 'Activo' : 'Completado'}
            </Badge>
          </div>
        </div>
      </div>

      {plan.description && (
        <Card className="bg-mint-50 border border-mint-100">
          <p className="text-gray-700">{plan.description}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - Daily meals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Day selector with navigation */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Comidas del día
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateDay('prev')}
                  disabled={!canGoPrev}
                  className={`p-2 rounded-lg transition-colors ${
                    canGoPrev
                      ? 'hover:bg-gray-100 text-gray-600'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateDay('next')}
                  disabled={!canGoNext}
                  className={`p-2 rounded-lg transition-colors ${
                    canGoNext
                      ? 'hover:bg-gray-100 text-gray-600'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {plan.dailyMeals.length > 0 ? (
              <>
                {/* Day pills */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                  {plan.dailyMeals.map((dm) => (
                    <button
                      key={dm.id}
                      onClick={() => setSelectedDay(dm.dayNumber)}
                      className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                        selectedDay === dm.dayNumber
                          ? 'bg-mint-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="block text-xs opacity-75">Día {dm.dayNumber}</span>
                      <span>{dm.dayName}</span>
                    </button>
                  ))}
                </div>

                {/* Day summary */}
                {currentDayMeals && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                        <Flame className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{totalCalories}</p>
                      <p className="text-xs text-gray-500">Calorías</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{totalProtein}g</p>
                      <p className="text-xs text-gray-500">Proteínas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-600">{totalCarbs}g</p>
                      <p className="text-xs text-gray-500">Carbos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{totalFats}g</p>
                      <p className="text-xs text-gray-500">Grasas</p>
                    </div>
                  </div>
                )}

                {/* Meals list */}
                <div className="space-y-4">
                  {sortedMeals?.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-5 border border-gray-100 rounded-2xl hover:border-mint-200 hover:shadow-soft transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            MEAL_TYPE_COLORS[meal.type]
                          }`}
                        >
                          <Utensils className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-500">
                              {MEAL_TYPE_LABELS[meal.type]}
                            </span>
                            {meal.time && (
                              <span className="flex items-center gap-1 text-sm text-gray-400">
                                <Clock className="w-3 h-3" />
                                {meal.time}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {meal.name}
                          </h3>
                          {meal.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {meal.description}
                            </p>
                          )}

                          {/* Macros */}
                          <div className="flex flex-wrap gap-3 mt-3">
                            {meal.calories && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium">
                                <Flame className="w-4 h-4" />
                                {meal.calories} kcal
                              </span>
                            )}
                            {meal.protein && (
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                                {meal.protein}g prot
                              </span>
                            )}
                            {meal.carbs && (
                              <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium">
                                {meal.carbs}g carbs
                              </span>
                            )}
                            {meal.fats && (
                              <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium">
                                {meal.fats}g grasas
                              </span>
                            )}
                          </div>

                          {/* Foods */}
                          {meal.foods.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Alimentos:
                              </p>
                              <div className="space-y-2">
                                {meal.foods.map((food) => (
                                  <div
                                    key={food.id}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Apple className="w-4 h-4 text-green-500" />
                                      <span className="font-medium text-gray-900">
                                        {food.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                      <span>{food.quantity}</span>
                                      {food.calories && (
                                        <span className="text-orange-600">{food.calories} kcal</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Utensils className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay comidas configuradas para este plan</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - Recommendations */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recomendaciones de tu Doctor
            </h2>

            {plan.recommendations.length > 0 ? (
              <div className="space-y-4">
                {plan.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-mint-50 rounded-xl border border-mint-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm text-mint-600 flex items-center justify-center shrink-0">
                        {categoryIcons[rec.category] || <AlertCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${
                            PRIORITY_COLORS[rec.priority]
                          }`}
                        >
                          Prioridad {PRIORITY_LABELS[rec.priority]}
                        </span>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Sin recomendaciones</p>
              </div>
            )}
          </Card>

          {/* Plan info */}
          <Card className="bg-sky-50 border border-sky-100">
            <h3 className="font-semibold text-gray-900 mb-4">Información del Plan</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Doctor</span>
                <span className="font-medium text-gray-900">{plan.doctor.name}</span>
              </div>
              {plan.startDate && plan.endDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Duración</span>
                  <span className="font-medium text-gray-900">
                    {differenceInDays(new Date(plan.endDate), new Date(plan.startDate)) + 1} días
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Creado</span>
                <span className="font-medium text-gray-900">
                  {format(new Date(plan.createdAt), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

