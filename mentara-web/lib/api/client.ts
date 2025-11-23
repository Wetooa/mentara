import axios, { AxiosInstance } from "axios";
import {
  setupRequestInterceptors,
  setupResponseInterceptors,
} from "./interceptors";
import { logger } from "@/lib/logger";

/**
 * API client timeout constant (in milliseconds)
 */
export const API_TIMEOUT = 10000; // 10 seconds

/**
 * Create and configure the main API client
 * Enhanced with request tracking and improved error handling
 */
export function createApiClient(): AxiosInstance {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  
  // Log API URL in development for debugging
  if (typeof window !== "undefined") {
    logger.debug("[API Client] Base URL:", baseURL);
  }
  
  const client = axios.create({
    baseURL,
    timeout: API_TIMEOUT,
    withCredentials: true, // Required for CORS with credentials
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Setup enhanced interceptors
  setupRequestInterceptors(client);
  setupResponseInterceptors(client);

  return client;
}

// Export the default client instance
export const apiClient = createApiClient();
