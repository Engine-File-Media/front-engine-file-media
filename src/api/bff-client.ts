import axios from 'axios';

const bffBase = import.meta.env.VITE_BFF_BASE_URL || '/bff';

const bffClient = axios.create({
  baseURL: bffBase,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Basic request/response logging similar to main client
bffClient.interceptors.request.use(
  (config) => {
    console.log(`🔵 [BFF Request] ${config.method?.toUpperCase() || 'REQUEST'} ${config.baseURL}${config.url}`, {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      data: config.data,
      params: config.params,
    });
    return config;
  },
  (error) => {
    console.error('🔴 [BFF Request Error]', error);
    return Promise.reject(error);
  },
);

bffClient.interceptors.response.use(
  (response) => {
    console.log(`🟢 [BFF Response] ${response.config.method?.toUpperCase() || 'RESPONSE'} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error(`🔴 [BFF Error] ${error.config?.method?.toUpperCase() || 'REQUEST'} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
        code: error.code,
      });
    } else {
      console.error('🔴 [BFF Unexpected Error]', error);
    }
    return Promise.reject(error);
  },
);

export { bffClient };
export default bffClient;
