import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { plansApi, CreatePlanData } from '@/api/plans';
import { patientsApi } from '@/api/patients';
import { MealPlan, Patient, DAY_NAMES } from '@/types';
import {
  Card,
  Button,
  Input,
  Select,
  TextArea,
  Modal,
  Badge,
  EmptyState,
  ConfirmDialog,
} from '@/components/ui';
import {
  Plus,
  Search,
  Calendar,
  Trash2,
  Eye,
  ClipboardList,
  User,
  ChevronRight,
} from 'lucide-react';

const createPlanSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  patientId: z.string().min(1, 'Selecciona un paciente'),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().min(1, 'Fecha de fin requerida'),
});

type CreatePlanForm = z.infer<typeof createPlanSchema>;

export const PlansPage = () => {
  const [searchParams] = useSearchParams();
  const patientIdFilter = searchParams.get('patient');

  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletePlan, setDeletePlan] = useState<MealPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreatePlanForm>({
    resolver: zodResolver(createPlanSchema),
  });

  const fetchData = async () => {
    try {
      const [plansData, patientsData] = await Promise.all([
        plansApi.getAll(),
        patientsApi.getAll(),
      ]);
      setPlans(plansData);
      setPatients(patientsData);

      // If patient filter is set, pre-select patient
      if (patientIdFilter) {
        setValue('patientId', patientIdFilter);
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [patientIdFilter]);

  const onSubmit = async (data: CreatePlanForm) => {
    setIsSubmitting(true);
    try {
      const newPlan = await plansApi.create(data as CreatePlanData);
      setPlans([newPlan, ...plans]);
      toast.success('Plan creado exitosamente');
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Error al crear plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePlan) return;

    setIsDeleting(true);
    try {
      await plansApi.delete(deletePlan.id);
      setPlans(plans.filter((p) => p.id !== deletePlan.id));
      toast.success('Plan eliminado');
      setDeletePlan(null);
    } catch (error) {
      toast.error('Error al eliminar plan');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleActive = async (plan: MealPlan) => {
    try {
      const updated = await plansApi.update(plan.id, { isActive: !plan.isActive });
      setPlans(plans.map((p) => (p.id === plan.id ? updated : p)));
      toast.success(updated.isActive ? 'Plan activado' : 'Plan desactivado');
    } catch (error) {
      toast.error('Error al actualizar plan');
    }
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPatient = !patientIdFilter || plan.patientId === patientIdFilter;
    
    return matchesSearch && matchesPatient;
  });

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planes Alimenticios</h1>
          <p className="text-gray-500 mt-1">
            {patientIdFilter
              ? `Planes de ${patients.find((p) => p.id === patientIdFilter)?.name || 'paciente'}`
              : 'Gestiona todos los planes alimenticios'}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Nuevo Plan
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Buscar por título o paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
        />
      </Card>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <div className="skeleton h-5 w-3/4 mb-3" />
                <div className="skeleton h-4 w-1/2 mb-4" />
                <div className="skeleton h-20 w-full mb-4" />
                <div className="flex gap-2">
                  <div className="skeleton h-8 w-24 rounded-lg" />
                  <div className="skeleton h-8 w-24 rounded-lg" />
                </div>
              </Card>
            ))}
        </div>
      ) : filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">
                    {plan.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span className="truncate">{plan.patient.name}</span>
                  </div>
                </div>
                <Badge variant={plan.isActive ? 'success' : 'default'}>
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {plan.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {plan.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(plan.startDate), 'dd MMM', { locale: es })} -{' '}
                  {format(new Date(plan.endDate), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <ClipboardList className="w-4 h-4" />
                <span>{plan.dailyMeals.length} días configurados</span>
              </div>

              <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                <Link
                  to={`/doctor/plans/${plan.id}`}
                  className="flex-1 btn-secondary btn-sm text-center"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </Link>
                <button
                  onClick={() => toggleActive(plan)}
                  className={`flex-1 btn-sm ${
                    plan.isActive
                      ? 'btn bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'btn bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {plan.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => setDeletePlan(plan)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<ClipboardList className="w-10 h-10" />}
            title="No hay planes"
            description={
              searchTerm
                ? 'No se encontraron planes con ese criterio'
                : 'Aún no has creado ningún plan alimenticio'
            }
            action={
              !searchTerm
                ? {
                    label: 'Crear Plan',
                    onClick: () => setIsModalOpen(true),
                  }
                : undefined
            }
          />
        </Card>
      )}

      {/* Create Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="Nuevo Plan Alimenticio"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            {...register('title')}
            label="Título del plan"
            placeholder="Ej: Plan de pérdida de peso - Semana 1"
            error={errors.title?.message}
          />

          <TextArea
            {...register('description')}
            label="Descripción (opcional)"
            placeholder="Describe brevemente los objetivos del plan..."
            error={errors.description?.message}
          />

          <Select
            {...register('patientId')}
            label="Paciente"
            placeholder="Selecciona un paciente"
            options={patientOptions}
            error={errors.patientId?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('startDate')}
              type="date"
              label="Fecha de inicio"
              error={errors.startDate?.message}
            />

            <Input
              {...register('endDate')}
              type="date"
              label="Fecha de fin"
              error={errors.endDate?.message}
            />
          </div>

          <div className="p-4 bg-mint-50 rounded-xl">
            <p className="text-sm text-mint-800">
              <strong>Nota:</strong> Después de crear el plan, podrás agregar las comidas diarias
              y recomendaciones desde la vista detallada.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsModalOpen(false);
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Crear Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletePlan}
        onClose={() => setDeletePlan(null)}
        onConfirm={handleDelete}
        title="Eliminar Plan"
        message={`¿Estás seguro de que deseas eliminar "${deletePlan?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
};

