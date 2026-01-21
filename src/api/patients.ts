import api from './axios';
import { ApiResponse, Patient } from '@/types';

export interface CreatePatientData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface UpdatePatientData {
  email?: string;
  name?: string;
  phone?: string;
}

export const patientsApi = {
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get<ApiResponse<Patient[]>>('/patients');
    return response.data.data;
  },

  getById: async (id: string): Promise<Patient> => {
    const response = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
    return response.data.data;
  },

  create: async (data: CreatePatientData): Promise<Patient> => {
    const response = await api.post<ApiResponse<Patient>>('/patients', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdatePatientData): Promise<Patient> => {
    const response = await api.put<ApiResponse<Patient>>(`/patients/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },

  assign: async (email: string): Promise<Patient> => {
    const response = await api.post<ApiResponse<Patient>>('/patients/assign', { email });
    return response.data.data;
  },
};

