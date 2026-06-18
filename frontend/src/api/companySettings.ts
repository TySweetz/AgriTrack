import apiClient from './client';

export interface CompanySettings {
  id: string;
  company_name: string | null;
  signature_enabled_delivery: boolean;
  signature_enabled_invoice: boolean;
  signature_url: string | null;
  signature_file_name: string | null;
  updated_at: string;
  created_at: string;
}

export const companySettingsApi = {
  get: async (): Promise<CompanySettings> => {
    const response = await apiClient.get('/company-settings');
    return response.data;
  },

  update: async (data: Partial<Pick<CompanySettings, 'company_name' | 'signature_enabled_delivery' | 'signature_enabled_invoice'>>): Promise<CompanySettings> => {
    const response = await apiClient.patch('/company-settings', data);
    return response.data;
  },

  uploadSignature: async (file: File): Promise<CompanySettings> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/company-settings/signature', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  removeSignature: async (): Promise<CompanySettings> => {
    const response = await apiClient.delete('/company-settings/signature');
    return response.data;
  },
};
