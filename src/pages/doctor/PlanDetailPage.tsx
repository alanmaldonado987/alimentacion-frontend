import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { plansApi } from '@/api/plans';
import {
  MealPlan,
  DailyMeal,
  Meal,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  DAY_NAMES,
  MealType,
} from '@/types';
import {
  Card,
  Button,
  Input,
  Select,
  TextArea,
  Modal,
  Badge,
  CardSkeleton,
} from '@/components/ui';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Flame,
  Plus,
  Edit2,
  Save,
  X,
  Utensils,
  Apple,
  AlertCircle,
  Droplets,
  Dumbbell,
  Moon,
} from 'lucide-react';

const addMealSchema = z.object({
  dayNumber: z.string().min(1, 'Selecciona un día'),
  type: z.string().min(1, 'Selecciona tipo de comida'),
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  time: z.string().optional(),
  calories: z.string().optional(),
  foods: z.string().optional(),
});

type AddMealForm = z.infer<typeof addMealSchema>;

const categoryIcons: Record<string, React.ReactNode> = {
  'Hidratación': <Droplets className="w-5 h-5" />,
  'Ejercicio': <Dumbbell className="w-5 h-5" />,
  'Descanso': <Moon className="w-5 h-5" />,
  'Hábitos': <AlertCircle className="w-5 h-5" />,
  'Nutrición': <Apple className="w-5 h-5" />,
};

export const PlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMealForm>({
    resolver: zodResolver(addMealSchema),
    defaultValues: {
      dayNumber: '1',
    },
  });

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      try {
        const data = await plansApi.getById(id);
        setPlan(data);
        if (data.dailyMeals.length > 0) {
          setSelectedDay(data.dailyMeals[0].dayNumber);
        }
      } catch (error) {
        toast.error('Error al cargar el plan');
        navigate('/doctor/plans');
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

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link
          to="/doctor/plans"
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {plan.patient.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(plan.startDate), 'dd MMM', { locale: es })} -{' '}
              {format(new Date(plan.endDate), 'dd MMM yyyy', { locale: es })}
            </span>
            <Badge variant={plan.isActive ? 'success' : 'default'}>
              {plan.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>
      </div>

      {plan.description && (
        <Card className="bg-mint-50 border border-mint-100">
          <p className="text-gray-700">{plan.description}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main content - Daily meals */}
        <div className="space-y-6 min-w-0">
          {/* Day selector */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Comidas del día
              </h2>
              <Button size="sm" onClick={() => setIsMealModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Agregar
              </Button>
            </div>

            {plan.dailyMeals.length > 0 ? (
              <>
                <div className="flex gap-2 overflow-x-auto pb-4">
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
                      {dm.dayName}
                    </button>
                  ))}
                </div>

                {/* Day summary */}
                {currentDayMeals && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Utensils className="w-5 h-5" />
                      <span className="font-medium">{sortedMeals?.length || 0} comidas</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">{totalCalories} kcal totales</span>
                    </div>
                  </div>
                )}

                {/* Meals list */}
                <div className="space-y-4">
                  {sortedMeals?.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-4 border border-gray-100 rounded-xl hover:border-mint-200 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`meal-type-badge ${MEAL_TYPE_COLORS[meal.type]}`}
                            >
                              {MEAL_TYPE_LABELS[meal.type]}
                            </span>
                            {meal.time && (
                              <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="w-3 h-3" />
                                {meal.time}
                              </span>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900">{meal.name}</h3>
                          {meal.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {meal.description}
                            </p>
                          )}
                        </div>
                        {meal.calories && (
                          <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                            <Flame className="w-4 h-4" />
                            <span className="font-semibold">{meal.calories}</span>
                            <span className="text-xs">kcal</span>
                          </div>
                        )}
                      </div>

                      {/* Macros */}
                      {(meal.protein || meal.carbs || meal.fats) && (
                        <div className="flex gap-4 mb-3 text-sm">
                          {meal.protein && (
                            <span className="text-blue-600">
                              Proteínas: {meal.protein}g
                            </span>
                          )}
                          {meal.carbs && (
                            <span className="text-amber-600">
                              Carbos: {meal.carbs}g
                            </span>
                          )}
                          {meal.fats && (
                            <span className="text-purple-600">
                              Grasas: {meal.fats}g
                            </span>
                          )}
                        </div>
                      )}

                      {/* Foods */}
                      {meal.foods.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Alimentos:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {meal.foods.map((food) => (
                              <span
                                key={food.id}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                              >
                                <Apple className="w-3 h-3 text-green-500" />
                                {food.name} ({food.quantity})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Utensils className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="mb-4">No hay comidas configuradas aún</p>
                <Button onClick={() => setIsMealModalOpen(true)}>
                  <Plus className="w-5 h-5" />
                  Agregar Primera Comida
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - Recommendations */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recomendaciones
            </h2>

            {plan.recommendations.length > 0 ? (
              <div className="space-y-4">
                {plan.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-mint-100 text-mint-600 flex items-center justify-center">
                        {categoryIcons[rec.category] || <AlertCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{rec.title}</h3>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              PRIORITY_COLORS[rec.priority]
                            }`}
                          >
                            {PRIORITY_LABELS[rec.priority]}
                          </span>
                        </div>
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

          {/* Quick info */}
          <Card className="bg-sky-50 border border-sky-100">
            <h3 className="font-semibold text-gray-900 mb-3">Información</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <strong>Doctor:</strong> {plan.doctor.name}
              </p>
              <p className="text-gray-600">
                <strong>Paciente:</strong> {plan.patient.name}
              </p>
              <p className="text-gray-600">
                <strong>Creado:</strong>{' '}
                {format(new Date(plan.createdAt), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Meal Modal - Simplified for demo */}
      <Modal
        isOpen={isMealModalOpen}
        onClose={() => {
          setIsMealModalOpen(false);
          reset();
        }}
        title="Agregar Comida"
        size="lg"
      >
        <div className="p-4 bg-amber-50 rounded-xl mb-6">
          <p className="text-sm text-amber-800">
            <strong>Nota:</strong> Para una experiencia completa de edición de comidas,
            esta funcionalidad estaría implementada con un editor más avanzado.
            Por ahora, puedes usar la API directamente o editar el plan mediante seed.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setIsMealModalOpen(false)}
          >
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

