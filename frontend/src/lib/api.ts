import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: '/api', // Vite proxy handles routing this to localhost:3000
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    // We fetch the latest token from local storage directly as context might be stale in closures
    const storedAuth = localStorage.getItem('auth_user');
    if (storedAuth) {
      try {
        const { token } = JSON.parse(storedAuth);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Failed to parse auth token", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
