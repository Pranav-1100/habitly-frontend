// src/lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests except login/register
api.interceptors.request.use(
  (config) => {
    // Don't add token for auth endpoints
    if (config.url.includes('/auth/')) {
      return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', {
    email: data.email,
    password: data.password
  }),
  register: (data) => api.post('/auth/register', {
    username: data.username,
    email: data.email,
    password: data.password
  }),
};

export const habitsApi = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  complete: (id) => api.post(`/habits/${id}/complete`),
};

export const tasksApi = {
  getAll: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data),
  complete: (id, data) => api.patch(`/tasks/${id}/complete`, data),
};

export const analyticsApi = {
  getProductivityScore: () => api.get('/analytics/productivity-score'),
  getWeeklyComparison: () => api.get('/analytics/weekly-comparison'),
  getOverall: (timeRange = '30days') => api.get(`/analytics?timeRange=${timeRange}`),
};


export const calendarApi = {
  connectGoogle: () => api.get('/calendar/connect/google'),
  connectMicrosoft: () => api.get('/calendar/connect/microsoft'),
  sync: () => api.post('/calendar/sync'),
  import: (data) => api.post('/calendar/import', data),
  getEvents: (days = 7) => api.get('/calendar/events', { params: { days } }),
};

export default api;


  