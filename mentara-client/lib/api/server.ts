import axios, { AxiosInstance, AxiosError } from "axios";

/**
 * Server-side API utilities for SSR and metadata generation
 * Follows the same patterns as client-side API but adapted for server context
 */

/**
 * Create server-side axios instance for SSR/metadata generation
 * No localStorage dependency, no client-side redirects
 */
function createServerApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Response interceptor - handle backend's standardized response format
  client.interceptors.response.use(
    (response) => {
      // Check if response data has the backend's standardized format
      if (
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data &&
        'data' in response.data
      ) {
        // If success is false, treat as an error
        if (!response.data.success) {
          const error = new Error(response.data.message || 'Request failed');
          return Promise.reject(error);
        }
        
        // Unwrap the data from the backend's standardized format
        response.data = response.data.data;
      }
      
      return response;
    },
    (error: AxiosError) => {
      // Server-side error handling - no redirects, just log and re-throw
      console.error('Server API Error:', error.message);
      return Promise.reject(error);
    }
  );

  return client;
}

// Create server instance
const serverApiClient = createServerApiClient();

/**
 * Server-side Profile API Service
 * Replicates profile service functionality for server-side usage
 */
export const serverProfileApi = {
  /**
   * Get public profile by user ID (server-side compatible)
   */
  async getProfile(userId: string) {
    try {
      const { data } = await serverApiClient.get(`/profile/${userId}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch profile ${userId} on server:`, error);
      return null;
    }
  },
};

/**
 * Server-side Users API Service
 * For endpoints that might be needed for profile metadata
 */
export const serverUsersApi = {
  /**
   * Get user by ID (server-side compatible)
   */
  async getUser(userId: string) {
    try {
      const { data } = await serverApiClient.get(`/users/${userId}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch user ${userId} on server:`, error);
      return null;
    }
  },
};

/**
 * Server-side Therapist API Service
 * For therapist-specific profile data
 */
export const serverTherapistApi = {
  /**
   * Get therapist by ID (server-side compatible)
   */
  async getTherapist(therapistId: string) {
    try {
      const { data } = await serverApiClient.get(`/therapists/${therapistId}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch therapist ${therapistId} on server:`, error);
      return null;
    }
  },
};

/**
 * Helper function to safely handle server-side API calls
 * Provides consistent error handling and logging
 */
export async function safeServerApiCall<T>(
  apiCall: () => Promise<T>,
  fallback: T | null = null
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    console.error('Server API call failed:', error);
    return fallback;
  }
}