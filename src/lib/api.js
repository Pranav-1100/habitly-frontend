// src/lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://habitly.trou.hackclub.app/api',
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

    const token = localStorage.getItem(process.env.NEXT_PUBLIC_TOKEN_KEY || 'token');
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
      localStorage.removeItem(process.env.NEXT_PUBLIC_TOKEN_KEY || 'token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTHENTICATION API
// ============================================================================
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// ============================================================================
// HABITS API
// ============================================================================
export const habitsApi = {
  getAll: () => api.get('/habits'),
  getById: (id) => api.get(`/habits/${id}`),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
  complete: (id) => api.post(`/habits/${id}/complete`),
  reset: (id) => api.post(`/habits/${id}/reset`),
};

// ============================================================================
// TASKS API
// ============================================================================
export const tasksApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  complete: (id) => api.patch(`/tasks/${id}/complete`),
};

// ============================================================================
// REWARDS & GAMIFICATION API
// ============================================================================
export const rewardsApi = {
  getAll: () => api.get('/rewards'),
  getBadges: () => api.get('/rewards/badges'),
};

// ============================================================================
// CALENDAR INTEGRATION API
// ============================================================================
export const calendarApi = {
  connectGoogle: () => api.get('/calendar/connect/google'),
  connectMicrosoft: () => api.get('/calendar/connect/microsoft'),
  callbackGoogle: (code) => api.get('/calendar/callback/google', { params: { code } }),
  callbackMicrosoft: (code) => api.get('/calendar/callback/microsoft', { params: { code } }),
  sync: () => api.post('/calendar/sync'),
  getEvents: (days = 7) => api.get('/calendar/events', { params: { days } }),
  getEventsInRange: (startDate, endDate) => api.get('/calendar/events/range', { params: { startDate, endDate } }),
  export: (data) => api.post('/calendar/export', data),
  import: (data) => api.post('/calendar/import', data),
  getConnected: () => api.get('/calendar/connected'),
  disconnect: (provider) => api.delete(`/calendar/disconnect/${provider}`),
};

// ============================================================================
// ANALYTICS API
// ============================================================================
export const analyticsApi = {
  getOverall: (timeRange = '30days') => api.get('/analytics', { params: { timeRange } }),
  getWeeklyComparison: () => api.get('/analytics/weekly-comparison'),
  getHabits: (timeRange = '30days') => api.get('/analytics/habits', { params: { timeRange } }),
  getTasks: (timeRange = '30days') => api.get('/analytics/tasks', { params: { timeRange } }),
  getProductivityScore: (date) => api.get('/analytics/productivity-score', { params: { date } }),
};

// ============================================================================
// TEMPLATES API
// ============================================================================
export const templatesApi = {
  getAll: () => api.get('/templates'),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  use: (id) => api.post(`/templates/${id}/use`),
  delete: (id) => api.delete(`/templates/${id}`),
};

// ============================================================================
// CATEGORIES API
// ============================================================================
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  addToHabit: (categoryId, habitId) => api.post(`/categories/${categoryId}/habits/${habitId}`),
  removeFromHabit: (categoryId, habitId) => api.delete(`/categories/${categoryId}/habits/${habitId}`),
};

// ============================================================================
// TAGS API
// ============================================================================
export const tagsApi = {
  getAll: () => api.get('/tags'),
  create: (data) => api.post('/tags', data),
  update: (id, data) => api.put(`/tags/${id}`, data),
  delete: (id) => api.delete(`/tags/${id}`),
  addToHabit: (tagId, habitId) => api.post(`/tags/${tagId}/habits/${habitId}`),
  removeFromHabit: (tagId, habitId) => api.delete(`/tags/${tagId}/habits/${habitId}`),
  addToTask: (tagId, taskId) => api.post(`/tags/${tagId}/tasks/${taskId}`),
  removeFromTask: (tagId, taskId) => api.delete(`/tags/${tagId}/tasks/${taskId}`),
};

// ============================================================================
// SUBTASKS API
// ============================================================================
export const subtasksApi = {
  getByTask: (taskId) => api.get(`/subtasks/task/${taskId}`),
  create: (data) => api.post('/subtasks', data),
  update: (id, data) => api.put(`/subtasks/${id}`, data),
  toggle: (id) => api.patch(`/subtasks/${id}/toggle`),
  delete: (id) => api.delete(`/subtasks/${id}`),
};

// ============================================================================
// NOTES API
// ============================================================================
export const notesApi = {
  getByEntity: (entityType, entityId) => api.get('/notes', { params: { entity_type: entityType, entity_id: entityId } }),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

// ============================================================================
// JOURNAL API
// ============================================================================
export const journalApi = {
  getToday: () => api.get('/journal/today'),
  getByDate: (date) => api.get(`/journal/date/${date}`),
  getRecent: (limit = 10) => api.get('/journal/recent', { params: { limit } }),
  getRange: (startDate, endDate) => api.get('/journal/range', { params: { startDate, endDate } }),
  create: (data) => api.post('/journal', data),
  update: (date, data) => api.put(`/journal/${date}`, data),
  delete: (date) => api.delete(`/journal/${date}`),
  getMoodStats: (days = 30) => api.get('/journal/stats/mood', { params: { days } }),
};

// ============================================================================
// TIME TRACKING API
// ============================================================================
export const timeApi = {
  start: (data) => api.post('/time/start', data),
  stop: (id) => api.patch(`/time/${id}/stop`),
  getByEntity: (entityType, entityId) => api.get('/time', { params: { entity_type: entityType, entity_id: entityId } }),
  getActive: () => api.get('/time/active'),
  getStats: (days = 30) => api.get('/time/stats', { params: { days } }),
  delete: (id) => api.delete(`/time/${id}`),
};

// ============================================================================
// STREAK FREEZE API
// ============================================================================
export const freezesApi = {
  create: (data) => api.post('/freezes', data),
  getByHabit: (habitId) => api.get(`/freezes/habit/${habitId}`),
  getAvailable: () => api.get('/freezes/available'),
  delete: (id) => api.delete(`/freezes/${id}`),
};

// ============================================================================
// CUSTOM REWARDS API
// ============================================================================
export const customRewardsApi = {
  getAll: () => api.get('/custom-rewards'),
  getAvailable: () => api.get('/custom-rewards/available'),
  create: (data) => api.post('/custom-rewards', data),
  update: (id, data) => api.put(`/custom-rewards/${id}`, data),
  redeem: (id) => api.post(`/custom-rewards/${id}/redeem`),
  delete: (id) => api.delete(`/custom-rewards/${id}`),
};

// ============================================================================
// DATA EXPORT API
// ============================================================================
export const exportApi = {
  toJSON: () => api.get('/export/json'),
  toCSV: (type) => api.get(`/export/csv/${type}`),
  getInfo: () => api.get('/export/info'),
};

export default api;
