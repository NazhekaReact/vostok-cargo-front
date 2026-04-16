import api from './client';

export async function updateDriverOrderStatusRequest(orderId: string, status: string) {
  const { data } = await api.patch(`/api/v1/driver/orders/${orderId}/status`, { status });
  return data;
}
