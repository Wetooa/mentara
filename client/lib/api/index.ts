// API service for making requests to the NestJS backend
import { useAuth } from "@clerk/nextjs";

const API_BASE_URL = "http://localhost:5000/api";

// Create a reusable API client with authentication
export const createApiClient = (getToken: () => Promise<string | null>) => {
  return {
    // Generic request method
    async request<T>(
      endpoint: string,
      options: {
        method?: string;
        body?: any;
        headers?: Record<string, string>;
        requireAuth?: boolean;
      } = {}
    ): Promise<T> {
      const {
        method = "GET",
        body,
        headers = {},
        requireAuth = true,
      } = options;

      // Build request headers
      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
      };

      // Add auth token if required
      if (requireAuth) {
        const token = await getToken();
        if (token) {
          requestHeaders.Authorization = `Bearer ${token}`;
        }
      }

      // Build request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // Add body if provided
      if (body) {
        requestOptions.body = JSON.stringify(body);
      }

      // Make the request
      const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        requestOptions
      );

      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `API request failed with status ${response.status}`
        );
      }

      // Parse and return the response
      return response.json();
    },

    // User-related API methods
    users: {
      getAll: () => api.request<any[]>("/users"),
      getOne: (id: string) => api.request<any>(`/users/${id}`),
      create: (data: any) =>
        api.request<any>("/users", { method: "POST", body: data }),
      update: (id: string, data: any) =>
        api.request<any>(`/users/${id}`, { method: "PUT", body: data }),
      delete: (id: string) =>
        api.request<any>(`/users/${id}`, { method: "DELETE" }),
      isFirstSignIn: (userId: string) =>
        api.request<{ isFirstSignIn: boolean }>(
          `/users/is-first-signin/${userId}`,
          { requireAuth: false }
        ),
    },

    // Community-related API methods
    communities: {
      getAll: () => api.request<any[]>("/communities"),
      getOne: (id: string) => api.request<any>(`/communities/${id}`),
      create: (data: any) =>
        api.request<any>("/communities", { method: "POST", body: data }),
      update: (id: string, data: any) =>
        api.request<any>(`/communities/${id}`, { method: "PUT", body: data }),
      delete: (id: string) =>
        api.request<any>(`/communities/${id}`, { method: "DELETE" }),
      getByUserId: (userId: string) =>
        api.request<any[]>(`/communities/user/${userId}`),
    },

    // Post-related API methods
    posts: {
      getAll: () => api.request<any[]>("/posts"),
      getOne: (id: string) => api.request<any>(`/posts/${id}`),
      create: (data: any) =>
        api.request<any>("/posts", { method: "POST", body: data }),
      update: (id: string, data: any) =>
        api.request<any>(`/posts/${id}`, { method: "PUT", body: data }),
      delete: (id: string) =>
        api.request<any>(`/posts/${id}`, { method: "DELETE" }),
      getByUserId: (userId: string) =>
        api.request<any[]>(`/posts/user/${userId}`),
      getByCommunityId: (communityId: string) =>
        api.request<any[]>(`/posts/community/${communityId}`),
    },

    // Comment-related API methods
    comments: {
      getAll: () => api.request<any[]>("/comments"),
      getOne: (id: string) => api.request<any>(`/comments/${id}`),
      create: (data: any) =>
        api.request<any>("/comments", { method: "POST", body: data }),
      update: (id: string, data: any) =>
        api.request<any>(`/comments/${id}`, { method: "PUT", body: data }),
      delete: (id: string) =>
        api.request<any>(`/comments/${id}`, { method: "DELETE" }),
    },

    // Therapist application API methods
    therapist: {
      submitApplication: (data: any) =>
        api.request<any>("/therapist/application", {
          method: "POST",
          body: data,
        }),
      getApplications: (
        params: { status?: string; limit?: number; offset?: number } = {}
      ) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append("status", params.status);
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.offset)
          queryParams.append("offset", params.offset.toString());

        const queryString = queryParams.toString()
          ? `?${queryParams.toString()}`
          : "";
        return api.request<any>(`/therapist/application${queryString}`);
      },
      getApplicationById: (id: string) =>
        api.request<any>(`/therapist/application/${id}`),
      updateApplication: (id: string, data: any) =>
        api.request<any>(`/therapist/application/${id}`, {
          method: "PUT",
          body: data,
        }),
    },

    // Admin API methods
    admin: {
      checkAdmin: () => api.request<any>("/auth/admin", { method: "POST" }),
    },
  };
};

// Hook to use the API client in components
export const useApi = () => {
  const { getToken } = useAuth();
  return createApiClient(() => getToken());
};

// For use outside of React components
export const createStandaloneApiClient = (
  getTokenFn: () => Promise<string | null>
) => {
  return createApiClient(getTokenFn);
};

// Create a default instance for non-component usage
const api = createApiClient(async () => null);
export default api;
