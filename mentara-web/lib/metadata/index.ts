// Export all metadata utilities for easy importing
export * from "./constants";
export * from "./generateMetadata";
export * from "./openGraph";
export * from "./structuredData";

// Re-export commonly used types and functions
export type {
  MetadataOptions,
  UserProfile,
  TherapistProfile,
  NotificationData,
} from "./generateMetadata";

export type {
  OpenGraphOptions,
} from "./openGraph";

export type {
  StructuredDataType,
} from "./structuredData";

// Main exports for common use cases
export {
  generatePageMetadata,
  generateProfileMetadata,
  generateRoleMetadata,
  generateCommunityMetadata,
  generateContentMetadata,
  generateMetadataWithStructuredData,
  updateTitleWithNotifications,
} from "./generateMetadata";

export {
  generateOpenGraphMetadata,
  generateProfileOpenGraph,
  generateCommunityOpenGraph,
  generateArticleOpenGraph,
  generateTwitterMetadata,
  generateTherapistListingOpenGraph,
  optimizeOpenGraphImage,
} from "./openGraph";

export {
  generateStructuredData,
  combineStructuredData,
  generateHomepageStructuredData,
} from "./structuredData";

export {
  SITE_CONFIG,
  DEFAULT_METADATA,
  ROLE_METADATA,
  SIMPLE_NOTIFICATION_CONFIG,
  IMAGE_DIMENSIONS,
  SOCIAL_LINKS,
  ORGANIZATION,
} from "./constants";