import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 检查是否是登录接口的401错误，如果是则不触发会话过期处理
      const isLoginRequest = error.config?.url?.includes('/auth/login');

      if (!isLoginRequest) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
};

// Users API
export const usersAPI = {
  getAllUsers: () => api.get('/users'),
  createUser: (data: any) => api.post('/users', data),
  updateUser: (id: string, data: any) => api.patch(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Rooms API
export const roomsAPI = {
  getAllRooms: () => api.get('/rooms'),
  searchRooms: (params: any) => api.get('/rooms/search', { params }),
  createRoom: (data: any) => api.post('/rooms', data),
  updateRoom: (id: string, data: any) => api.patch(`/rooms/${id}`, data),
  deleteRoom: (id: string) => api.delete(`/rooms/${id}`),
};

export default api;
