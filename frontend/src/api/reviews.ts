import apiClient from './client';

export interface Review {
  id: string;
  productId: string;
  acheteurId: string;
  acheteurNom: string;
  note: number;
  commentaire?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsSummary {
  reviews: Review[];
  average: number;
  count: number;
}

export const reviewsApi = {
  getByProduct: (productId: string) =>
    apiClient.get<ReviewsSummary>(`/reviews/product/${productId}`),

  getMine: (productId: string) =>
    apiClient.get<Review | null>(`/reviews/product/${productId}/mine`),

  upsert: (data: { productId: string; note: number; commentaire?: string }) =>
    apiClient.post<Review>('/reviews', data),

  remove: (id: string) => apiClient.delete(`/reviews/${id}`),
};
