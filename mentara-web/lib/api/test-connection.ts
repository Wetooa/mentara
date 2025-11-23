/**
 * Test API Connection
 * Run this in browser console to test the connection
 */

import { apiClient } from "./client";

export async function testApiConnection() {
  console.log("=== Testing API Connection ===");
  console.log("Base URL:", apiClient.defaults.baseURL);
  console.log("With Credentials:", apiClient.defaults.withCredentials);
  console.log("Timeout:", apiClient.defaults.timeout);

  try {
    console.log("\n1. Testing health endpoint...");
    const healthResponse = await apiClient.get("/health");
    console.log("✅ Health check successful:", healthResponse.status);
    console.log("Response:", healthResponse.data);

    return { success: true, healthResponse };
  } catch (error: any) {
    console.error("❌ Connection failed:");
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    console.error("Status:", error.status);
    console.error("Details:", error.details);
    
    if (error.request) {
      console.error("Request was made but no response received");
      console.error("Request URL:", error.config?.url);
      console.error("Base URL:", error.config?.baseURL);
    }
    
    return { success: false, error };
  }
}

// Auto-run in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Uncomment to auto-test on page load
  // testApiConnection();
}

