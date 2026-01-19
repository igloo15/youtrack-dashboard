import axios from 'axios';
import env from '@/config/env';

// Use proxy (/api) if VITE_YOUTRACK_URL is empty, otherwise use full URL
const baseURL = env.VITE_YOUTRACK_URL ? `${env.VITE_YOUTRACK_URL}/api` : '/api';

export const youtrackApi = axios.create({
  baseURL,
  headers: {
    'Authorization': `Bearer ${env.VITE_YOUTRACK_TOKEN}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
youtrackApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);
