import apiClient from './client';

export interface Inventory {
  id: string;
  nombre_bottes: number;
  poids_moyen_botte: number;
  nombre_paniers?: number;
  poids_moyen_panier?: number;
  stock_total_kg: number;
  date: string;
}

export interface InventorySnapshot {
  id: string;
  date: string;
  stock_restant_kg: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const normalizeInventory = (inventory: any): Inventory => ({
  ...inventory,
  nombre_bottes: typeof inventory.nombre_bottes === 'string'
    ? parseInt(inventory.nombre_bottes, 10)
    : inventory.nombre_bottes ?? inventory.nombre_paniers,
  poids_moyen_botte: typeof inventory.poids_moyen_botte === 'string'
    ? parseFloat(inventory.poids_moyen_botte)
    : inventory.poids_moyen_botte ?? inventory.poids_moyen_panier,
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
  create: async (data: { nombre_bottes: number; poids_moyen_botte?: number; date?: string }): Promise<Inventory> => {
    const response = await apiClient.post('/inventory', data);
    return normalizeInventory(response.data);
  },

  // Met à jour un stock
  update: async (id: string, data: Partial<{ nombre_bottes: number; poids_moyen_botte: number; date: string }>): Promise<Inventory> => {
    const response = await apiClient.patch(`/inventory/${id}`, data);
    return normalizeInventory(response.data);
  },

  // Supprime un stock
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/inventory/${id}`);
  },
};

const normalizeSnapshot = (snapshot: any): InventorySnapshot => ({
  ...snapshot,
  stock_restant_kg: typeof snapshot.stock_restant_kg === 'string'
    ? parseFloat(snapshot.stock_restant_kg)
    : snapshot.stock_restant_kg,
});

export const inventorySnapshotsApi = {
  getAll: async (): Promise<InventorySnapshot[]> => {
    const response = await apiClient.get('/inventory-snapshots');
    return response.data.map(normalizeSnapshot);
  },

  getLatest: async (limit: number = 7): Promise<InventorySnapshot[]> => {
    const response = await apiClient.get(`/inventory-snapshots/latest/${limit}`);
    return response.data.map(normalizeSnapshot);
  },

  create: async (data: { date: string; stock_restant_kg: number; notes?: string }): Promise<InventorySnapshot> => {
    const response = await apiClient.post('/inventory-snapshots', data);
    return normalizeSnapshot(response.data);
  },
};
