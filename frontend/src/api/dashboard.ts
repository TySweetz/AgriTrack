import apiClient from './client';
import { Delivery } from './deliveries';

export interface DashboardData {
  total_stock_kg: number;
  total_vendu_kg: number;
  moyenne_kg_panier: number;
  livraisons_recentes: Delivery[];
  nombre_livraisons: number;
}

/**
 * Service pour récupérer les données du dashboard
 */
export const dashboardApi = {
  // Récupère les données du dashboard
  getAll: async (): Promise<DashboardData> => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },
};
