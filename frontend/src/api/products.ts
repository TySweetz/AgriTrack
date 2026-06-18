import apiClient from './client';

export interface Product {
  id: string;
  nom: string;
  description?: string;
  prix: number;
  unite: string;
  stock: number;
  categorie: string;
  label: string;
  photo?: string;
  actif: boolean;
  vendeurId: string;
  vendeur: { id: string; nom: string; telephone?: string };
  createdAt: string;
}

export const productsApi = {
  getAll: () => apiClient.get<Product[]>('/products'),
  getOne: (id: string) => apiClient.get<Product>(`/products/${id}`),
  getMine: () => apiClient.get<Product[]>('/products/vendeur/mes-produits'),
  create: (data: Partial<Product>) => apiClient.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) => apiClient.patch<Product>(`/products/${id}`, data),
  remove: (id: string) => apiClient.delete(`/products/${id}`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ url: string }>('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
