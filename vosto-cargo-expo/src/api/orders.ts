import api from './client';

export async function getOrdersRequest(params = {}) {
  const { data } = await api.get('/orders', { params });
  return data;
}

export async function createOrderRequest(payload: any) {
  const { data } = await api.post('/orders', payload);
  return data;
}

export async function getOrderByIdRequest(id: string) {
  const { data } = await api.get(`/api/v1/orders/${id}`);
  return data;
}
