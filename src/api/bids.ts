import api from './client';

export async function placeBidRequest(orderId: string, payload: any) {
  const { data } = await api.post(`/api/v1/orders/${orderId}/bids`, payload);
  return data;
}

export async function acceptBidRequest(orderId: string, bidId: string) {
  const { data } = await api.post(`/api/v1/orders/${orderId}/bids/${bidId}/accept`);
  return data;
}
