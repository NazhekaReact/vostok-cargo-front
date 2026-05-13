import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.100.20:5051',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;