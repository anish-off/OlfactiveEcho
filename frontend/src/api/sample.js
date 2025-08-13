import { apiClient } from './http';

export const listSamples = async () => {
  const res = await apiClient.get('/samples');
  return res.data;
};

export const createSample = async (data) => {
  const res = await apiClient.post('/samples', data);
  return res.data;
};
