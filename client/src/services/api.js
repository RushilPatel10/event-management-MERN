import axios from 'axios';

const api = axios.create({
  baseURL: 'https://event-management-mern-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject({
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message || 'An error occurred'
    });
  }
);

export default api;