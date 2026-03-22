import axios from 'axios';
import type {
  User,
  LoginCredentials,
  RegisterData,
  Equipment,
  EquipmentCategory,
  Booking,
  MaintenanceHistory,
  EquipmentRemark,
  SiteSetting,
  EquipmentImage,
  EquipmentSpec,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    api.post<{ token: string; user: User }>('/auth/login', credentials),
  register: (data: RegisterData) =>
    api.post<{ token: string; user: User }>('/auth/register', data),
  getCurrentUser: () => api.get<{ user: User }>('/auth/me'),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get<{ categories: EquipmentCategory[] }>('/categories'),
  getById: (id: string) => api.get<{ category: EquipmentCategory }>(`/categories/${id}`),
  create: (data: Partial<EquipmentCategory>) =>
    api.post<{ category: EquipmentCategory }>('/categories', data),
  update: (id: string, data: Partial<EquipmentCategory>) =>
    api.put<{ category: EquipmentCategory }>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Equipment API
export const equipmentAPI = {
  getAll: (params?: { category?: string; status?: string; search?: string }) =>
    api.get<{ equipment: Equipment[] }>('/equipment', { params }),
  getById: (id: string) => api.get<{ equipment: Equipment }>(`/equipment/${id}`),
  create: (data: Partial<Equipment>) =>
    api.post<{ equipment: Equipment }>('/equipment', data),
  update: (id: string, data: Partial<Equipment>) =>
    api.put<{ equipment: Equipment }>(`/equipment/${id}`, data),
  delete: (id: string) => api.delete(`/equipment/${id}`),
  getMaintenanceHistory: (id: string) =>
    api.get<{ maintenance_history: MaintenanceHistory[] }>(`/equipment/${id}/maintenance`),
  getRemarks: (id: string) =>
    api.get<{ remarks: EquipmentRemark[] }>(`/equipment/${id}/remarks`),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params?: {
    equipment_id?: string;
    user_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => api.get<{ bookings: Booking[] }>('/bookings', { params }),
  getById: (id: string) => api.get<{ booking: Booking }>(`/bookings/${id}`),
  create: (data: Partial<Booking>) => api.post<{ booking: Booking }>('/bookings', data),
  update: (id: string, data: Partial<Booking>) =>
    api.put<{ booking: Booking }>(`/bookings/${id}`, data),
  delete: (id: string) => api.delete(`/bookings/${id}`),
  updateStatus: (id: string, status: string, admin_notes?: string) =>
    api.patch<{ booking: Booking }>(`/bookings/${id}/status`, { status, admin_notes }),
  cancel: (id: string, cancellation_reason?: string) =>
    api.patch<{ booking: Booking }>(`/bookings/${id}/cancel`, { cancellation_reason }),
  getAvailability: (equipment_id: string, start_date: string, end_date: string) =>
    api.get<{ bookings: Booking[] }>(`/bookings/equipment/${equipment_id}/availability`, {
      params: { start_date, end_date },
    }),
};

// Maintenance API
export const maintenanceAPI = {
  getAll: (params?: {
    equipment_id?: string;
    maintenance_type?: string;
    start_date?: string;
    end_date?: string;
  }) => api.get<{ maintenance_records: MaintenanceHistory[] }>('/maintenance', { params }),
  create: (data: Partial<MaintenanceHistory>) =>
    api.post<{ maintenance: MaintenanceHistory }>('/maintenance', data),
  update: (id: string, data: Partial<MaintenanceHistory>) =>
    api.put<{ maintenance: MaintenanceHistory }>(`/maintenance/${id}`, data),
  delete: (id: string) => api.delete(`/maintenance/${id}`),
};

// Remarks API
export const remarksAPI = {
  getAll: (params?: { equipment_id?: string; remark_type?: string; resolved?: boolean }) =>
    api.get<{ remarks: EquipmentRemark[] }>('/remarks', { params }),
  create: (data: Partial<EquipmentRemark>) =>
    api.post<{ remark: EquipmentRemark }>('/remarks', data),
  resolve: (id: string) => api.patch<{ remark: EquipmentRemark }>(`/remarks/${id}/resolve`),
  delete: (id: string) => api.delete(`/remarks/${id}`),
};

// Settings API
export const settingsAPI = {
  getAll: () => api.get<{ settings: SiteSetting[] }>('/settings'),
  getByKey: (key: string) => api.get<{ setting: SiteSetting }>(`/settings/${key}`),
  update: (key: string, setting_value: string) =>
    api.put<{ setting: SiteSetting }>(`/settings/${key}`, { setting_value }),
};

// Equipment Images API
export const equipmentImagesAPI = {
  getAll: (equipmentId: string) =>
    api.get<{ images: EquipmentImage[] }>(`/equipment/${equipmentId}/images`),
  add: (equipmentId: string, data: { image_url: string; image_name?: string; is_primary?: boolean }) =>
    api.post<{ image: EquipmentImage }>(`/equipment/${equipmentId}/images`, data),
  upload: (equipmentId: string, file: File, is_primary: boolean = false) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('is_primary', is_primary.toString());
    return api.post<{ image: EquipmentImage }>(`/equipment/${equipmentId}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: (equipmentId: string, imageId: string) =>
    api.delete(`/equipment/${equipmentId}/images/${imageId}`),
  setPrimary: (equipmentId: string, imageId: string) =>
    api.put<{ image: EquipmentImage }>(`/equipment/${equipmentId}/images/${imageId}/primary`),
};

// Equipment Specs API
export const equipmentSpecsAPI = {
  getAll: (equipmentId: string) =>
    api.get<{ specs: EquipmentSpec[] }>(`/equipment/${equipmentId}/specs`),
  addOrUpdate: (equipmentId: string, data: { spec_key: string; spec_value?: string; spec_unit?: string; display_order?: number }) =>
    api.post<{ spec: EquipmentSpec }>(`/equipment/${equipmentId}/specs`, data),
  delete: (equipmentId: string, specId: string) =>
    api.delete(`/equipment/${equipmentId}/specs/${specId}`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get<{ users: User[] }>('/users'),
  approve: (userId: string) => api.post('/users/approve', { userId }),
  reject: (userId: string) => api.post('/users/reject', { userId }),
  promote: (userId: string) => api.post('/users/promote', { userId }),
  demote: (userId: string) => api.post('/users/demote', { userId }),
  activate: (userId: string) => api.post('/users/activate', { userId }),
  deactivate: (userId: string) => api.post('/users/deactivate', { userId }),
};

export default api;
