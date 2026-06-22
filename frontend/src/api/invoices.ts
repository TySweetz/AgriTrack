import apiClient from './client';

export interface InvoiceLine {
  nomProduit: string;
  prixUnitaire: number;
  unite: string;
  quantite: number;
  sousTotal: number;
}

export interface Invoice {
  id: string;
  numero_facture: string;
  orderId: string;
  vendeurNom: string;
  vendeurSiret?: string;
  acheteurNom: string;
  acheteurAdresse?: string;
  items: InvoiceLine[];
  assujetti_tva: boolean;
  taux_tva: number;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  created_at: string;
}

export interface InvoiceDocument {
  printableReference: string;
  printableDate: string;
  signature?: {
    enabled: boolean;
    url: string | null;
  };
  invoice: Invoice;
}

const normalizeInvoice = (invoice: any): Invoice => ({
  ...invoice,
  taux_tva: Number(invoice.taux_tva),
  montant_ht: Number(invoice.montant_ht),
  montant_tva: Number(invoice.montant_tva),
  montant_ttc: Number(invoice.montant_ttc),
});

export const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => {
    const response = await apiClient.get('/invoices');
    return response.data.map(normalizeInvoice);
  },

  getDocument: async (id: string): Promise<InvoiceDocument> => {
    const response = await apiClient.get(`/invoices/${id}/document`);
    return { ...response.data, invoice: normalizeInvoice(response.data.invoice) };
  },

  generate: async (orderId: string): Promise<Invoice> => {
    const response = await apiClient.post(`/invoices/generate/${orderId}`);
    return normalizeInvoice(response.data);
  },
};
