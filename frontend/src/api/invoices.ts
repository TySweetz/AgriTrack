import apiClient from './client';
import { Client } from './clients';

export interface Invoice {
  id: string;
  numero_facture: string;
  status: string;
  period_start: string;
  period_end: string;
  total_kg: number;
  prix_unitaire_kg: number;
  montant_ht: number;
  taux_tva: number;
  montant_tva: number;
  montant_ttc: number;
  client_id: string;
  client: Client;
}

export interface InvoiceDocument {
  documentTitle: string;
  printableReference: string;
  printablePeriod: string;
  invoice: Invoice;
}

const normalizeInvoice = (invoice: any): Invoice => ({
  ...invoice,
  total_kg: typeof invoice.total_kg === 'string' ? parseFloat(invoice.total_kg) : invoice.total_kg,
  prix_unitaire_kg: typeof invoice.prix_unitaire_kg === 'string' ? parseFloat(invoice.prix_unitaire_kg) : invoice.prix_unitaire_kg,
  montant_ht: typeof invoice.montant_ht === 'string' ? parseFloat(invoice.montant_ht) : invoice.montant_ht,
  taux_tva: typeof invoice.taux_tva === 'string' ? parseFloat(invoice.taux_tva) : invoice.taux_tva,
  montant_tva: typeof invoice.montant_tva === 'string' ? parseFloat(invoice.montant_tva) : invoice.montant_tva,
  montant_ttc: typeof invoice.montant_ttc === 'string' ? parseFloat(invoice.montant_ttc) : invoice.montant_ttc,
});

export const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => {
    const response = await apiClient.get('/invoices');
    return response.data.map(normalizeInvoice);
  },

  getOne: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get(`/invoices/${id}`);
    return normalizeInvoice(response.data);
  },

  getDocument: async (id: string): Promise<InvoiceDocument> => {
    const response = await apiClient.get(`/invoices/${id}/document`);
    return response.data;
  },

  generateMonthly: async (data: {
    client_id: string;
    period_start: string;
    period_end: string;
    prix_unitaire_kg: number;
    taux_tva: number;
  }): Promise<Invoice> => {
    const response = await apiClient.post('/invoices/generate-monthly', data);
    return normalizeInvoice(response.data);
  },
};