import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { patientsApi, CreatePatientData } from '@/api/patients';
import { Patient } from '@/types';
import {
  Card,
  Button,
  Input,
  Modal,
  Badge,
  EmptyState,
  ConfirmDialog,
  TableRowSkeleton,
} from '@/components/ui';
import {
  Plus,
  Search,
  Mail,
  Phone,
  Trash2,
  Edit2,
  User,
  Lock,
  Users,
  ClipboardList,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const createPatientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Debe contener mayúscula, minúscula y número'
    ),
  phone: z.string().optional(),
});

type CreatePatientForm = z.infer<typeof createPatientSchema>;

export const PatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePatientForm>({
    resolver: zodResolver(createPatientSchema),
  });

  const fetchPatients = async () => {
    try {
      const data = await patientsApi.getAll();
      setPatients(data);
    } catch (error) {
      toast.error('Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const onSubmit = async (data: CreatePatientForm) => {
    setIsSubmitting(true);
    try {
      const newPatient = await patientsApi.create(data as CreatePatientData);
      setPatients([...patients, { ...newPatient, plansCount: 0 }]);
      toast.success('Paciente creado exitosamente');
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Error al crear paciente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePatient) return;
    
    setIsDeleting(true);
    try {
      await patientsApi.delete(deletePatient.id);
      setPatients(patients.filter((p) => p.id !== deletePatient.id));
      toast.success('Paciente eliminado');
      setDeletePatient(null);
    } catch (error) {
      toast.error('Error al eliminar paciente');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los pacientes a tu cargo
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
        />
      </Card>

      {/* Patients List */}
      {loading ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                    Paciente
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                    Contacto
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                    Planes
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : filteredPatients.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                    Paciente
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                    Contacto
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                    Planes
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-500">{patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{patient.phone || 'No especificado'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={patient.plansCount ? 'success' : 'warning'}>
                        {patient.plansCount || 0} planes
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/doctor/plans?patient=${patient.id}`}
                          className="p-2 rounded-lg hover:bg-mint-50 text-mint-600 transition-colors"
                          title="Ver planes"
                        >
                          <ClipboardList className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setDeletePatient(patient)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={<Users className="w-10 h-10" />}
            title="No hay pacientes"
            description={
              searchTerm
                ? 'No se encontraron pacientes con ese criterio'
                : 'Aún no tienes pacientes registrados'
            }
            action={
              !searchTerm
                ? {
                    label: 'Agregar Paciente',
                    onClick: () => setIsModalOpen(true),
                  }
                : undefined
            }
          />
        </Card>
      )}

      {/* Create Patient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="Nuevo Paciente"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            {...register('name')}
            label="Nombre completo"
            placeholder="Nombre del paciente"
            error={errors.name?.message}
            leftIcon={<User className="w-5 h-5" />}
          />

          <Input
            {...register('email')}
            type="email"
            label="Email"
            placeholder="paciente@email.com"
            error={errors.email?.message}
            leftIcon={<Mail className="w-5 h-5" />}
          />

          <Input
            {...register('password')}
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            error={errors.password?.message}
            leftIcon={<Lock className="w-5 h-5" />}
          />

          <Input
            {...register('phone')}
            type="tel"
            label="Teléfono (opcional)"
            placeholder="+34 600 000 000"
            error={errors.phone?.message}
            leftIcon={<Phone className="w-5 h-5" />}
          />

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
            <Button
              type="submit"
              className="flex-1"
              isLoading={isSubmitting}
            >
              Crear Paciente
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletePatient}
        onClose={() => setDeletePatient(null)}
        onConfirm={handleDelete}
        title="Eliminar Paciente"
        message={`¿Estás seguro de que deseas eliminar a ${deletePatient?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
};

