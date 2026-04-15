import api from './client';

export async function getUsersRequest() {
  const { data } = await api.get('/getUsers');
  return data;
}
