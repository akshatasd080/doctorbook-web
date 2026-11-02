import { apiRequest } from './client';

export const adminApi = {
  login: (email, password) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  me: () => apiRequest('/api/auth/me'),

  stats: () => apiRequest('/api/admin/stats'),

  doctors: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return apiRequest(`/api/admin/doctors${qs ? `?${qs}` : ''}`);
  },

  pendingDoctors: () => apiRequest('/api/admin/doctors/pending'),

  doctor: (id) => apiRequest(`/api/admin/doctors/${id}`),

  approveDoctor: (id) =>
    apiRequest(`/api/admin/doctors/${id}/approve`, { method: 'PATCH' }),

  rejectDoctor: (id, reason) =>
    apiRequest(`/api/admin/doctors/${id}/reject`, {
      method: 'PATCH',
      body: { reason },
    }),

  patients: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return apiRequest(`/api/admin/patients${qs ? `?${qs}` : ''}`);
  },

  appointments: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return apiRequest(`/api/admin/appointments${qs ? `?${qs}` : ''}`);
  },

  deactivateUser: (id) =>
    apiRequest(`/api/admin/users/${id}/deactivate`, { method: 'PATCH' }),

  activateUser: (id) =>
    apiRequest(`/api/admin/users/${id}/activate`, { method: 'PATCH' }),
};
