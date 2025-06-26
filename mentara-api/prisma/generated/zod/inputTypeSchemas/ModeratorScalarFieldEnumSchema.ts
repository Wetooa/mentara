import { z } from 'zod';

export const ModeratorScalarFieldEnumSchema = z.enum(['userId','permissions','assignedCommunities','createdAt','updatedAt']);

export default ModeratorScalarFieldEnumSchema;
