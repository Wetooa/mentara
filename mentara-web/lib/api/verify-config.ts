/**
 * API Configuration Verification
 * Run this in browser console to verify API configuration
 */

export function verifyApiConfig() {
  const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api",
    nodeEnv: process.env.NODE_ENV,
    isClient: typeof window !== "undefined",
  };

  console.log("=== API Configuration ===");
  console.log("Base URL:", config.apiUrl);
  console.log("Environment:", config.nodeEnv);
  console.log("Running on:", config.isClient ? "Client" : "Server");
  const expectedUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api";
  console.log("Expected Backend:", expectedUrl);
  console.log("Match:", config.apiUrl === expectedUrl ? "✅" : "❌");
  console.log("========================");

  return config;
}

// Auto-run in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  verifyApiConfig();
}

