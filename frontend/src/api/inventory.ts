import apiClient from './client';

export interface Inventory {
  id: string;
  nombre_paniers: number;
  poids_moyen_panier: number;
  stock_total_kg: number;
  date: string;
}

const normalizeInventory = (inventory: any): Inventory => ({
  ...inventory,
  nombre_paniers: typeof inventory.nombre_paniers === 'string'
    ? parseInt(inventory.nombre_paniers, 10)
    : inventory.nombre_paniers,
  poids_moyen_panier: typeof inventory.poids_moyen_panier === 'string'
    ? parseFloat(inventory.poids_moyen_panier)
    : inventory.poids_moyen_panier,
  stock_total_kg: typeof inventory.stock_total_kg === 'string'
    ? parseFloat(inventory.stock_total_kg)
    : inventory.stock_total_kg,
});

/**
 * Service pour gérer l'inventaire
 */
export const inventoryApi = {
  // Récupère tous les stocks
  getAll: async (): Promise<Inventory[]> => {
    const response = await apiClient.get('/inventory');
    return response.data.map(normalizeInventory);
  },

  // Récupère un stock par ID
  getOne: async (id: string): Promise<Inventory> => {
    const response = await apiClient.get(`/inventory/${id}`);
    return normalizeInventory(response.data);
  },

  // Crée un nouveau stock
  create: async (data: { nombre_paniers: number; poids_moyen_panier?: number }): Promise<Inventory> => {
    const response = await apiClient.post('/inventory', data);
    return normalizeInventory(response.data);
  },

  // Met à jour un stock
  update: async (id: string, data: Partial<{ nombre_paniers: number; poids_moyen_panier: number }>): Promise<Inventory> => {
    const response = await apiClient.patch(`/inventory/${id}`, data);
    return normalizeInventory(response.data);
  },

  // Supprime un stock
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/inventory/${id}`);
  },
};
