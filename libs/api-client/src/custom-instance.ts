import axios, { AxiosRequestConfig, AxiosError, AxiosInstance } from 'axios';

// Minimalist client for the library to avoid forbidden app-to-lib imports
const createLibClient = (): AxiosInstance => {
  // Orval generates paths with the /api prefix already, so we strip it from the baseURL
  const baseURL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

  return axios.create({

    baseURL,
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const libApiClient = createLibClient();

// Add authentication interceptor
libApiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Clean token (remove quotes if any)
      const sanitizedToken = token.trim().replace(/^["']|["']$/g, '');
      config.headers.Authorization = `Bearer ${sanitizedToken}`;
    }
  }
  return config;
});

export const customInstance = <T>(
  config: AxiosRequestConfig,
): Promise<T> => {
  return libApiClient(config).then((response) => response.data);
};




export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<Body> = Body;
