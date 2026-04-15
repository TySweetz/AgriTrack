import apiClient from './client';

export interface Client {
  id: string;
  nom: string;
  telephone?: string;
  adresse?: string;
}

/**
 * Service pour gérer les clients
 */
export const clientsApi = {
  // Récupère tous les clients
  getAll: async (): Promise<Client[]> => {
    const response = await apiClient.get('/clients');
    return response.data;
  },

  // Récupère un client par ID
  getOne: async (id: string): Promise<Client> => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },

  // Crée un nouveau client
  create: async (data: { nom: string; telephone?: string; adresse?: string }): Promise<Client> => {
    const response = await apiClient.post('/clients', data);
    return response.data;
  },

  // Met à jour un client
  update: async (id: string, data: Partial<{ nom: string; telephone: string; adresse: string }>): Promise<Client> => {
    const response = await apiClient.patch(`/clients/${id}`, data);
    return response.data;
  },

  // Supprime un client
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },
};
