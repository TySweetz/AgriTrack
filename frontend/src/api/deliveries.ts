import apiClient from './client';
import { Client } from './clients';

export interface Delivery {
  id: string;
  date: string;
  lieu: string;
  quantite_kg: number;
  numero_bon: string;
  document_status: string;
  client_id: string;
  client: Client;
}

export interface DeliveryDocument {
  documentTitle: string;
  printableReference: string;
  printableDate: string;
  delivery: Delivery;
}

const normalizeDelivery = (delivery: any): Delivery => ({
  ...delivery,
  quantite_kg: typeof delivery.quantite_kg === 'string'
    ? parseFloat(delivery.quantite_kg)
    : delivery.quantite_kg,
});

/**
 * Service pour gérer les livraisons
 */
export const deliveriesApi = {
  // Récupère toutes les livraisons
  getAll: async (): Promise<Delivery[]> => {
    const response = await apiClient.get('/deliveries');
    return response.data.map(normalizeDelivery);
  },

  // Récupère une livraison par ID
  getOne: async (id: string): Promise<Delivery> => {
    const response = await apiClient.get(`/deliveries/${id}`);
    return normalizeDelivery(response.data);
  },

  // Récupère les données de document imprimable
  getDocument: async (id: string): Promise<DeliveryDocument> => {
    const response = await apiClient.get(`/deliveries/${id}/document`);
    return response.data;
  },

  // Crée une nouvelle livraison
  create: async (data: { date: string; lieu: string; quantite_kg: number; client_id: string }): Promise<Delivery> => {
    const response = await apiClient.post('/deliveries', data);
    return normalizeDelivery(response.data);
  },

  // Met à jour une livraison
  update: async (id: string, data: Partial<{ date: string; lieu: string; quantite_kg: number; client_id: string }>): Promise<Delivery> => {
    const response = await apiClient.patch(`/deliveries/${id}`, data);
    return normalizeDelivery(response.data);
  },

  // Supprime une livraison
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/deliveries/${id}`);
  },
};
