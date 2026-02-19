export type Role = 'DOCTOR' | 'PATIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient extends User {
  plansCount?: number;
}

export type MealType = 
  | 'BREAKFAST' 
  | 'MORNING_SNACK' 
  | 'LUNCH' 
  | 'AFTERNOON_SNACK' 
  | 'DINNER' 
  | 'EVENING_SNACK';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Food {
  id: string;
  name: string;
  quantity: string;
  calories?: number;
  notes?: string;
}

export interface Meal {
  id: string;
  type: MealType;
  name: string;
  description?: string;
  calories?: number;
  porcion?: string;
  time?: string;
  foods: Food[];
}

export interface DailyMeal {
  id: string;
  dayNumber: number;
  dayName: string;
  meals: Meal[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
}

export interface MealPlan {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  doctorId: string;
  patientId: string;
  doctor: {
    id: string;
    name: string;
    email: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
  };
  dailyMeals: DailyMeal[];
  recommendations: Recommendation[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface DoctorStats {
  patientsCount: number;
  plansCount: number;
  activePlansCount: number;
}

export interface PatientStats {
  plansCount: number;
  activePlansCount: number;
  currentPlan?: MealPlan;
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Desayuno',
  MORNING_SNACK: 'Snack Mañana',
  LUNCH: 'Almuerzo',
  AFTERNOON_SNACK: 'Merienda',
  DINNER: 'Cena',
  EVENING_SNACK: 'Snack Noche',
};

export const MEAL_TYPE_COLORS: Record<MealType, string> = {
  BREAKFAST: 'bg-amber-100 text-amber-700',
  MORNING_SNACK: 'bg-orange-100 text-orange-700',
  LUNCH: 'bg-emerald-100 text-emerald-700',
  AFTERNOON_SNACK: 'bg-sky-100 text-sky-700',
  DINNER: 'bg-indigo-100 text-indigo-700',
  EVENING_SNACK: 'bg-violet-100 text-violet-700',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
};

export const DAY_NAMES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

