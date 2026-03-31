import axios from 'axios';
import type { ApiError } from './types';

const client = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
