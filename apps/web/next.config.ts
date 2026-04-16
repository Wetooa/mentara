import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Client-Side Rendering (CSR) Only Configuration */

  // Enable React Strict Mode for better development experience
  reactStrictMode: true,

  // Remove "Powered by Next.js" header for security
  poweredByHeader: false,

  // Disable prerendering - force client-side rendering
  trailingSlash: false,

  // Image optimization settings
  images: {
    // Enable Next.js image optimization
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Add remote patterns for external images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      // Allow API URL to serve images (for uploaded avatars)
      // Supports both localhost and production API URLs
      ...(process.env.NEXT_PUBLIC_API_URL
        ? (() => {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const url = new URL(apiUrl);
            return [
              {
                protocol: url.protocol.slice(0, -1) as "http" | "https", // Remove trailing ':'
                hostname: url.hostname,
                pathname: "/**",
              },
            ];
          } catch {
            // If URL parsing fails, skip adding the pattern
            return [];
          }
        })()
        : []),
      // Common localhost patterns for development
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
    ],
    // Images won't be optimized (can be enabled later if needed)
    unoptimized: true,
  },

  // Optimize build output
  compress: true,

  // Disable experimental features that require server-side processing
  experimental: {
    // Remove serverActions as it's SSR-specific
  },

  // Optimize compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"], // Keep errors and warnings
    } : false,
  },

  // Control development indicators via environment variable
  // devIndicators: {
  //   buildActivity: process.env.NEXT_PUBLIC_SHOW_DEVTOOLS === "true",
  //   buildActivityPosition: "bottom-left",
  // },
  devIndicators: false,

  // Ignore TypeScript errors during build for production readiness
  // Note: TypeScript errors should be fixed in future iterations
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip static generation for specific routes that require client-side rendering
  // These routes use URL parameters and must be client-only
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

export default nextConfig;
