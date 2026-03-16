import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://smart-parking-backend-mzru.onrender.com',
  timeout: 10000,
});

// Always attach latest token
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
