import { apiClient } from './http';

export const listPerfumes = async (params = {}) => {
  const res = await apiClient.get('/perfumes', { params });
  return res.data;
};

export const getPerfume = async (id) => {
  const res = await apiClient.get(`/perfumes/${id}`);
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
