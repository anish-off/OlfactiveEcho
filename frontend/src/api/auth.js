import { apiClient, setAuthToken } from './http';

export const register = async (data) => {
  const res = data instanceof FormData
    ? await apiClient.post('/auth/register', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : await apiClient.post('/auth/register', data);
  if (res.data.token) setAuthToken(res.data.token);
  return res.data;
};

export const login = async (data) => {
  const res = await apiClient.post('/auth/login', data);
  if (res.data.token) setAuthToken(res.data.token);
  return res.data;
};

export const me = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data;
};

export const logout = () => setAuthToken(null);
