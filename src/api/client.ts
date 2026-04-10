import axios from 'axios';
import type { ApiError } from './types';

const client = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    console.log(`🔵 [API Request] ${config.method?.toUpperCase() || 'REQUEST'} ${config.baseURL}${config.url}`, {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      data: config.data,
      params: config.params,
    });
    return config;
  },
  (error) => {
    console.error('🔴 [API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
  (response) => {
    console.log(`🟢 [API Response] ${response.config.method?.toUpperCase() || 'RESPONSE'} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error(`🔴 [API Error] ${error.config?.method?.toUpperCase() || 'REQUEST'} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
        code: error.code,
      });
    } else {
      console.error('🔴 [API Unexpected Error]', error);
    }
    return Promise.reject(error);
  }
);

const toApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const message =
      (typeof error.response?.data?.message === 'string' && error.response.data.message) ||
      error.message ||
      'Request failed';

    return {
      status: error.response?.status,
      message,
      details: error.response?.data,
    };
  }

  return {
    message: 'Unexpected error',
    details: error,
  };
};

export { client, toApiError };
