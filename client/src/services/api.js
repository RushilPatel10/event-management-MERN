import axios from 'axios';

const api = axios.create({
  baseURL: 'https://event-management-mern-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    console.log('Making request to:', config.url); // Debug log
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    console.log('Received response:', response.data); // Debug log
    return response;
  },
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Format error message
    const errorMessage = error.response?.data?.message 
      || error.message 
      || 'An unexpected error occurred';

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status
    });
  }
);

export default api;