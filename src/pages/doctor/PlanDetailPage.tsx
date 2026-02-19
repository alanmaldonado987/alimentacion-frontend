import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { plansApi } from '@/api/plans';
import {
  MealPlan,
  Meal,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
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
  Save,
  X,
  Utensils,
  Apple,
  AlertCircle,
  Droplets,
  Dumbbell,
  Moon,
  Edit2,
  Trash2,
} from 'lucide-react';

const foodItemSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  quantity: z.string()
    .min(1, 'Porción requerida')
    .regex(/^\d+$/, 'Solo se permiten números'),
});

const addMealSchema = z.object({
  type: z.string().min(1, 'Selecciona tipo de comida'),
  description: z.string().optional(),
  time: z.string().optional(),
  calories: z.string().optional(),
  foods: z.array(foodItemSchema).min(1, 'Debe agregar al menos un alimento'),
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
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddMealForm>({
    resolver: zodResolver(addMealSchema),
    defaultValues: {
      foods: [{ name: '', quantity: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'foods',
  });


  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      try {
        const data = await plansApi.getById(id);
        setPlan(data);
      } catch (error) {
        toast.error('Error al cargar el plan');
        navigate('/doctor/plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, navigate]);

  useEffect(() => {
    if (isMealModalOpen && plan) {
      if (editingMeal) {
        const foodsArray = editingMeal.foods.length > 0
          ? editingMeal.foods.map((f) => ({
              name: f.name,
              quantity: f.quantity,
            }))
          : [];
        
        reset({
          type: editingMeal.type,
          description: editingMeal.description || '',
          time: editingMeal.time || '',
          calories: editingMeal.calories?.toString() || '',
          foods: [
            { name: editingMeal.name, quantity: editingMeal.porcion || '' },
            ...foodsArray,
          ],
        });
      } else {
        reset({
          foods: [{ name: '', quantity: '' }],
        });
      }
    }
  }, [isMealModalOpen, plan, reset, editingMeal]);

  const onSubmit = async (data: AddMealForm) => {
    if (!plan || !id) return;

    setIsSubmitting(true);
    try {
      // Usar el primer día disponible, o crear el día 1 si no hay días
      const dayNumber = plan.dailyMeals.length > 0 
        ? plan.dailyMeals[0].dayNumber 
        : 1;
      let dailyMeal = plan.dailyMeals.find((dm) => dm.dayNumber === dayNumber);

      if (!dailyMeal) {
        // Si hay fechas, usar el nombre del día basado en la fecha, sino usar "Día X"
        let dayName = `Día ${dayNumber}`;
        if (plan.startDate) {
          const dayDate = addDays(new Date(plan.startDate), dayNumber - 1);
          const dayNameFormatted = format(dayDate, 'EEEE', { locale: es });
          dayName = dayNameFormatted.charAt(0).toUpperCase() + dayNameFormatted.slice(1);
        }
        
        const updatedPlan = await plansApi.update(id, {
          dailyMeals: [
            ...plan.dailyMeals,
            {
              dayNumber,
              dayName: dayName,
              meals: [],
            },
          ],
        });
        dailyMeal = updatedPlan.dailyMeals.find((dm) => dm.dayNumber === dayNumber);
        if (!dailyMeal) {
          throw new Error('Error al crear el día');
        }
        setPlan(updatedPlan);
      }

      const firstFood = data.foods[0];
      const remainingFoods = data.foods.slice(1);

      if (editingMeal) {
        await plansApi.updateMeal(id, editingMeal.id, {
          type: data.type as MealType,
          name: firstFood.name,
          description: data.description || undefined,
          calories: data.calories ? parseInt(data.calories) : undefined,
          porcion: firstFood.quantity || undefined,
          time: data.time || undefined,
          foods: remainingFoods.map((food) => ({
            name: food.name,
            quantity: food.quantity,
          })),
        });
        toast.success('Comida actualizada exitosamente');
      } else {
        await plansApi.addMeal(id, {
          dailyMealId: dailyMeal.id,
          type: data.type as MealType,
          name: firstFood.name,
          description: data.description || undefined,
          calories: data.calories ? parseInt(data.calories) : undefined,
          porcion: firstFood.quantity || undefined,
          time: data.time || undefined,
          foods: remainingFoods.map((food) => ({
            name: food.name,
            quantity: food.quantity,
          })),
        });
        toast.success('Comida agregada exitosamente');
      }

      const updatedPlan = await plansApi.getById(id);
      setPlan(updatedPlan);
      setIsMealModalOpen(false);
      setEditingMeal(null);
      reset();
    } catch (error) {
      toast.error(editingMeal ? 'Error al actualizar la comida' : 'Error al agregar la comida');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setIsMealModalOpen(true);
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!id) return;
    
    setDeletingMealId(mealId);
    try {
      await plansApi.deleteMeal(id, mealId);
      const updatedPlan = await plansApi.getById(id);
      setPlan(updatedPlan);
      toast.success('Comida eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar la comida');
    } finally {
      setDeletingMealId(null);
    }
  };

  const handleToggleActive = async () => {
    if (!plan || !id) return;

    setIsSubmitting(true);
    try {
      const updated = await plansApi.update(id, { isActive: !plan.isActive });
      setPlan(updated);
      toast.success(updated.isActive ? 'Plan activado' : 'Plan desactivado');
    } catch (error) {
      toast.error('Error al actualizar el plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mealTypeOrder: MealType[] = [
    'BREAKFAST',
    'MORNING_SNACK',
    'LUNCH',
    'AFTERNOON_SNACK',
    'DINNER',
    'EVENING_SNACK',
  ];

  // Calcular totales de todas las comidas
  const allMeals = plan?.dailyMeals.flatMap((dm) => dm.meals) || [];
  const totalCalories = allMeals.reduce((acc, meal) => acc + (meal.calories || 0), 0);

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
            {plan.startDate && plan.endDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(plan.startDate), 'dd MMM', { locale: es })} -{' '}
                {format(new Date(plan.endDate), 'dd MMM yyyy', { locale: es })}
              </span>
            )}
            <div className="flex items-center gap-2">
              <Badge variant={plan.isActive ? 'success' : 'default'}>
                {plan.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleToggleActive}
                isLoading={isSubmitting}
                className={plan.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}
              >
                {plan.isActive ? 'Desactivar' : 'Activar'}
              </Button>
            </div>
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
                Comidas
              </h2>
              <Button size="sm" onClick={() => setIsMealModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Agregar
              </Button>
            </div>

            {plan.dailyMeals.length > 0 ? (
              <>
                {/* Summary */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Utensils className="w-5 h-5" />
                    <span className="font-medium">{allMeals.length} comidas</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">{totalCalories} kcal totales</span>
                  </div>
                </div>

                {/* Meals list grouped by day */}
                <div className="space-y-6">
                  {plan.dailyMeals
                    .sort((a, b) => a.dayNumber - b.dayNumber)
                    .map((dailyMeal) => {
                      const sortedMeals = dailyMeal.meals.sort(
                        (a, b) => mealTypeOrder.indexOf(a.type) - mealTypeOrder.indexOf(b.type)
                      );
                      
                      return (
                        <div key={dailyMeal.id} className="space-y-4">
                          {sortedMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-4 border border-gray-100 rounded-xl hover:border-mint-200 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
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
                        <div className="flex items-center gap-2">
                          {meal.calories && (
                            <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                              <Flame className="w-4 h-4" />
                              <span className="font-semibold">{meal.calories}</span>
                              <span className="text-xs">kcal</span>
                            </div>
                          )}
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditMeal(meal)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleDeleteMeal(meal.id)}
                              isLoading={deletingMealId === meal.id}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {meal.porcion && (
                        <div className="mb-2 text-sm text-gray-600">
                          <span className="font-medium">Porción:</span> {meal.porcion}
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
                      );
                    })}
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

      <Modal
        isOpen={isMealModalOpen}
        onClose={() => {
          setIsMealModalOpen(false);
          setEditingMeal(null);
          reset();
        }}
        title={editingMeal ? 'Editar Comida' : 'Agregar Comida'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            {...register('type')}
            label="Tipo de comida"
            error={errors.type?.message}
            options={[
              { value: 'BREAKFAST', label: MEAL_TYPE_LABELS.BREAKFAST },
              { value: 'MORNING_SNACK', label: MEAL_TYPE_LABELS.MORNING_SNACK },
              { value: 'LUNCH', label: MEAL_TYPE_LABELS.LUNCH },
              { value: 'AFTERNOON_SNACK', label: MEAL_TYPE_LABELS.AFTERNOON_SNACK },
              { value: 'DINNER', label: MEAL_TYPE_LABELS.DINNER },
              { value: 'EVENING_SNACK', label: MEAL_TYPE_LABELS.EVENING_SNACK },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register('time')}
              type="time"
              label="Hora de comida (Opcional)"
              error={errors.time?.message}
            />

            <Input
              {...register('calories')}
              type="number"
              label="Calorias (Opcional)"
              placeholder="---"
              error={errors.calories?.message}
            />
          </div>

          <TextArea
            {...register('description')}
            label="Observaciones"
            placeholder="Descripción de la comida"
            error={errors.description?.message}
            rows={3}
          />

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
                <Input
                  {...register(`foods.${index}.name`)}
                  label={index === 0 ? 'Alimento (Obligatorio)' : 'Alimento'}
                  placeholder="---"
                  error={errors.foods?.[index]?.name?.message}
                />
                <Input
                  {...register(`foods.${index}.quantity`)}
                  type="number"
                  min="0"
                  step="1"
                  label={index === 0 ? 'Porción' : 'Porción'}
                  placeholder="Ej: 200"
                  error={errors.foods?.[index]?.quantity?.message}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                      e.preventDefault();
                    }
                  }}
                />
                <div className="flex items-center h-[42px]">
                  {index === fields.length - 1 ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => append({ name: '', quantity: '' })}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => remove(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {errors.foods?.root && (
              <p className="text-sm text-red-600">{errors.foods.root.message}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 w-full sm:w-auto"
              onClick={() => {
                setIsMealModalOpen(false);
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 w-full sm:w-auto"
              isLoading={isSubmitting}
            >
              <Save className="w-4 h-4" />
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

