import apiClient from './client';

export interface TopProduct {
  nom: string;
  unite: string;
  quantite: number;
  revenue: number;
}

export interface LowStockProduct {
  id: string;
  nom: string;
  stock: number;
  unite: string;
}

export interface RecentOrder {
  id: string;
  acheteurNom: string;
  total: number;
  statut: 'en_attente' | 'acceptee' | 'refusee' | 'livree';
  createdAt: string;
  itemsCount: number;
}

export interface DashboardData {
  totalRevenue: number;
  ordersConfirmedCount: number;
  pendingOrdersCount: number;
  activeProductsCount: number;
  totalProductsCount: number;
  companyRating: { average: number; count: number };
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
  recentOrders: RecentOrder[];
  salesByDay: { date: string; total: number }[];
}

export const dashboardApi = {
  getAll: async (): Promise<DashboardData> => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },
};
