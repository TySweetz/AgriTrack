const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getPhotoUrl = (photo?: string | null): string | null => {
  if (!photo) return null;
  return photo.startsWith('http') ? photo : `${API_URL}${photo}`;
};
