import api from './client';

export async function getOrdersRequest() {
  const { data } = await api.get('/orders');
  return data;
}

export async function createOrderRequest(payload: any) {
  const { data } = await api.post('/orders', payload);
  return data;
}