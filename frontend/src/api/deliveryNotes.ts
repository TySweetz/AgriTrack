import apiClient from './client';

export interface DeliveryNoteLine {
  nomProduit: string;
  unite: string;
  quantite: number;
}

export interface DeliveryNote {
  id: string;
  numero_bon: string;
  orderId: string;
  vendeurNom: string;
  acheteurNom: string;
  adresseLivraison?: string;
  items: DeliveryNoteLine[];
  created_at: string;
}

export interface DeliveryNoteDocument {
  printableReference: string;
  printableDate: string;
  signature?: {
    enabled: boolean;
    url: string | null;
  };
  note: DeliveryNote;
}

export const deliveryNotesApi = {
  getAll: async (): Promise<DeliveryNote[]> => {
    const response = await apiClient.get('/delivery-notes');
    return response.data;
  },

  getDocument: async (id: string): Promise<DeliveryNoteDocument> => {
    const response = await apiClient.get(`/delivery-notes/${id}/document`);
    return response.data;
  },

  generate: async (orderId: string): Promise<DeliveryNote> => {
    const response = await apiClient.post(`/delivery-notes/generate/${orderId}`);
    return response.data;
  },
};
