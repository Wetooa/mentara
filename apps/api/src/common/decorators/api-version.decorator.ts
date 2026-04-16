import { SetMetadata } from '@nestjs/common';

export const API_VERSION_KEY = 'api_version';

/**
 * Decorator to mark API endpoints with version
 * Usage: @ApiVersion('v1')
 */
export const ApiVersion = (version: string) => SetMetadata(API_VERSION_KEY, version);


