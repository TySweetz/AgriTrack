import apiClient from './client';

export interface OrderItem {
  id: string;
  productId: string;
  nomProduit: string;
  prixUnitaire: number;
  unite: string;
  quantite: number;
  sousTotal: number;
}

export interface Order {
  id: string;
  acheteurId: string;
  vendeurId: string;
  statut: 'en_attente' | 'acceptee' | 'refusee' | 'livree';
  total: number;
  adresseLivraison?: string;
  message?: string;
  items: OrderItem[];
  createdAt: string;
  acheteur: { id: string; nom: string; pseudo?: string };
}

export const ordersApi = {
  create: (data: {
    items: { productId: string; quantite: number }[];
    adresseLivraison?: string;
    message?: string;
  }) => apiClient.post<Order>('/orders', data),

  getMine: () => apiClient.get<Order[]>('/orders/mes-commandes'),
  getReceived: () => apiClient.get<Order[]>('/orders/commandes-recues'),
  getOne: (id: string) => apiClient.get<Order>(`/orders/${id}`),
  updateStatus: (id: string, statut: string) =>
    apiClient.patch<Order>(`/orders/${id}/statut`, { statut }),

  getPendingCount: () =>
    apiClient.get<{ count: number }>('/orders/commandes-recues/pending-count'),
};
