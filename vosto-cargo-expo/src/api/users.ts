import api from './client';

export async function getUsersRequest() {
  const { data } = await api.get('/getUsers');
  return data;
}

export async function saveThemeRequest(payload: any) {
  const { data } = await api.post('/saveTheme', payload);
  return data;
}

export async function saveLanguageRequest(payload: any) {
  const { data } = await api.post('/saveLang', payload);
  return data;
}

export async function saveLocationRequest(payload: any) {
  const { data } = await api.post('/save-location', payload);
  return data;
}
