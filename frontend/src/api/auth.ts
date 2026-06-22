import apiClient from './client';

export interface AuthUser {
  id: string;
  email: string;
  nom: string;
  entreprise?: string;
  role: 'agriculteur' | 'acheteur';
  telephone?: string;
  adresse?: string;
  pseudo?: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    nom: string;
    role?: 'agriculteur' | 'acheteur';
    telephone?: string;
    adresse?: string;
  }) => apiClient.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword }),

  updateMe: (data: { nom?: string; entreprise?: string; telephone?: string; adresse?: string; pseudo?: string }) =>
    apiClient.patch<AuthResponse>('/auth/me', data),

  switchRole: (role: 'agriculteur' | 'acheteur') =>
    apiClient.patch<AuthResponse>('/auth/me/role', { role }),

  getMe: () => apiClient.get<AuthUser>('/auth/me'),

  getPublicVendeur: (id: string) =>
    apiClient.get<{ id: string; nom: string; telephone?: string; adresse?: string }>(
      `/auth/vendeurs/${id}/public`,
    ),
};
