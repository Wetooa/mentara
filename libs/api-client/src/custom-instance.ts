import axios, { AxiosRequestConfig, AxiosError, AxiosInstance } from 'axios';

// Minimalist client for the library to avoid forbidden app-to-lib imports
export function normalizeApiBaseURL(raw: string): string {
  let base = raw.replace(/\/$/, '');
  if (!base.endsWith('/api')) {
    base = base.endsWith('/') ? `${base}api` : `${base}/api`;
  }
  return base;
}

const createLibClient = (): AxiosInstance => {
  // Match apps/web: NEXT_PUBLIC_API_URL should end with /api (Nest global prefix).
  const baseURL = normalizeApiBaseURL(
    process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:10000/api',
  );

  return axios.create({

    baseURL,
    timeout: 90_000, // 90s — LLM inference can take 20-30s; give plenty of headroom
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

// Auto-unwrap NestJS global response envelope: { success, data, timestamp }
// Raw pass-throughs (e.g. Flask body from chat/endSession) are returned as-is.
libApiClient.interceptors.response.use((response) => {
  const body = response.data;
  if (
    body !== null &&
    typeof body === 'object' &&
    'success' in body &&
    'data' in body
  ) {
    response.data = body.data;
  }
  return response;
});

export const customInstance = <T>(
  config: AxiosRequestConfig,
): Promise<T> => {
  return libApiClient(config).then((response) => response.data);
};




export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<Body> = Body;
