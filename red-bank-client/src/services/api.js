import axios from 'axios';
import { auth } from '@/firebase.config';

const baseURL = `${(import.meta.env.VITE_BASE_URL || '').replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

const csrfApi = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

let csrfTokenPromise;
let refreshPromise;

const getCsrfToken = async () => {
  if (!csrfTokenPromise) {
    csrfTokenPromise = csrfApi
      .get('/auth/csrf')
      .then((response) => response.data?.data?.csrfToken)
      .finally(() => {
        csrfTokenPromise = undefined;
      });
  }

  return csrfTokenPromise;
};

api.interceptors.request.use(async (config) => {
  config.headers = config.headers || {};
  const currentUser = auth.currentUser;
  const method = config.method?.toLowerCase();
  const isMutation = method && !['get', 'head', 'options'].includes(method);

  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (isMutation) {
    const csrfToken = await getCsrfToken();
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isSessionBootstrap = [
      '/auth/session',
      '/auth/refresh-token',
      '/auth/create-user',
      '/auth/logout',
      '/auth/csrf',
    ].some((path) => requestUrl.includes(path));

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isSessionBootstrap
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = api
          .post('/auth/refresh-token')
          .finally(() => {
            refreshPromise = undefined;
          });
      }

      try {
        await refreshPromise;
        return api(originalRequest);
      } catch (refreshError) {
        if (window.location.pathname !== '/auth/login') {
          window.location.assign('/auth/login');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
