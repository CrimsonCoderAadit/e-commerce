import axios from 'axios';

// Module-level token store.
// AuthContext calls setToken() after login/refresh/logout.
// The request interceptor below reads it synchronously on every request.
let accessToken = sessionStorage.getItem('accessToken') || null;
export const setToken = (token) => {
  accessToken = token;
  if (token) {
    sessionStorage.setItem('accessToken', token);
  } else {
    sessionStorage.removeItem('accessToken');
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // sends the httpOnly refreshToken cookie automatically
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = 'Bearer ' + accessToken;
  }
  return config;
});

export default api;
