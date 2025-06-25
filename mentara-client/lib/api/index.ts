// API service for making requests to the NestJS backend
import { useAuth } from "@clerk/nextjs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create a reusable API client with authentication
export const createApiClient = (getToken: () => Promise<string | null>) => {
  // Create the client instance
  const client = {
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
        console.log("Token for request:", token ? "Token exists" : "No token");
        if (token) {
          requestHeaders.Authorization = `Bearer ${token}`;
        } else {
          console.warn("No auth token available for request to:", endpoint);
        }
      }

      // Build request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        credentials: "include", // Include credentials for cross-origin requests
      };

      // Add body if provided
      if (body) {
        requestOptions.body = JSON.stringify(body);
      }

      console.log(`Making ${method} request to ${API_BASE_URL}${endpoint}`);

      // Make the request
      const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        requestOptions
      );

      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          endpoint,
        });
        throw new Error(
          errorData.error || `API request failed with status ${response.status}`
        );
      }

      // Parse and return the response
      return response.json();
    },

    // User-related API methods
    users: {
      getAll: () => client.request<any[]>("/users"),
      getOne: (id: string) => client.request<any>(`/users/${id}`),
      create: (data: any) =>
        client.request<any>("/users", { method: "POST", body: data }),
      update: (id: string, data: any) =>
        client.request<any>(`/users/${id}`, { method: "PUT", body: data }),
      delete: (id: string) =>
        client.request<any>(`/users/${id}`, { method: "DELETE" }),
      isFirstSignIn: (userId: string) =>
        client.request<{ isFirstSignIn: boolean }>(
          `/users/is-first-signin/${userId}`,
          { requireAuth: false }
        ),
    },

    // Community-related API methods
    communities: {
      getAll: () => client.request<any[]>("/communities"),
      getOne: (id: string) => client.request<any>(`/communities/${id}`),
      create: (data: any) =>
        client.request<any>("/communities", { method: "POST", body: data }),
      update: (id: string, data: any) =>
        client.request<any>(`/communities/${id}`, {
          method: "PUT",
          body: data,
        }),
      delete: (id: string) =>
        client.request<any>(`/communities/${id}`, { method: "DELETE" }),
      getByUserId: (userId: string) =>
        client.request<any[]>(`/communities/user/${userId}`),
    },

    // Post-related API methods
    posts: {
      getAll: () => client.request<any[]>("/posts"),
      getOne: (id: string) => client.request<any>(`/posts/${id}`),
      create: (data: any) =>
        client.request<any>("/posts", { method: "POST", body: data }),
      update: (id: string, data: any) =>
        client.request<any>(`/posts/${id}`, { method: "PUT", body: data }),
      delete: (id: string) =>
        client.request<any>(`/posts/${id}`, { method: "DELETE" }),
      getByUserId: (userId: string) =>
        client.request<any[]>(`/posts/user/${userId}`),
      getByCommunityId: (communityId: string) =>
        client.request<any[]>(`/posts/community/${communityId}`),
    },

    // Comment-related API methods
    comments: {
      getAll: () => client.request<any[]>("/comments"),
      getOne: (id: string) => client.request<any>(`/comments/${id}`),
      create: (data: any) =>
        client.request<any>("/comments", { method: "POST", body: data }),
      update: (id: string, data: any) =>
        client.request<any>(`/comments/${id}`, { method: "PUT", body: data }),
      delete: (id: string) =>
        client.request<any>(`/comments/${id}`, { method: "DELETE" }),
    },

    // Therapist application API methods
    therapist: {
      submitApplication: (data: any) =>
        client.request<any>("/therapist/application", {
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
        return client.request<any>(`/therapist/application${queryString}`);
      },
      getApplicationById: (id: string) =>
        client.request<any>(`/therapist/application/${id}`),
      updateApplication: (id: string, data: any) =>
        client.request<any>(`/therapist/application/${id}`, {
          method: "PUT",
          body: data,
        }),
    },

    // Admin API methods
    admin: {
      checkAdmin: () => client.request<any>("/auth/admin", { method: "POST" }),
    },

    // Therapist recommendation API methods
    therapistRecommendations: {
      getRecommendations: (params: {
        limit?: number;
        includeInactive?: boolean;
        province?: string;
        maxHourlyRate?: number;
      } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.includeInactive !== undefined) 
          queryParams.append("includeInactive", params.includeInactive.toString());
        if (params.province) queryParams.append("province", params.province);
        if (params.maxHourlyRate) 
          queryParams.append("maxHourlyRate", params.maxHourlyRate.toString());

        const queryString = queryParams.toString()
          ? `?${queryParams.toString()}`
          : "";
        return client.request<any>(`/therapist-recommendations${queryString}`);
      },
    },

    // Booking API methods
    booking: {
      createMeeting: (data: {
        therapistId: string;
        startTime: string;
        endTime: string;
        duration: number;
        title?: string;
        description?: string;
        meetingType?: string;
      }) => client.request<any>("/booking/meetings", { method: "POST", body: data }),
      
      getMeetings: () => client.request<any[]>("/booking/meetings"),
      
      getMeeting: (id: string) => client.request<any>(`/booking/meetings/${id}`),
      
      updateMeeting: (id: string, data: {
        status?: string;
        notes?: string;
        meetingUrl?: string;
      }) => client.request<any>(`/booking/meetings/${id}`, { method: "PUT", body: data }),
      
      cancelMeeting: (id: string) => 
        client.request<any>(`/booking/meetings/${id}/cancel`, { method: "DELETE" }),
      
      getAvailableSlots: (therapistId: string, date: string) => {
        const queryParams = new URLSearchParams();
        queryParams.append("therapistId", therapistId);
        queryParams.append("date", date);
        return client.request<any>(`/booking/slots?${queryParams.toString()}`);
      },
      
      getDurations: () => client.request<any[]>("/booking/durations"),
    },

    // Reviews API methods
    reviews: {
      create: (data: {
        rating: number;
        title?: string;
        content?: string;
        therapistId: string;
        meetingId?: string;
        isAnonymous?: boolean;
      }) => client.request<any>("/reviews", { method: "POST", body: data }),
      
      update: (id: string, data: {
        rating?: number;
        title?: string;
        content?: string;
        isAnonymous?: boolean;
      }) => client.request<any>(`/reviews/${id}`, { method: "PUT", body: data }),
      
      delete: (id: string) => 
        client.request<any>(`/reviews/${id}`, { method: "DELETE" }),
      
      getAll: (params: {
        therapistId?: string;
        clientId?: string;
        status?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: string;
        rating?: number;
      } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.therapistId) queryParams.append("therapistId", params.therapistId);
        if (params.clientId) queryParams.append("clientId", params.clientId);
        if (params.status) queryParams.append("status", params.status);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.sortBy) queryParams.append("sortBy", params.sortBy);
        if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
        if (params.rating) queryParams.append("rating", params.rating.toString());
        
        const queryString = queryParams.toString()
          ? `?${queryParams.toString()}`
          : "";
        return client.request<any>(`/reviews${queryString}`);
      },
      
      getTherapistReviews: (therapistId: string, params: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: string;
        rating?: number;
      } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.sortBy) queryParams.append("sortBy", params.sortBy);
        if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
        if (params.rating) queryParams.append("rating", params.rating.toString());
        
        const queryString = queryParams.toString()
          ? `?${queryParams.toString()}`
          : "";
        return client.request<any>(`/reviews/therapist/${therapistId}${queryString}`);
      },
      
      getTherapistStats: (therapistId: string) => 
        client.request<any>(`/reviews/therapist/${therapistId}/stats`),
      
      markHelpful: (reviewId: string) => 
        client.request<any>(`/reviews/${reviewId}/helpful`, { method: "POST" }),
      
      moderate: (reviewId: string, data: {
        status: string;
        moderationNote?: string;
      }) => client.request<any>(`/reviews/${reviewId}/moderate`, { method: "POST", body: data }),
      
      getPending: (params: {
        page?: number;
        limit?: number;
      } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        
        const queryString = queryParams.toString()
          ? `?${queryParams.toString()}`
          : "";
        return client.request<any>(`/reviews/pending${queryString}`);
      },
    },
  };

  return client;
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
