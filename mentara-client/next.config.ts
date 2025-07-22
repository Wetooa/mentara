import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Client-Side Rendering (CSR) Only Configuration */
  
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Remove "Powered by Next.js" header for security
  poweredByHeader: false,
  
  // Disable prerendering - force client-side rendering
  trailingSlash: false,
  
  // Ensure output is for standalone deployment (CSR compatible)
  output: 'standalone',
  
  // Image optimization settings for CSR
  images: {
    unoptimized: true, // Disable server-side image optimization
  },
  
  // Disable experimental features that require server-side processing
  experimental: {
    // Remove serverActions as it's SSR-specific
  },
};

export default nextConfig;
