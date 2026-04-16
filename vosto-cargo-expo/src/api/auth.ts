import api from './client';

export async function loginRequest(payload: any) {
  const { data } = await api.post('/login', payload);
  return data;
}

export async function registerRequest(payload: any) {
  const { data } = await api.post('/register', payload);
  return data;
}
