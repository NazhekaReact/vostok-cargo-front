import api from './client';

export async function getVehiclesRequest(ownerId: string) {
  const { data } = await api.get('/api/v1/fleet/vehicles', { params: { ownerId } });
  return data;
}

export async function addVehicleRequest(payload: any) {
  const { data } = await api.post('/api/v1/fleet/vehicles', payload);
  return data;
}

export async function assignDriverToVehicleRequest(payload: any) {
  const { data } = await api.post('/api/v1/fleet/vehicles/assign-driver', payload);
  return data;
}

export async function getDriversRequest(logisticianId: string) {
  const { data } = await api.get('/api/v1/fleet/drivers', {
    params: { logisticianId },
  });
  return data;
}

export async function addDriverRequest(payload: any) {
  const { data } = await api.post('/api/v1/fleet/drivers', payload);
  return data;
}

export async function assignOrderRequest(orderId: string, payload: any) {
  const { data } = await api.patch(`/api/v1/orders/${orderId}/assign`, payload);
  return data;
}
