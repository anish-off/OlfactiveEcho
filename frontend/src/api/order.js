import { apiClient } from './http';

export const createOrder = async (payload) => {
  const res = await apiClient.post('/orders', payload);
  return res.data;
};

export const myOrders = async () => {
  const res = await apiClient.get('/orders');
  return res.data;
};

export const allOrders = async () => {
  const res = await apiClient.get('/orders/all');
  return res.data;
};
