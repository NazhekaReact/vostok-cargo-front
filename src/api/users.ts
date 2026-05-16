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

export async function saveNameRequest(payload: any) {
  const { data } = await api.post('/saveName', payload);
  return data;
}

export async function updateCompanyRequest(payload: any) {
  const { data } = await api.post('/updateCompany', payload);
  return data;
}

export async function uploadProfilePhotoRequest(userId: string, file: any) {
  const formData = new FormData();
  formData.append('photo', file);

  const { data } = await api.post(`/uploadPhoto/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

export async function saveLocationRequest(payload: any) {
  const { data } = await api.post('/save-location', payload);
  return data;
}
