import axios from "axios";
import { tokenStorage, userStorage } from "./storage";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log para debug - mostra o que está sendo enviado
  if (config.url?.includes('/presencas')) {
    console.log(`[HTTP ${config.method?.toUpperCase()}] ${config.url}`, config.data);
  }
  
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      tokenStorage.clear();
      userStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);