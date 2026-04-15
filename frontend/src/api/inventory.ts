import apiClient from './client';

export interface Inventory {
  id: string;
  nombre_paniers: number;
  poids_moyen_panier: number;
  stock_total_kg: number;
  date: string;
}

/**
 * Service pour gérer l'inventaire
 */
export const inventoryApi = {
  // Récupère tous les stocks
  getAll: async (): Promise<Inventory[]> => {
    const response = await apiClient.get('/inventory');
    return response.data;
  },

  // Récupère un stock par ID
  getOne: async (id: string): Promise<Inventory> => {
    const response = await apiClient.get(`/inventory/${id}`);
    return response.data;
  },

  // Crée un nouveau stock
  create: async (data: { nombre_paniers: number; poids_moyen_panier?: number }): Promise<Inventory> => {
    const response = await apiClient.post('/inventory', data);
    return response.data;
  },

  // Met à jour un stock
  update: async (id: string, data: Partial<{ nombre_paniers: number; poids_moyen_panier: number }>): Promise<Inventory> => {
    const response = await apiClient.patch(`/inventory/${id}`, data);
    return response.data;
  },

  // Supprime un stock
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/inventory/${id}`);
  },
};
