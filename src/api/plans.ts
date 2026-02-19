import api from './axios';
import { ApiResponse, MealPlan, DoctorStats, PatientStats } from '@/types';

export interface CreatePlanData {
  title: string;
  description?: string;
  patientId: string;
  startDate?: string;
  endDate?: string;
  dailyMeals?: {
    dayNumber: number;
    dayName: string;
    meals: {
      type: string;
      name: string;
      description?: string;
      calories?: number;
      porcion?: string;
      time?: string;
      foods?: {
        name: string;
        quantity: string;
        calories?: number;
        notes?: string;
      }[];
    }[];
  }[];
  recommendations?: {
    title: string;
    description: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    category: string;
  }[];
}

export interface UpdatePlanData extends Partial<CreatePlanData> {
  isActive?: boolean;
}

export interface AddMealData {
  dailyMealId: string;
  type: string;
  name: string;
  description?: string;
  calories?: number;
  porcion?: string;
  time?: string;
  foods?: {
    name: string;
    quantity: string;
    calories?: number;
    notes?: string;
  }[];
}

export interface UpdateMealData {
  type?: string;
  name?: string;
  description?: string;
  calories?: number;
  porcion?: string;
  time?: string;
  foods?: {
    name: string;
    quantity: string;
    calories?: number;
    notes?: string;
  }[];
}

export const plansApi = {
  getAll: async (): Promise<MealPlan[]> => {
    const response = await api.get<ApiResponse<MealPlan[]>>('/api/plans');
    return response.data.data;
  },

  getById: async (id: string): Promise<MealPlan> => {
    const response = await api.get<ApiResponse<MealPlan>>(`/api/plans/${id}`);
    return response.data.data;
  },

  create: async (data: CreatePlanData): Promise<MealPlan> => {
    const response = await api.post<ApiResponse<MealPlan>>('/api/plans', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdatePlanData): Promise<MealPlan> => {
    const response = await api.put<ApiResponse<MealPlan>>(`/api/plans/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/plans/${id}`);
  },

  getDoctorStats: async (): Promise<DoctorStats> => {
    const response = await api.get<ApiResponse<DoctorStats>>('/api/plans/stats/doctor');
    return response.data.data;
  },

  getPatientStats: async (): Promise<PatientStats> => {
    const response = await api.get<ApiResponse<PatientStats>>('/api/plans/stats/patient');
    return response.data.data;
  },

  addMeal: async (planId: string, data: AddMealData): Promise<MealPlan> => {
    const response = await api.post<ApiResponse<MealPlan>>(`/api/plans/${planId}/meals`, data);
    return response.data.data;
  },

  updateMeal: async (planId: string, mealId: string, data: UpdateMealData): Promise<MealPlan> => {
    const response = await api.put<ApiResponse<MealPlan>>(`/api/plans/${planId}/meals/${mealId}`, data);
    return response.data.data;
  },

  deleteMeal: async (planId: string, mealId: string): Promise<MealPlan> => {
    const response = await api.delete<ApiResponse<MealPlan>>(`/api/plans/${planId}/meals/${mealId}`);
    return response.data.data;
  },
};

