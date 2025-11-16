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
  
  // Log para debug assistidos
  if (config.url?.includes('/assistidos')) {
    console.log(`🌐 [HTTP ${config.method?.toUpperCase()}] ${config.url}`);
    console.log('🌐 [HTTP] config.data ANTES:', config.data);
    console.log('🌐 [HTTP] config.data type:', typeof config.data);
    if (config.data?.endereco) {
      console.log('🌐 [HTTP] endereco type:', typeof config.data.endereco);
      console.log('🌐 [HTTP] endereco value:', config.data.endereco);
    }
  }
  
  // Log para debug - mostra o que está sendo enviado
  if (config.url?.includes('/presencas')) {
    console.log(`[HTTP ${config.method?.toUpperCase()}] ${config.url}`, config.data);
  }
  
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err: any) => {
    // Log detalhado de erros 400 para debug em produção
    if (err.response?.status === 400) {
      console.error('❌ Erro 400 - Bad Request:', {
        url: err.config?.url,
        method: err.config?.method,
        data: err.config?.data,
        params: err.config?.params,
        response: err.response?.data,
      });
    }

    // Log detalhado de erros 500 para debug em produção
    if (err.response?.status === 500) {
      console.error('❌ Erro 500 - Internal Server Error:', {
        url: err.config?.url,
        method: err.config?.method,
        data: err.config?.data,
        params: err.config?.params,
        response: err.response?.data,
      });
    }

    if (err.response?.status === 401) {
      const url = String(err.config?.url || "").toLowerCase();
      if (url.includes('/usuarios/login')) {
        return Promise.reject(err);
      }

      try {
        tokenStorage.clear();
        userStorage.clear();
        const detail = { message: (err.response?.data as any)?.mensagem };
        window.dispatchEvent(new CustomEvent('session:expired', { detail }));
      } catch (e) {
        console.error('Erro ao emitir evento session:expired', e);
      }
    }

    return Promise.reject(err);
  }
);