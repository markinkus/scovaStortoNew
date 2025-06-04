// api.ts
import axios from 'axios';

const API_BASE_URL = '/api'; // Vite proxy

const apiClient = axios.create({
  baseURL: API_BASE_URL,
// -  headers: {
// -    'Content-Type': 'application/json',
// -  },
});

// Interceptor per aggiungere JWT se presente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// GET rimane uguale
export const get = async <T>(url: string, params?: object): Promise<T> => {
  try {
    const response = await apiClient.get<T>(url, { params });
    return response.data;
  } catch (error) {
    console.error(`GET ${url} failed:`, error);
    throw error;
  }
};

// POST: rimuoviamo l’header “Content-Type” di default
export const post = async <T>(url: string, data: any): Promise<T> => {
  try {
    // Se data è FormData, non impostare manualmente Content-Type
    let config = {};
    if (data instanceof FormData) {
      config = {
        headers: {
          // Lasciare che Axios imposti multipart/form-data+boundary
          'Content-Type': 'multipart/form-data',
        },
      };
    }
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`POST ${url} failed:`, error);
    throw error;
  }
};

// PUT e DELETE rimangono inalterati (se non usano FormData)
export const put = async <T>(url: string, data: any): Promise<T> => {
  try {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  } catch (error) {
    console.error(`PUT ${url} failed:`, error);
    throw error;
  }
};

export const del = async <T>(url: string): Promise<T> => {
  try {
    const response = await apiClient.delete<T>(url);
    return response.data;
  } catch (error) {
    console.error(`DELETE ${url} failed:`, error);
    throw error;
  }
};

export default apiClient;
