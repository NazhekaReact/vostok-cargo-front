import api from './client';

export async function parseOrderRequest(text: string) {
  const { data } = await api.post('/api/v1/ai/parse', { text });
  return data;
}
