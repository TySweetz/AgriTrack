import apiClient from './client';
import { Delivery } from './deliveries';

export interface DashboardData {
  total_stock_kg: number;
  total_vendu_kg: number;
  moyenne_kg_botte: number;
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
    const data = response.data;
    return {
      ...data,
      total_stock_kg: typeof data.total_stock_kg === 'string' ? parseFloat(data.total_stock_kg) : data.total_stock_kg,
      total_vendu_kg: typeof data.total_vendu_kg === 'string' ? parseFloat(data.total_vendu_kg) : data.total_vendu_kg,
      moyenne_kg_botte: typeof data.moyenne_kg_botte === 'string' ? parseFloat(data.moyenne_kg_botte) : data.moyenne_kg_botte,
      livraisons_recentes: data.livraisons_recentes.map((delivery: any) => ({
        ...delivery,
        quantite_kg:
          typeof delivery.quantite_kg === 'string'
            ? parseFloat(delivery.quantite_kg)
            : delivery.quantite_kg,
      })),
    };
  },
};
