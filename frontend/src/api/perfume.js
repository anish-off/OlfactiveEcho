import { apiClient } from './http';

export const listPerfumes = async (params = {}) => {
  const res = await apiClient.get('/perfumes', { params });
  return res.data;
};

export const getPerfume = async (id) => {
  const res = await apiClient.get(`/perfumes/${id}`);
  return res.data;
};

export const getPopularPerfumes = async (limit = 10) => {
  const res = await apiClient.get('/perfumes/popular', { params: { limit } });
  return res.data;
};

export const getNewPerfumes = async (limit = 10) => {
  const res = await apiClient.get('/perfumes/new', { params: { limit } });
  return res.data;
};

export const getBrands = async () => {
  const res = await apiClient.get('/perfumes/brands');
  return res.data;
};

export const getPerfumeStats = async () => {
  const res = await apiClient.get('/perfumes/stats');
  return res.data;
};

export const getPerfumesByBrand = async (brandName) => {
  const res = await apiClient.get(`/perfumes/brand/${encodeURIComponent(brandName)}`);
  return res.data;
};

export const createPerfume = async (data) => {
  const res = await apiClient.post('/perfumes', data);
  return res.data;
};

export const updatePerfume = async (id, data) => {
  const res = await apiClient.put(`/perfumes/${id}`, data);
  return res.data;
};

export const deletePerfume = async (id) => {
  const res = await apiClient.delete(`/perfumes/${id}`);
  return res.data;
};

// Update only image_url or photos for a perfume
export const updatePerfumeImage = async (id, imageData) => {
  const res = await apiClient.patch(`/perfumes/${id}/image`, imageData);
  return res.data;
};
