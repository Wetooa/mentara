// Export all metadata utilities for easy importing
export * from "./constants";
export * from "./generateMetadata";
export * from "./openGraph";
export * from "./structuredData";

// Re-export commonly used types and functions
export type {
  
  UserProfile,
  
  
} from "./generateMetadata";

;

;

// Main exports for common use cases
export {
  generatePageMetadata,
  generateProfileMetadata,
  generateRoleMetadata,
  
  
  generateMetadataWithStructuredData,
  
} from "./generateMetadata";

;

export {
  
  
  generateHomepageStructuredData,
} from "./structuredData";

export {
  SITE_CONFIG,
  
  
  
  
  
  
} from "./constants";