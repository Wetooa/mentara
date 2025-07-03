// API service for making requests to the NestJS backend
// MIGRATION COMPLETE: This file now uses the new axios-based implementation

import { useApi as useNewApi, createStandaloneApiClient as createNewStandaloneApiClient } from './api-client';

// Export the new axios-based API as the main API
export { useNewApi as useApi, createNewStandaloneApiClient as createStandaloneApiClient };

// Legacy exports for backward compatibility (deprecated)
export { useNewApi as useApiV2, createNewStandaloneApiClient as createStandaloneApiClientV2 };

// Re-export all service types for convenience
export * from './services';
export * from './api-client';