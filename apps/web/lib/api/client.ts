import axios, { AxiosInstance } from "axios";
import {
  setupRequestInterceptors,
  setupResponseInterceptors,
} from "./interceptors";
import { logger } from "@/lib/logger";

/**
 * API client timeout constant (in milliseconds)
 */
export const API_TIMEOUT = 10000; // 10 seconds (default)

/**
 * Extended timeout for AI/chatbot operations (in milliseconds)
 * AI API calls with Ollama can take 120+ seconds, so we need a longer timeout
 */
export const AI_OPERATION_TIMEOUT = 180000; // 180 seconds (3 minutes) - increased for Ollama performance

/**
 * Create and configure the main API client
 * Enhanced with request tracking and improved error handling
 */
export function createApiClient(): AxiosInstance {
  // Get API URL from environment variable
  // Ensure it ends with /api if not already present
  let baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  // Ensure baseURL ends with /api
  if (!baseURL.endsWith("/api")) {
    // If it ends with a slash, just add 'api', otherwise add '/api'
    baseURL = baseURL.endsWith("/") ? `${baseURL}api` : `${baseURL}/api`;
  }

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
