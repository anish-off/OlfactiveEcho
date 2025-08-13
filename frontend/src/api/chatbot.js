import { apiClient } from './http';

export const sendChatMessage = async (message) => {
  const res = await apiClient.post('/chat', { message });
  return res.data;
};
