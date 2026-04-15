import apiClient from './client';
import { Client } from './clients';

export interface Delivery {
  id: string;
  date: string;
  lieu: string;
  quantite_kg: number;
  client_id: string;
  client: Client;
}

/**
 * Service pour gérer les livraisons
 */
export const deliveriesApi = {
  // Récupère toutes les livraisons
  getAll: async (): Promise<Delivery[]> => {
    const response = await apiClient.get('/deliveries');
    return response.data;
  },

  // Récupère une livraison par ID
  getOne: async (id: string): Promise<Delivery> => {
    const response = await apiClient.get(`/deliveries/${id}`);
    return response.data;
  },

  // Crée une nouvelle livraison
  create: async (data: { date: string; lieu: string; quantite_kg: number; client_id: string }): Promise<Delivery> => {
    const response = await apiClient.post('/deliveries', data);
    return response.data;
  },

  // Met à jour une livraison
  update: async (id: string, data: Partial<{ date: string; lieu: string; quantite_kg: number; client_id: string }>): Promise<Delivery> => {
    const response = await apiClient.patch(`/deliveries/${id}`, data);
    return response.data;
  },

  // Supprime une livraison
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/deliveries/${id}`);
  },
};
