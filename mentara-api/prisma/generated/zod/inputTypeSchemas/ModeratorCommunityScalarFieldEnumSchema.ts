import { z } from 'zod';

export const ModeratorCommunityScalarFieldEnumSchema = z.enum(['id','moderatorId','communityId','assignedAt']);

export default ModeratorCommunityScalarFieldEnumSchema;
